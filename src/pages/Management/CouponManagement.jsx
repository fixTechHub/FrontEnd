import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Select,
  Card,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  resetState,
  restoreCoupon,
  fetchDeletedCoupons,
} from '../../features/coupons/couponSlice';

const { Option } = Select;

const CouponManagement = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error, success, deletedCoupons } = useSelector((state) => state.coupon);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(resetState());
    }
    if (success) {
      message.success(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
      dispatch(resetState());
      setIsModalVisible(false);
      form.resetFields();
    }
  }, [error, success, dispatch, editingCoupon, form]);

  useEffect(() => {
    if (showDeleted) {
      dispatch(fetchDeletedCoupons());
    }
  }, [showDeleted, dispatch]);

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <span>
          {record.value}
          <Tag color={record.type === 'PERCENT' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
            {record.type === 'PERCENT' ? '%' : '$'}
          </Tag>
        </span>
      ),
    },
    {
      title: 'Valid Period',
      key: 'validPeriod',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>From: {new Date(record.startDate).toLocaleDateString()}</div>
          <div>To: {new Date(record.endDate).toLocaleDateString()}</div>
        </Space>
      ),
    },
    {
      title: 'Min Order',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (text) => `$${text}`,
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>Used: {record.usedCount}</div>
          <div>Limit: {record.totalUsageLimit}</div>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this coupon?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (coupon) => {
    console.log('Editing coupon data:', coupon);
    setEditingCoupon(coupon);
    form.setFieldsValue({
      ...coupon,
      startDate: dayjs(coupon.startDate),
      endDate: dayjs(coupon.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    console.log('Deleting coupon with ID:', id);
    dispatch(deleteCoupon(id)).then((action) => {
      if (action.payload?.message) {
        message.success(action.payload.message);
      }
    });
  };

  const handleSubmit = async (values) => {
    console.log('Raw form values:', values);
    const couponData = {
      code: values.code,
      description: values.description,
      type: values.type.toUpperCase(),
      value: values.value,
      maxDiscount: values.maxDiscount,
      minOrderValue: values.minOrderValue,
      totalUsageLimit: values.totalUsageLimit,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      isActive: true,
      audience: "ALL",
      userIds: []
    };
    console.log('Transformed coupon data:', couponData);

    if (editingCoupon) {
      console.log('Updating coupon:', {
        id: editingCoupon.id,
        originalData: editingCoupon,
        newData: couponData
      });
      dispatch(updateCoupon({ 
        id: editingCoupon.id, 
        couponData 
      }));
    } else {
      dispatch(createCoupon(couponData));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder="Search coupons..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add New Coupon
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} coupons`,
          }}
        />
      </Card>

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Coupon Code"
                rules={[{ required: true, message: 'Please enter coupon code' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Discount Type"
                rules={[{ required: true, message: 'Please select discount type' }]}
              >
                <Select>
                  <Option value="PERCENT" >Percentage</Option>
                  <Option value="FIXED">Fixed Amount</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label="Discount Value"
                rules={[{ required: true, message: 'Please enter discount value' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Minimum Order Value"
                rules={[{ required: true, message: 'Please enter minimum order value' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDiscount"
                label="Maximum Discount"
                rules={[{ required: true, message: 'Please enter maximum discount' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalUsageLimit"
                label="Usage Limit"
                rules={[{ required: true, message: 'Please enter usage limit' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCoupon ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Button onClick={() => setShowDeleted(true)}>
        Xem coupon đã xóa
      </Button>

      <Modal
        open={showDeleted}
        title="Danh sách coupon đã xóa"
        onCancel={() => setShowDeleted(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            { title: 'Code', dataIndex: 'code', key: 'code' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Button
                  type="primary"
                  onClick={() => {
                    dispatch(restoreCoupon(record.id)).then((action) => {
                      if (action.payload?.message) {
                        message.success(action.payload.message);
                        dispatch(fetchDeletedCoupons());
                      }
                    });
                  }}
                >
                  Khôi phục
                </Button>
              ),
            },
          ]}
          dataSource={deletedCoupons}
          rowKey="id"
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default CouponManagement; 