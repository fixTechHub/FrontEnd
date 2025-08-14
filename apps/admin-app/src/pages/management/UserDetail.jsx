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
      { title: 'Mã đơn hàng', dataIndex: 'bookingCode', key: 'bookingCode' },
      { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName', render: (_, r) => serviceMap[r.serviceId] || r.serviceName || r.serviceId },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag>{formatStatusLabel(s)}</Tag> },
      { title: 'Thời gian tạo đơn hàng', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
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
    try {
      const notifyData = {
        userId: user.id,
        title: 'Cảnh cáo tài khoản',
        content: notificationContent,
        // referenceId: user.id,
        // referenceModel: 'User',

        type: 'NEW_REQUEST'
      }
      // console.log(notifyData);

      await dispatch(sendNotificationsThunk(notifyData)).unwrap();
      message.success('Gửi cảnh cáo thành công!');
      setIsModalOpen(false); // Đóng modal sau khi gửi thành công
      setNotificationContent('');
    } catch (error) {
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
          <div style={{ color: 'red' }}>Không thể tải thông tin người dùng.</div>
          <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
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
                  <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
                </Space>

                <Card title="Thông tin người dùng" bordered={false} style={{ borderRadius: 12 }}>
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
                      <br></br>
                      <div>
                      <Button type="primary" onClick={() => setIsModalOpen(true)}>Gửi Cảnh Cáo</Button>
                      </div>
                    </div>
                  </div>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Họ và tên">{user.fullName || ''}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{user.phone || ''}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò">{user.roleName || user.role || ''}</Descriptions.Item>
                    <Descriptions.Item label="Mã người dùng">{user.userCode || ''}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{statusTag(user.status)}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo">{formatDateTime(user.createdAt)}</Descriptions.Item>
                    {user.address && (
                      <Descriptions.Item label="Địa chỉ" span={2}>{formatAddressValue(user.address)}</Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* Locked Reason - Hiển thị riêng */}
                  {user.lockedReason && (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 12, color: '#333', fontSize: '16px', fontWeight: '600' }}>
                        Lý Do Khóa Tài Khoản
                      </h4>
                      <div style={{ 
                        background: '#fff2f0', 
                        border: '1px solid #ffccc7', 
                        borderRadius: '8px', 
                        padding: '16px',
                        color: '#cf1322',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        <strong>⚠️ Lý do:</strong> {user.lockedReason}
                      </div>
                    </div>
                  )}
                </Card>

                <Tabs
                  items={[
                    {
                      key: 'bookings',
                      label: 'Các đơn hàng của người dùng',
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

