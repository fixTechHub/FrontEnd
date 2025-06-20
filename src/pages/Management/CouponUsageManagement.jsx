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
  Modal,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchCouponUsages,
  fetchCouponUsageById,
  resetState,
} from '../../features/couponusages/couponUsageSlice';

// Helper function to safely truncate ID
const truncateId = (id) => {
  if (!id) return 'N/A';
  return typeof id === 'string' ? `${id.substring(0, 8)}...` : id.toString();
};

const CouponUsageManagement = () => {
  const dispatch = useDispatch();
  const { usages, loading, error, success } = useSelector((state) => state.couponUsage);
  const [searchText, setSearchText] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUsage, setDetailUsage] = useState(null);

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
      dataIndex: 'id',
      key: 'id',
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetails(record.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const handleViewDetails = (id) => {
    dispatch(fetchCouponUsageById(id)).then((action) => {
      console.log('Chi tiết usage trả về:', action.payload);
      if (action.payload) {
        setDetailUsage(action.payload);
        setDetailModalOpen(true);
      } else {
        message.error('Không thể lấy chi tiết usage!');
      }
    });
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
          rowKey={(record) => record?.id || Math.random().toString()}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usages`,
          }}
          onRow={(record) => ({
            onClick: () => handleViewDetails(record.id),
          })}
        />
      </Card>

      <Modal
        open={detailModalOpen}
        title="Chi tiết sử dụng coupon"
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
      >
        {detailUsage ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">
              {detailUsage.id || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Coupon ID">{detailUsage.couponId || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="User ID">{detailUsage.userId || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Booking ID">{detailUsage.bookingId || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Used At">
              {detailUsage.usedAt ? dayjs(detailUsage.usedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Đang tải...</p>
        )}
      </Modal>
    </div>
  );
};

export default CouponUsageManagement;