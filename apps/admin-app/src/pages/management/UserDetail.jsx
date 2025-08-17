import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Spin, message, Tabs, Table, Avatar, Modal, Input, Select } from 'antd';
const { TextArea } = Input;
import { ArrowLeftOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { userAPI } from '../../features/users/userAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { createExportData, formatDateTime, formatStatus } from '../../utils/exportUtils';
import { sendNotificationsThunk } from '../../features/notifications/notificationsSlice';
import { useDispatch } from 'react-redux';
const statusTag = (status) => {
  const colorMap = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    LOCKED: 'red',
  };
  return <Tag color={colorMap[status] || 'default'}>{status || 'UNKNOWN'}</Tag>;
};

const formatAddressValue = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [addr.street, addr.district, addr.city].filter(Boolean);
  return parts.length ? parts.join(', ') : '';
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
  const [searchText, setSearchText] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [isLocking, setIsLocking] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
 
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
        setAllServices(services); // Thêm dòng này để có dữ liệu cho filter
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



  // Logic filter cho bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const bookingCode = (b.bookingCode || '').toLowerCase();
      const service = (serviceMap[b.serviceId] || '').toLowerCase();
      const status = (b.status || '').toLowerCase();
      const search = searchText.toLowerCase();

      return (
        (bookingCode.includes(search) ||
         service.includes(search) ||
         status.includes(search)) &&
        (!filterService || b.serviceId === filterService) &&
        (!filterStatus || b.status === filterStatus)
      );
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất trước
  }, [bookings, searchText, filterService, filterStatus, serviceMap]);

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
    const exportData = filteredBookings.map((b) => ({
      bookingCode: b.bookingCode,
      serviceName: serviceMap[b.serviceId] || b.serviceName || b.serviceId,
      status: formatStatusLabel(b.status),
      createdAt: formatDateTime(b.createdAt),
    }));
    createExportData(exportData, exportColumns, `user_${id}_bookings`, 'UserBookings');
  }, [filteredBookings, bookingColumns, id, serviceMap]);
  const handleSendWarningToUser = async () => {
    if (!notificationContent.trim()) {
      message.error('Please enter notification content');
      return;
    }
    try {
      const notificationData = {
        userId: user.id,
        title: 'Cảnh cáo tài khoản',
        content: notificationContent,
        referenceId: user.id,
        referenceModel: 'User',

        type: 'NEW_REQUEST'
      }
      // console.log(notifyData);

      await dispatch(sendNotificationsThunk(notificationData)).unwrap();
      message.success('Gửi cảnh cáo thành công!');
      setIsModalOpen(false); // Đóng modal sau khi gửi thành công
      setNotificationContent('');
    } catch (error) {
      console.log(error);
      message.error('Gửi cảnh cáo thất bại!');
    }
  }

  const handleLockUser = async () => {
    if (!lockReason.trim()) {
      message.error('Vui lòng nhập lý do khóa tài khoản');
      return;
    }
    
    try {
      setIsLocking(true);
      await userAPI.lockUser(user.id, { lockedReason: lockReason });
      message.success('Khóa tài khoản thành công!');
      
      // Reload user data to get updated status
      const updatedUser = await userAPI.getById(id);
      setUser(updatedUser);
      
      setIsLockModalOpen(false);
      setLockReason('');
    } catch (error) {
      console.error('Lock user error:', error);
      message.error('Khóa tài khoản thất bại!');
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockUser = async () => {
    try {
      await userAPI.unlockUser(user.id);
      message.success('Mở khóa tài khoản thành công!');
      
      // Reload user data to get updated status
      const updatedUser = await userAPI.getById(id);
      setUser(updatedUser);
      setShowUnlockModal(false);
    } catch (error) {
      console.error('Unlock user error:', error);
      message.error('Mở khóa tài khoản thất bại!');
    }
  };

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

                <Card title="Thông tin người dùng" variant="borderless" style={{ borderRadius: 12 }}>
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
                      <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
                        <Button type="primary" onClick={() => setIsModalOpen(true)}>Gửi Cảnh Cáo</Button>
                        
                        {/* Lock/Unlock Button */}
                        {user.lockedReason ? (
                          <Button 
                            type="primary" 
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            icon={<UnlockOutlined />}
                            onClick={() => setShowUnlockModal(true)}
                          >
                            Mở Khóa Tài Khoản
                          </Button>
                        ) : (
                          <Button 
                            type="primary" 
                            danger 
                            icon={<LockOutlined />}
                            onClick={() => setIsLockModalOpen(true)}
                          >
                            Khóa Tài Khoản
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Họ và tên" span={1}>{user.fullName || ''}</Descriptions.Item>
                    <Descriptions.Item label="Email" span={1}>{user.email}</Descriptions.Item>
                    <Descriptions.Item label="SĐT" span={1}>{user.phone || ''}</Descriptions.Item>
                    <Descriptions.Item label="Vai trò" span={1}>{user.roleName || user.role || ''}</Descriptions.Item>
                    <Descriptions.Item label="Mã người dùng" span={1}>{user.userCode || ''}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={1}>{statusTag(user.status)}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo" span={1}>{formatDateTime(user.createdAt)}</Descriptions.Item>
                    
                      <Descriptions.Item label="Địa chỉ" span={2}>{formatAddressValue(user.address)}</Descriptions.Item>
                    
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
                        <div>
                          {/* Search và Filter Controls */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            flexWrap: 'wrap',
                            gap: 16,
                            marginBottom: 16,
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              {/* Search Input */}
                              <div className="top-search">
             <div className="top-search-group">
               <span className="input-icon">
                 <i className="ti ti-search"></i>
               </span>
               <input
                 type="text"
                 className="form-control"
                 placeholder="Tìm kiếm đơn hàng..."
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>

                              {/* Service Filter */}
                              <Select
                                placeholder="Dịch vụ"
                                value={filterService || undefined}
                                onChange={(value) => setFilterService(value)}
                                style={{ width: 150 }}
                                allowClear
                              >
                                {allServices.map(s => (
                                  <Select.Option key={s.id} value={s.id}>
                                    {s.serviceName || s.name}
                                  </Select.Option>
                                ))}
                              </Select>

                              {/* Status Filter */}
                              <Select
                                placeholder="Trạng thái"
                                value={filterStatus || undefined}
                                onChange={(value) => setFilterStatus(value)}
                                style={{ width: 130 }}
                                allowClear
                              >
                                <Select.Option value="PENDING">PENDING</Select.Option>
                                <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                                <Select.Option value="WAITING_CONFIRM">WAITING CONFIRM</Select.Option>
                                <Select.Option value="IN_PROGRESS">IN PROGRESS</Select.Option>
                                <Select.Option value="CONFIRMED">CONFIRMED</Select.Option>
                                <Select.Option value="DONE">DONE</Select.Option>
                                <Select.Option value="AWAITING_CONFIRM">AWAITING CONFIRM</Select.Option>
                                <Select.Option value="CONFIRM_ADDITIONAL">CONFIRM ADDITIONAL</Select.Option>
                                <Select.Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">WAITING CUSTOMER CONFIRM ADDITIONAL</Select.Option>
                                <Select.Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">WAITING TECHNICIAN CONFIRM ADDITIONAL</Select.Option>
                                <Select.Option value="AWAITING_DONE">AWAITING DONE</Select.Option>
                              </Select>
                            </div>

                            
                          </div>

                          {/* Filter Info */}
                          {(searchText || filterService || filterStatus) && (
         <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
           <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
           {searchText && (
             <span className="badge bg-primary-transparent">
               <i className="ti ti-search me-1"></i>
               Tìm kiếm: "{searchText}"
             </span>
           )}
           {filterService && (
             <span className="badge bg-info-transparent">
               <i className="ti ti-tools me-1"></i>
               Dịch vụ: {serviceMap[filterService] || filterService}
             </span>
           )}
           {filterStatus && (
             <span className="badge bg-warning-transparent">
               <i className="ti ti-filter me-1"></i>
               Trạng thái: {filterStatus.replace(/_/g, ' ')}
             </span>
           )}
           <button 
             className="btn btn-sm btn-outline-secondary"
             onClick={() => {
               setSearchText('');
               setFilterService('');
               setFilterStatus('');
             }}
           >
             <i className="ti ti-x me-1"></i>
             Xóa tất cả
           </button>
         </div>
       )}

                          <Table
                            rowKey={(r) => r.id}
                            dataSource={filteredBookings}
                            columns={bookingColumns}
                            pagination={{ 
                              pageSize: 10,
                              showSizeChanger: false
                            }}
                          />
                        </div>
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

  {/* Lock User Modal */}
  {isLockModalOpen && (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        zIndex: 2000,
        background: 'rgba(0,0,0,0.2)',
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
        <div className="modal-content">
          <form onSubmit={(e) => { e.preventDefault(); handleLockUser(); }}>
            <div className="modal-header">
              <h5 className="mb-0">Khóa người dùng</h5>
              <button type="button" className="btn-close" onClick={() => setIsLockModalOpen(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body pb-1">
              <div className="alert alert-warning">
                <i className="ti ti-alert-triangle me-2"></i>
                Bạn có chắc chắn muốn khóa người dùng: <strong>{user?.fullName}</strong>?
              </div>
              <div className="mb-3">
                <label className="form-label">Lý do khóa<span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Hãy cung cấp lý do để khóa người dùng..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <div className="d-flex justify-content-end w-100">
                <button type="button" className="btn btn-light me-3" onClick={() => setIsLockModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-danger" disabled={isLocking}>
                  {isLocking ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}

  {/* Unlock Modal */}
  {showUnlockModal && (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        zIndex: 2000,
        background: 'rgba(0,0,0,0.2)',
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
        <div className="modal-content">
          <form onSubmit={(e) => { e.preventDefault(); handleUnlockUser(); }}>
            <div className="modal-header">
              <h5 className="mb-0">Mở khóa người dùng</h5>
              <button type="button" className="btn-close" onClick={() => setShowUnlockModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body pb-1">
              <div className="alert alert-info">
                <i className="ti ti-info-circle me-2"></i>
                Bạn có chắc chắn muốn mở khóa người dùng: <strong>{user?.fullName}</strong>?
              </div>
            </div>
            <div className="modal-footer">
              <div className="d-flex justify-content-end w-100">
                <button type="button" className="btn btn-light me-3" onClick={() => setShowUnlockModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-success">Xác nhận</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
   </>
  );
}

