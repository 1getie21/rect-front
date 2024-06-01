import React, {useEffect, useState} from 'react';
import {Button, Col, Divider, Drawer, Form, Input, notification, Popconfirm, Row, Table} from "antd";
import axiosInstance from "../auth/authHeader";

const Site = () => {
    const [data, setData] = useState([]);
    const [dataById, setDataById] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addNewMode, setAddNewMode] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const cancel = (e) => {
    };
    const apiUrl = "http://localhost:8080";

    const openNotificationWithIcon = (type, messageTitle, description) => {
        api[type]({
            message: messageTitle,
            description: description,
        });
    };
    const getAllData = () => {
        axiosInstance.get(apiUrl + "/sites")
            .then(response => {
                    setData(response?.data?._embedded?.sitesDtoses);
                    setLoading(false);
                },
                error => {
                    setLoading(false);
                    openNotificationWithIcon('error', 'Error', error?.message)
                }
            );
    };

    const getDataById = (id) => {
        axiosInstance.get(apiUrl + "/sites/" + id)
            .then(response => {
                    setDataById(response?.data);
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                }
            );
    };

    const deleteById = (id) => {
        axiosInstance.delete(apiUrl + "/sites/" + id)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is added successfully.')
                    getAllData();
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                }
            );
    };

    const addNewRecord = (values) => {
        axiosInstance.post(apiUrl + "/sites", values)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is added successfully.')
                    getAllData();
                    setOpen(false);
                    setDataById(null);
                },
                error => {
                    console.log("Error=", error)
                    openNotificationWithIcon('error', 'Error', error?.message)
                }
            );
    };
    const updateRecordById = (data, id) => {
        axiosInstance.put(apiUrl + "/sites/" + id, data)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is updated successfully.')
                    getAllData();
                    setOpen(false);
                    setDataById(null);
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                });
    };
    const showDrawer = (id) => {
        setOpen(true);
        if (id === undefined) {
            setAddNewMode(true);
        } else {
            setDataById(null);
            getDataById(id);
            setAddNewMode(false);
        }
    };

    const onSubmitClick = (values) => {
        if (addNewMode) {
            addNewRecord(values);
        } else {
            updateRecordById(values, dataById.id);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    useEffect(() => {
        getAllData();
    }, []);
    const columns = [
        {
            title: '#',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        // {
        //     title: 'Id',
        //     dataIndex: 'id',
        //     key: 'id',
        // },
        {
            title: 'Site Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    {/* eslint-disable jsx-a11y/anchor-is-valid */}
                    <a onClick={() => showDrawer(record.id)}>Update</a>
                    {/* eslint-enable jsx-a11y/anchor-is-valid */}
                    <Divider type="vertical"/>
                     <Popconfirm
                         title="Delete the task"
                         description="Are you sure to delete this task?"
                         onConfirm={() => deleteById(record.id)}
                         onCancel={cancel}
                         okText="Yes"
                         cancelText="No">
                        <a>Delete</a>
                      </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <>
            {contextHolder}
            <Row justify="end" style={{marginBottom: 16}}>
                <Col>
                    <Button onClick={() => showDrawer(undefined)}>Add New Record</Button>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Table loading={loading} columns={columns} dataSource={data} rowKey="id"/>
                </Col>
            </Row>
            <Drawer
                title="Basic Drawer"
                placement="right"
                onClose={() => setOpen(false)}
                visible={open}
            >
                {(addNewMode || dataById) && (
                    <Form
                        layout="vertical"
                        initialValues={dataById}
                        onFinish={onSubmitClick}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{required: true, message: 'Please input sites name!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label="Url"
                            name="url"
                            rules={[{required: true, message: 'Please input url!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Submit</Button>
                        </Form.Item>
                    </Form>
                )}
            </Drawer>
        </>
    );
};

export default Site;
