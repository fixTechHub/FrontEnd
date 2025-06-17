import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  message,
  Card,
  Row,
  Col,
  Input,
  Tag,
} from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchCouponUsages,
  fetchCouponUsageById,
  resetState,
} from '../features/couponusages/couponUsageSlice';

// Helper function to safely truncate ID
const truncateId = (id) => {
  if (!id) return 'N/A';
  return typeof id === 'string' ? `${id.substring(0, 8)}...` : id.toString();
};

const CouponUsageManagement = () => {
  const dispatch = useDispatch();
  const { usages, loading, error, success } = useSelector((state) => state.couponUsage);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchCouponUsages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(resetState());
    }
  }, [error, dispatch]);

  // Filter usages based on search text
  const filteredUsages = usages.filter(usage =>
    usage.couponId.toLowerCase().includes(searchText.toLowerCase()) ||
    usage.userId.toLowerCase().includes(searchText.toLowerCase()) ||
    usage.bookingId.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => truncateId(id),
    },
    {
      title: 'Coupon ID',
      dataIndex: 'couponId',
      key: 'couponId',
      render: (id) => truncateId(id),
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (id) => truncateId(id),
    },
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id) => truncateId(id),
    },
    {
      title: 'Used At',
      dataIndex: 'usedAt',
      key: 'usedAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      sorter: (a, b) => {
        if (!a.usedAt || !b.usedAt) return 0;
        return dayjs(a.usedAt).unix() - dayjs(b.usedAt).unix();
      },
    },
  ];

  const handleViewDetails = (id) => {
    if (id) {
      dispatch(fetchCouponUsageById(id));
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Coupon Usage Management">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder="Search by Coupon ID, User ID, or Booking ID..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsages}
          rowKey={(record) => record?._id || Math.random().toString()}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usages`,
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetails(record?._id),
          })}
        />
      </Card>
    </div>
  );
};

export default CouponUsageManagement;