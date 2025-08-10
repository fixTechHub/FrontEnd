import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Spin, message, Tabs, Table, Avatar, Modal, Input } from 'antd';
const { TextArea } = Input;
import { ArrowLeftOutlined } from '@ant-design/icons';
import { userAPI } from '../../features/users/userAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { createExportData, formatDateTime, formatStatus } from '../../utils/exportUtils';
import { sendNotificationsThunk } from '../../features/notifications/notificationsSlice';
import { useDispatch } from 'react-redux';
const statusTag = (status) => {
  const colorMap = {
    ACTIVE: 'green',
    INACTIVE: 'default',
    LOCKED: 'red',
  };
  return <Tag color={colorMap[status] || 'default'}>{status || 'UNKNOWN'}</Tag>;
};

const formatAddressValue = (addr) => {
  if (!addr) return 'N/A';
  if (typeof addr === 'string') return addr;
  const parts = [addr.street, addr.district, addr.city].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
};

const formatStatusLabel = (status) => {
  if (!status) return '';
  return String(status).replace(/_/g, ' ');
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [serviceMap, setServiceMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [u, allBookings, services] = await Promise.all([
          userAPI.getById(id),
          bookingAPI.getAll(),
          serviceAPI.getAll(),
        ]);
        if (!u) {
          message.error('User not found');
          navigate('/admin/user-management');
          return;
        }
        setUser(u);
        const sm = {};
        (services || []).forEach(s => {
          sm[s.id] = s.serviceName || s.name;
        });
        setServiceMap(sm);
        const userBookings = (allBookings || []).filter(
          (b) => b.customerId === u.id || b.technicianId === u.technicianId || b.createdBy === u.id
        );
        setBookings(userBookings);
      } catch (e) {
        setError(e);
        message.error('Failed to load user detail');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const bookingColumns = useMemo(
    () => [
      { title: 'Booking Code', dataIndex: 'bookingCode', key: 'bookingCode' },
      { title: 'Service', dataIndex: 'serviceName', key: 'serviceName', render: (_, r) => serviceMap[r.serviceId] || r.serviceName || r.serviceId },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag>{formatStatusLabel(s)}</Tag> },
      { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
    ],
    [serviceMap]
  );

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const exportColumns = bookingColumns.map((c) => ({ title: c.title, dataIndex: c.dataIndex }));
    const exportData = bookings.map((b) => ({
      bookingCode: b.bookingCode,
      serviceName: serviceMap[b.serviceId] || b.serviceName || b.serviceId,
      status: formatStatusLabel(b.status),
      createdAt: formatDateTime(b.createdAt),
    }));
    createExportData(exportData, exportColumns, `user_${id}_bookings`, 'UserBookings');
  }, [bookings, bookingColumns, id, serviceMap]);
  const handleSendWarningToUser = async () => {
    if (!notificationContent.trim()) {
      message.error('Please enter notification content');
      return;
    }
    try{
      const notifyData = {
        userId: user.id,
        title: 'Cảnh cáo tài khoản',
        content: notificationContent,
        type: 'NEW_REQUEST'
      }
      await dispatch(sendNotificationsThunk(notifyData)).unwrap();
      message.success('Gửi cảnh cáo thành công!');
      setIsModalOpen(false); // Đóng modal sau khi gửi thành công
      setNotificationContent('');
    }catch(error) {
      console.log(error);
       message.error('Gửi cảnh cáo thất bại!');
    }
  }
  if (loading) {
    return (
      <div className="container-fluid">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <Card>
          <div style={{ color: 'red' }}>Failed to load user detail.</div>
          <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back</Button>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
   <>
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="container-fluid">
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back</Button>
                </Space>

                <Card title="User Profile" bordered={false} style={{ borderRadius: 12 }}>
                  <div style={{display:'flex', alignItems:'center', gap:24, marginBottom:16}}>
                    <Avatar
                      size={80}
                      src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                      style={{flexShrink:0}}
                    >
                      {(user.fullName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{flex:1}}>
                      <div style={{fontSize:20, fontWeight:600}}>{user.fullName || 'N/A'}</div>
                      <div style={{color:'#888', marginTop:4}}>ID: {user.id}</div>
                      <div>
                      <Button type="primary" onClick={() => setIsModalOpen(true)}>Gửi Cảnh Cáo</Button>
                      </div>
                    </div>
                  </div>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Full Name">{user.fullName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{user.phone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Role">{user.roleName || user.role || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="User Code">{user.userCode || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Status">{statusTag(user.status)}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{formatDateTime(user.createdAt)}</Descriptions.Item>
                    {user.lockedReason && (
                      <Descriptions.Item label="Locked Reason" span={2}>{user.lockedReason}</Descriptions.Item>
                    )}
                    {user.address && (
                      <Descriptions.Item label="Address" span={2}>{formatAddressValue(user.address)}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>

                <Tabs
                  items={[
                    {
                      key: 'bookings',
                      label: 'Bookings',
                      children: (
                        <Table
                          rowKey={(r) => r.id}
                          dataSource={bookings}
                          columns={bookingColumns}
                          pagination={{ pageSize: 10 }}
                        />
                      ),
                    },
                  ]}
                />
              </Space>
        </div>
      </div>
    </div>
    <Modal
    title="Gửi Cảnh Cáo"
    open={isModalOpen}
    onOk={handleSendWarningToUser}
    onCancel={() => {
      setIsModalOpen(false);
      setNotificationContent('');
    }}
    okText="Gửi"
    cancelText="Hủy"
  >
    <TextArea
      rows={4}
      value={notificationContent}
      onChange={(e) => setNotificationContent(e.target.value)}
      placeholder="Nhập nội dung cảnh cáo"
    />
  </Modal>
   </>
  );
}

