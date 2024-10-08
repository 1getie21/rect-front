import React, {useEffect, useState} from 'react';
import AuthService from "../auth/AuthService ";
import {
    Button,
    Col,
    DatePicker,
    Collapse,
    RangePicker as AntRangePicker,
    Divider,
    Drawer,
    Form,
    Input,
    notification,
    Popconfirm,
    Row,
    Select,
    Table,
    Tag
    ,
    Tooltip
} from "antd";
import axiosInstance from "../auth/authHeader";
import {CloudDownloadOutlined, EditOutlined, EyeOutlined, DeleteOutlined} from "@ant-design/icons";

const {RangePicker} = DatePicker;


const Request = () => {
    const logedInUser = AuthService.getCurrentUser();
    const listOfRoles = AuthService?.getRoles();

    const [data, setData] = useState([]);
    const [dataById, setDataById] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addNewMode, setAddNewMode] = useState(false);
    const [api, contextHolder] = notification.useNotification();

    //const API_URL = "http://localhost:7070";
   const API_URL = "http://10.10.10.204:8080/TeamOpsSystem-0.0.1-SNAPSHOT";

    const [trForm] = Form.useForm();
    const [date, setDate] = useState('');
    const [selectedFile1, setSelectedFile1] = useState(null);
    //const [selectedFile2, setSelectedFile2] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile1(event.target.files[0]);
    };
    // const handleFileChange2 = (event) => {
    //     setSelectedFile2(event.target.files[0]);
    // };


    const SubmitButton = ({form: trafficForm, children}) => {
        const [submittable, setSubmittable] = React.useState(false);
        const values = Form.useWatch([], trafficForm);
        React.useEffect(() => {
            trafficForm.validateFields({
                validateOnly: true,
            })
                .then(() => setSubmittable(true))
                .catch(() => setSubmittable(false));
        }, [trafficForm, values]);

        return (
            <Button type="primary" htmlType="submit" disabled={!submittable}>
                {children}
            </Button>
        );
    };

    const getAllData = () => {
        axiosInstance.get(API_URL + "/request")
            .then(response => {
                    setData(response?.data?._embedded?.requestDtoses);
                    setLoading(false);
                },
                error => {
                    setLoading(false);
                    openNotificationWithIcon('error', 'Error', error?.message)
                });
    };
    const getDataById = (id) => {
        axiosInstance.get(API_URL + "/request/" + id)
            .then(response => {
                    setDataById(response.data);
                    trForm.setFieldsValue(response.data);
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                });
    };

    const openNotificationWithIcon = (type, messageTitle, description) => {
        api[type]({
            message: messageTitle,
            description: description,

        });
    };
    const addFIle = () => {
        const formData = new FormData();
        formData.append('file', selectedFile1);
        //formData.append('file2', selectedFile2);
        axiosInstance.post(API_URL + '/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
    const addNewRecord = (values) => {
        addFIle();
        axiosInstance.post(API_URL + "/request", values)
            .then(response => {
                openNotificationWithIcon('success', 'Success', 'New Recorded Is added successfully.')
                getAllData();
                setOpen(false);
                setDataById(null);

            }, error => {
                if (error?.response?.data?.apierror?.subErrors?.length > 0) {
                    openNotificationWithIcon('error', 'Error '
                        , error?.response?.data?.apierror?.message
                        + " " + error?.response?.data?.apierror?.subErrors[0]?.field + " " + error?.response?.data?.apierror?.subErrors[0]?.message)
                } else {
                    openNotificationWithIcon('error',
                        'Error ~' + error?.response?.data?.apierror?.status
                        , error?.response?.data?.apierror?.message)

                }
            })
    };
    const updateRecordById = (data, id) => {

        addFIle();
        axiosInstance.put(API_URL + "/request/" + id, data)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is updated successfully.')
                    getAllData();
                    setOpen(false);
                    setDataById(null);
                }
                , error => {
                    if (error?.response?.data?.apierror?.subErrors?.length > 0) {
                        openNotificationWithIcon('error', 'Error '
                            , error?.response?.data?.apierror?.message
                            + " " + error?.response?.data?.apierror?.subErrors[0]?.field + " " + error?.response?.data?.apierror?.subErrors[0]?.message)
                    } else {
                        openNotificationWithIcon('error',
                            'Error ~' + error?.response?.data?.apierror?.status
                            , error?.response?.data?.apierror?.message)
                    }
                }
            );
    };

    const showDrawer = (id) => {
        setDataById(null);
        setOpen(true);
        trForm.resetFields();
        if (id === undefined) {
            setAddNewMode(true);
        } else {
            setDataById(null);
            getDataById(id);
            setAddNewMode(false);
        }
    };

    const onSearchSubmitClick = (values) => {
        const fromDate = values.from[0].format('YYYY-MM-DD');
        const toDate = values.from[1].format('YYYY-MM-DD');
        setDate('/' + fromDate + '/' + toDate);
        axiosInstance.get(`${API_URL}/request/${fromDate}/${toDate}`)
            .then(
                response => {
                    setData(response?.data?._embedded?.requestDtoses);
                    setLoading(false);
                },
                error => {
                    setLoading(false);
                    openNotificationWithIcon('error', 'Error', error?.message)
                });
    };

    const onSearchFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onSubmitClick = (values) => {
        //values.detailFile = selectedFile2?.name
        values.descriptionFile = selectedFile1?.name
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
    }, []); // empty dependency array means this effect runs only once, similar to componentDidMount
    const confirm = (id) => {
        axiosInstance.delete(API_URL + "/request/" + id)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is deleted successfully.')
                    getAllData();
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                })
    };
    const confirmAccept = (id) => {
        axiosInstance.get(API_URL + "/request/accept/" + id)
            .then(response => {
                    openNotificationWithIcon('success', 'Success', 'Data Is accepted successfully.')
                    getAllData();
                },
                error => {
                    openNotificationWithIcon('error', 'Error', error?.message)
                })
    };
    const cancel = (e) => {
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            key: 'id',
            render: (text, record, index) => index + 1,
        },

        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => {
                const date = new Date(text);
                const options = {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                };
                const formattedDate = date.toLocaleDateString('en-US', options);
                return <span>{formattedDate}</span>;
            },
        },

        {
            title: 'Name',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',

        },

        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Request',
            dataIndex: 'requester',
            key: 'requester',
        },

        {
            title: 'Organization',
            dataIndex: 'organization',
            key: 'organization',
        },
        {
            title: 'Categories',
            dataIndex: 'categories',
            key: 'categories',
        },


        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',

        },


        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },

        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',

            render: (text, record) => (
                <>
                    {record?.priority === 'HIGH' && (
                        <Tag color="red">{record?.priority}</Tag>
                    )}
                    {record?.priority === 'MEDIUM' && (
                        <Tag color="blue">{record?.priority}</Tag>
                    )}
                    {record?.priority === 'LOW' && (
                        <Tag color="green">{record?.priority}</Tag>
                    )}
                </>

            )
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <>
                    {record?.status === 'Pending' && (
                        <Tag color="blue">{record?.status}</Tag>
                    )}
                    {record?.status === 'Accepted' && (
                        <Tag color="green">{record?.status}</Tag>
                    )}
                </>
            )
        },

        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    {(record?.description || record?.descriptionFile) && (
                        <>
                            {record?.descriptionFile && (
                                <Tooltip title="download file">
                                    <a target="_blank" href={API_URL + "/files/" + record.descriptionFile}>
                                        <CloudDownloadOutlined style={{fontSize: '17px'}}/>
                                    </a>
                                </Tooltip>

                            )}
                        </>
                    )}

                    <Divider type="vertical"/>
                    {record?.status === 'Pending' && (
                        <>
                            {(listOfRoles.includes('ROLE_ADMIN') || listOfRoles.includes('ROLE_MEMBER')) && record?.status === 'Pending' && (
                                <Popconfirm
                                    title="Accept the request"
                                    description="Are you sure to accept this request?"
                                    onConfirm={() => confirmAccept(record.id)}
                                    onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Tooltip title="Accept">
                                        <EyeOutlined style={{ fontSize: '18px' }} />
                                    </Tooltip>
                                </Popconfirm>
                            )}
                            {listOfRoles.includes('ROLE_USER') && record?.status === 'Pending' && (
                                <Tooltip title="Accept (Read-Only)">
                                    <EyeOutlined style={{ fontSize: '18px' }} />
                                </Tooltip>
                            )}
                        </>
                    )}
                    {/*<Divider type="vertical"/>*/}
                    {/*/!* eslint-disable jsx-a11y/anchor-is-valid *!/*/}
                    {/*{(record?.status == 'Pending') && (*/}
                    {/*    <Popconfirm*/}
                    {/*        title="Accept the request"*/}
                    {/*        description="Are you sure to accept this request?"*/}
                    {/*        onConfirm={() => confirmAccept(record.id)}*/}
                    {/*        onCancel={cancel}*/}
                    {/*        okText="Yes"*/}
                    {/*        cancelText="No"*/}
                    {/*    >*/}
                    {/*        <Tooltip title="accept">*/}
                    {/*            <EyeOutlined style={{fontSize: '18px'}}/>*/}
                    {/*        </Tooltip>*/}
                    {/*    </Popconfirm>*/}
                    {/*)}*/}


                    <Divider type="vertical"/>

                    {listOfRoles && listOfRoles.includes('ROLE_USER') ? (
                        <>
                            <a onClick={() => showDrawer(record.id)}>
                                <Tooltip title="Update record">
                                    <EditOutlined style={{ fontSize: '16px' }} />
                                </Tooltip>
                            </a>
                            <Divider type="vertical"/>

                            {/* eslint-disable jsx-a11y/anchor-is-valid */}
                            <Popconfirm
                                title="Delete the request"
                                description="Are you sure to delete this request?"
                                onConfirm={() => confirm(record.id)}
                                onCancel={cancel}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Tooltip title="Delete record">
                                    <DeleteOutlined style={{ fontSize: '17px', color: 'red' }} />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    ) : null}

                </span>
            ),
        },
    ];

    return (
        <>
            {contextHolder}
            <Row gutter={16}>
                <Col span={14}>
                    <Collapse
                        items={[
                            {
                                key: '1',
                                label: 'Filter By Date Range',
                                children: (
                                    <Form
                                        name="validateOnly"
                                        layout="horizontal"
                                        onFinish={onSearchSubmitClick}
                                        onFinishFailed={onSearchFinishFailed}
                                    >
                                        <Row justify="start">
                                            <Col span={10}>
                                                <Form.Item
                                                    name="from"
                                                    rules={[
                                                        {
                                                            type: 'array',
                                                            required: true,
                                                            message: 'Please select the date range!'
                                                        }
                                                    ]}
                                                >
                                                    <RangePicker/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={1}></Col>
                                            <Col span={6}>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit">Submit</Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                ),
                            },
                        ]}
                    />
                </Col>
                <Col style={{textAlign: 'center'}}>
                    <Form.Item>
                        <Tooltip title="Download File">
                            {listOfRoles && listOfRoles.includes('ROLE_ADMIN') ? (
                                <a target="_blank" href={`${API_URL}/api/pdf/request${date}?userName=ROLE_ADMIN`}>
                                    <CloudDownloadOutlined style={{fontSize: '30px'}}/>
                                </a>
                            ) : (
                                <a target="_blank"
                                   href={`${API_URL}/api/pdf/request${date}?userName=${logedInUser?.username}`}>
                                    <CloudDownloadOutlined style={{fontSize: '30px'}}/>
                                </a>
                            )}
                        </Tooltip>
                    </Form.Item>
                </Col>
                <Col
                    span={5}></Col> {/* This empty column ensures space between the Download File button and the right edge of the row */}
            </Row>

            <Row justify="end" style={{marginBottom: 16}}>
                {listOfRoles && listOfRoles.includes('ROLE_USER') ? (
                    <Col>
                        <Button onClick={() => showDrawer(undefined)}>Add New Record</Button>
                    </Col>
                ) : (
                    <Col>
                    </Col>
                )}

            </Row>

            <Row>
                <Col span={24}>
                    <Table loading={loading} columns={columns} dataSource={data} rowKey="id"/>
                </Col>
            </Row>
            <Drawer
                title="Add New Request"
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
                            label="Phone"
                            name="phone"
                            rules={[
                                {required: true, message: 'Please input phone number!'},
                                {pattern: /^[0-9]+?$/, message: 'Please enter a valid phone number!'},
                                {len: 9, message: ''} // Add this rule for length validation
                            ]}
                        >
                            <Input addonBefore="+251"/>
                        </Form.Item>

                        <Form.Item
                            label="email"
                            name="email"
                            rules={[
                                {required: true, message: 'Please input your email!'},
                                {type: 'email', message: 'Please enter a valid email address!'},
                            ]}
                        >
                            <Input/>
                        </Form.Item>


                        <Form.Item label="requester" name="requester">
                            <Select
                                showSearch
                                placeholder="Select a requester"
                                optionFilterProp="children"
                                options={[
                                    {
                                        value: 'INSA CERT',
                                        label: 'INSA CERT',
                                    },
                                    {
                                        value: 'INSA / OPERATION',
                                        label: 'INSA / OPERATION',
                                    },
                                    {
                                        value: 'Federal government',
                                        label: 'Federal government',
                                    },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            label="organization"
                            name="organization"
                            rules={[{required: true, message: 'Please input organization!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="categories"
                            name="categories"  // Corrected the name from " categories" to "categories"
                            rules={[{required: true, message: 'Please select a category!'}]}  // Add validation rule
                        >
                            <Select
                                showSearch
                                placeholder="Select a category"
                                optionFilterProp="children"
                                options={[
                                    {
                                        value: 'Service Monitor',
                                        label: 'Service Monitor',
                                    },
                                    {
                                        value: 'Service Mirror',
                                        label: 'Service Mirror',
                                    },
                                    {
                                        value: 'Service Block',
                                        label: 'Service Block',
                                    },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            label="contact"
                            name="contact"
                            rules={[{required: true, message: 'Please input contact!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label="Description"
                            name="description">
                            <Input.TextArea placeholder="Enter text or upload a file"/>
                        </Form.Item>

                        {/* Option to upload a file */}
                        <Form.Item
                            label="Upload Description File">
                            <Input onChange={handleFileChange} type="file"/>
                        </Form.Item>

                        <Form.Item
                            label="Priority"
                            name="priority"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select a priority level',
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Select a priority"
                                optionFilterProp="children"
                                options={[
                                    { value: 'HIGH', label: 'HIGH' },
                                    { value: 'MEDIUM', label: 'MEDIUM' },
                                    { value: 'LOW', label: 'LOW' },
                                ]}
                            />
                        </Form.Item>
                        {/*<Button type="primary" htmlType="submit" form={form}>Submit</Button>*/}
                        <SubmitButton form={trForm}>Submit</SubmitButton>
                    </Form>
                )}
            </Drawer>
        </>
    );
};

export default Request;
