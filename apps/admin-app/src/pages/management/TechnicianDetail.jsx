import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Spin, message, Tabs, Table, Avatar, Select, Input, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { userAPI } from '../../features/users/userAPI';
import { categoryAPI } from '../../features/categories/categoryAPI';
import { financialReportAPI } from '../../features/financialReport/financialReportAPI';
import { createExportData, formatDateTime } from '../../utils/exportUtils';
import { formatCurrency } from '../../utils/formatCurrency';
import { fetchReportCounts } from '../../features/reports/reportSlice';
import { useDispatch, useSelector } from 'react-redux';
import { sendNotificationsThunk } from '../../features/notifications/notificationsSlice';
const { TextArea } = Input;

const statusTag = (status) => {
  const colorMap = {
    PENDING: 'default',
    APPROVED: 'green',
    REJECTED: 'red',
    INACTIVE: 'orange',
    VERIFIED: 'blue',
    BLOCKED: 'red',
  };
  const mappedStatus = statusMapping[status] || status || 'UNKNOWN';
  return <Tag color={colorMap[status] || 'default'}>{mappedStatus}</Tag>;
};

const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-success-transparent';
    case 'REJECTED':
      return 'bg-danger-transparent';
    case 'PENDING':
      return 'bg-warning-transparent';
    case 'INACTIVE':
      return 'bg-secondary-transparent';
    default:
      return 'bg-secondary-transparent';
  }
};

// Mapping availability từ tiếng Anh sang tiếng Việt
const availabilityMapping = {
  1: 'Đang Rảnh',
  2: 'Bận',
  0: 'Đang làm việc',
  'FREE': 'Đang Rảnh',
  'BUSY': 'Bận',
  'ONJOB': 'Đang làm việc'
};

// Mapping status từ tiếng Anh sang tiếng Việt
const statusMapping = {
  'APPROVED': 'Đã duyệt',
  'REJECTED': 'Từ chối',
  'PENDING': 'Đang chờ',
  'INACTIVE': 'Không hoạt động',
  'VERIFIED': 'Đã xác minh',
  'BLOCKED': 'Bị chặn',
  'approved': 'Đã duyệt',
  'rejected': 'Từ chối',
  'pending': 'Đang chờ',
  'inactive': 'Không hoạt động',
  'verified': 'Đã xác minh',
  'blocked': 'Bị chặn'
};

// Function để lấy màu sắc cho availability
const getAvailabilityColor = (availability) => {
  if (availability === 'FREE' || availability === 1) {
    return '#198754'; // Xanh lá đậm - Rảnh rỗi
  } else if (availability === 'ONJOB' || availability === 0) {
    return '#0d6efd'; // Xanh dương đậm - Đang làm việc
  } else if (availability === 'BUSY' || availability === 2) {
    return '#dc3545'; // Đỏ đậm - Bận
  } else {
    return '#6c757d'; // Xám - Không xác định
  }
};

const availabilityTag = (availability) => {
  const mappedAvailability = availabilityMapping[availability] || availability || 'UNKNOWN';
  const color = getAvailabilityColor(availability);
  return (
    <span style={{
      color: color,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {mappedAvailability}
    </span>
  );
};

const formatStatusLabel = (status) => (status ? String(status).replace(/_/g, ' ') : '');

// Mapping trạng thái đơn hàng từ tiếng Anh sang tiếng Việt
const bookingStatusMapping = {
  'PENDING': 'Đang chờ',
  'CANCELLED': 'Đã hủy',
  'WAITING_CONFIRM': 'Chờ xác nhận',
  'IN_PROGRESS': 'Đang xử lý',
  'CONFIRMED': 'Đã xác nhận',
  'DONE': 'Hoàn thành',
  'AWAITING_CONFIRM': 'Chờ xác nhận',
  'CONFIRM_ADDITIONAL': 'Xác nhận bổ sung',
  'WAITING_CUSTOMER_CONFIRM_ADDITIONAL': 'Chờ khách hàng xác nhận bổ sung',
  'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL': 'Chờ kỹ thuật viên xác nhận bổ sung',
  'AWAITING_DONE': 'Chờ hoàn thành'
};

// Function để lấy màu sắc cho trạng thái đơn hàng
const getBookingStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
    case 'WAITING_CONFIRM':
    case 'AWAITING_CONFIRM':
    case 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL':
    case 'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL':
    case 'AWAITING_DONE':
      return 'orange';
    case 'IN_PROGRESS':
      return 'blue';
    case 'CONFIRMED':
    case 'CONFIRM_ADDITIONAL':
      return 'green';
    case 'DONE':
      return 'green';
    case 'CANCELLED':
      return 'red';
    default:
      return 'default';
  }
};

// Mapping trạng thái thanh toán từ tiếng Anh sang tiếng Việt
const paymentStatusMapping = {
  'PAID': 'Đã thanh toán',
  'PENDING': 'Đang chờ',
  'CANCELLED': 'Đã hủy',
  'FAILED': 'Thất bại',
  'REFUNDED': 'Đã hoàn tiền'
};

// Function để lấy màu sắc cho trạng thái thanh toán
const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'PAID':
      return 'green';
    case 'PENDING':
      return 'orange';
    case 'CANCELLED':
      return 'red';
    case 'FAILED':
      return 'red';
    case 'REFUNDED':
      return 'blue';
    default:
      return 'default';
  }
};

// Function để lấy màu sắc cho trạng thái technician
const getTechnicianStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
    case 'VERIFIED':
      return 'green';
    case 'PENDING':
      return 'orange';
    case 'REJECTED':
    case 'BLOCKED':
      return 'red';
    case 'INACTIVE':
      return 'default';
    default:
      return 'default';
  }
};



export default function TechnicianDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [technician, setTechnician] = useState(null);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [serviceMap, setServiceMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [allServices, setAllServices] = useState([]);
  const [financialSearchText, setFinancialSearchText] = useState('');
  const [financialFilterService, setFinancialFilterService] = useState('');
  const [financialFilterStatus, setFinancialFilterStatus] = useState('');
  const dispatch = useDispatch();
  const { reportCount, loading: reportLoading, error: reportError } = useSelector((state) => state.reports);
  const [notificationContent, setNotificationContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [t, allBookings, services, categories] = await Promise.all([
          technicianAPI.getById(id),
          bookingAPI.getAll(),
          serviceAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        if (!t) {
          message.error('Không tìm thấy kỹ thuật viên');
          navigate('/admin/technician-management');
          return;
        }
        setTechnician(t);
        // Load related user info if available
        if (t.userId) {
          try {
            const u = await userAPI.getById(t.userId);
            if (u) setUser(u);
          } catch { }
        }
        const sm = {};
        (services || []).forEach((s) => {
          sm[s.id] = s.serviceName || s.name;
        });
        setServiceMap(sm);
        setAllServices(services); // Thêm dòng này để có dữ liệu cho filter
        const techBookings = (allBookings || []).filter((b) => b.technicianId === t.id);
        setBookings(techBookings);
        setCategories(categories);
      } catch (e) {
        setError(e);
        message.error('Không thể tải thông tin chi tiết');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const bookingColumns = useMemo(
    () => [
      { title: 'Mã đơn hàng', dataIndex: 'bookingCode', key: 'bookingCode' },
      {
        title: 'Dịch vụ',
        dataIndex: 'serviceName',
        key: 'serviceName',
        render: (_, r) => serviceMap[r.serviceId] || r.serviceName || r.serviceId,
      },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => (
        <Tag color={getBookingStatusColor(s)}>
          {bookingStatusMapping[s] || s?.replace(/_/g, ' ')}
        </Tag>
      ) },
      { title: 'Thời gian tạo đơn hàng', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
    ],
    [serviceMap]
  );
  //Load Number of times the technician has been reported 
  useEffect(() => {
    if (technician?.userId) {
   dispatch(fetchReportCounts(technician.userId));
     
    }
  }, [technician?.userId, dispatch]);

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
  };

  const handleApproveTechnician = async () => {
    try {
      setLoading(true);
      await technicianAPI.updateStatus(technician.id, 'APPROVED');
      message.success('Duyệt kỹ thuật viên thành công!');
      // Reload data
      const updatedTechnician = await technicianAPI.getById(technician.id);
      setTechnician(updatedTechnician);
    } catch (error) {
      console.error('Error approving technician:', error);
      message.error('Duyệt kỹ thuật viên thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleRejectTechnician = async () => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối!');
      return;
    }
    
    try {
      setLoading(true);
      await technicianAPI.updateStatus(technician.id, 'REJECTED', rejectReason);
      message.success('Từ chối kỹ thuật viên thành công!');
      setShowRejectModal(false);
      setRejectReason('');
      // Reload data
      const updatedTechnician = await technicianAPI.getById(technician.id);
      setTechnician(updatedTechnician);
    } catch (error) {
      console.error('Error rejecting technician:', error);
      message.error('Từ chối kỹ thuật viên thất bại!');
    } finally {
      setLoading(false);
    }
  };


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

  // Load financial data for technician
  useEffect(() => {
    const loadFinancialData = async () => {
      if (!technician?.id) return;

      try {
        setFinancialLoading(true);
        const [technicianDetails, technicianBookings] = await Promise.all([
          financialReportAPI.getTechnicianFinancialDetails(technician.id),
          financialReportAPI.getBookingsByTechnicianId(technician.id)
        ]);

        if (technicianDetails) {
          setFinancialData({
            ...technicianDetails,
            bookings: technicianBookings || []
          });
        }
      } catch (error) {
        console.error('Error loading financial data:', error);
        // Don't show error message for financial data as it's not critical
      } finally {
        setFinancialLoading(false);
      }
    };

    loadFinancialData();
  }, [technician?.id]);

  // Logic filter cho financial data
  const filteredFinancialBookings = useMemo(() => {
    if (!financialData || !financialData.bookings) return [];
    
    return financialData.bookings.filter(b => {
      const bookingCode = (b.bookingCode || '').toLowerCase();
      const service = (serviceMap[b.serviceId] || '').toLowerCase();
      const status = (b.paymentStatus || '').toLowerCase();
      const search = financialSearchText.toLowerCase();

      return (
        (bookingCode.includes(search) ||
         service.includes(search) ||
         status.includes(search)) &&
        (!financialFilterService || b.serviceId === financialFilterService) &&
        (!financialFilterStatus || b.paymentStatus === financialFilterStatus)
      );
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất trước
  }, [financialData, financialSearchText, financialFilterService, financialFilterStatus, serviceMap]);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const exportColumns = [
      ...bookingColumns.map((c) => ({ title: c.title, dataIndex: c.dataIndex })),
      { title: 'Trạng thái KTV', dataIndex: 'technicianStatus' },
      { title: 'Tình trạng KTV', dataIndex: 'technicianAvailability' }
    ];
    const exportData = filteredBookings.map((b) => ({
      bookingCode: b.bookingCode,
      serviceName: serviceMap[b.serviceId] || b.serviceName || b.serviceId,
      status: formatStatusLabel(b.status),
      createdAt: formatDateTime(b.createdAt),
      technicianStatus: statusMapping[technician?.status] || technician?.status || '',
      technicianAvailability: availabilityMapping[technician?.availability] || technician?.availability || '',
    }));
    createExportData(exportData, exportColumns, `technician_${id}_bookings`, 'TechnicianBookings');
  }, [filteredBookings, bookingColumns, id, serviceMap]);

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
          <div style={{ color: 'red' }}>Không thể tải thông tin chi tiết.</div>
          <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  if (!technician) return null;

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="container-fluid">
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
              <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
            </Space>

            <Card title="Thông tin kỹ thuật viên" variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                <Avatar size={80} src={technician.avatar || user?.avatar} style={{ flexShrink: 0 }}>
                  {(technician.fullName || user?.fullName || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{technician.fullName || user?.fullName || ''}</div>
                  <div style={{ color: '#888', marginTop: 4 }}>ID: {technician.id}</div>
                  <br></br>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>Gửi Cảnh Cáo</Button>
                    {technician.status === "PENDING" && (
                      <>
                        <Button 
                          type="primary" 
                          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                          onClick={() => handleApproveTechnician()}
                        >
                          <i className="ti ti-check me-1"></i>
                          Đồng ý
                        </Button>
                        <Button 
                          type="primary" 
                          danger
                          onClick={() => handleOpenRejectModal()}
                        >
                          <i className="ti ti-x me-1"></i>
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                                 {/* Financial Summary Card - Góc trên cùng bên phải */}
                 {financialLoading ? (
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     minWidth: '280px',
                     height: '120px',
                     background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                     borderRadius: '16px',
                     border: '2px dashed #d9d9d9'
                   }}>
                     <Spin size="large" />
                   </div>
                 ) : financialData ? (
                   <div style={{
                     minWidth: '280px',
                     background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
                     borderRadius: '20px',
                     padding: '24px',
                     color: 'white',
                     boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                     position: 'relative',
                     overflow: 'hidden'
                   }}>
                     {/* Background Pattern */}
                     <div style={{
                       position: 'absolute',
                       top: '-20px',
                       right: '-20px',
                       width: '80px',
                       height: '80px',
                       background: 'rgba(255, 255, 255, 0.1)',
                       borderRadius: '50%',
                       opacity: 0.6
                     }} />
                     <div style={{
                       position: 'absolute',
                       bottom: '-30px',
                       left: '-30px',
                       width: '120px',
                       height: '120px',
                       background: 'rgba(255, 255, 255, 0.05)',
                       borderRadius: '50%'
                     }} />
                     
                     {/* Icon */}
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       marginBottom: '16px'
                     }}>
                       <div style={{
                         width: '40px',
                         height: '40px',
                         background: 'rgba(255, 255, 255, 0.2)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginRight: '12px'
                       }}>
                         <i className="ti ti-wallet" style={{ 
                           fontSize: '20px', 
                           color: 'black' 
                         }} />
                       </div>
                       <div style={{ fontSize: '14px', opacity: 0.9, color: 'black' }}>
                         Tổng Thu Nhập
                       </div>
                     </div>
                     
                     {/* Amount */}
                     <div style={{
                       fontSize: '28px',
                       fontWeight: '700',
                       marginBottom: '8px',
                       textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                       color: 'black'
                     }}>
                       {formatCurrency(financialData.totalEarning || 0)}
                     </div>
                     
                     {/* Subtitle */}
                     <div style={{
                       fontSize: '12px',
                       opacity: 0.8,
                       fontWeight: '500',
                       color: 'black'
                     }}>
                       Từ tất cả công việc
                     </div>
                     
                     {/* Trend Indicator */}
                   </div>
                 ) : (
                   <div style={{
                     minWidth: '280px',
                     height: '120px',
                     background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                     borderRadius: '20px',
                     border: '2px dashed #d9d9d9',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#666',
                     fontSize: '14px',
                     fontWeight: '500'
                   }}>
                     <div style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                       Chưa có dữ liệu thu nhập
                     </div>
                   </div>
                 )}
              </div>

              <Descriptions column={2} bordered>
                <Descriptions.Item label="Email">{technician.email || user?.email || ''}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{technician.phone || user?.phone || ''}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <span className={`badge ${getStatusBadgeClass(technician.status)} text-dark`}>
                    {statusMapping[technician.status] || technician.status || 'N/A'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng">{availabilityTag(technician.availability)}</Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge text-white ${
                      (technician.ratingAverage || 0) >= 4 ? 'bg-success' : 
                      (technician.ratingAverage || 0) >= 2 ? 'bg-warning' : 'bg-danger'
                    }`}>
                      {technician.ratingAverage?.toFixed(1) ?? '0.0'}
                    </span>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = technician.ratingAverage || 0;
                        let starColor = '#d9d9d9'; // Mặc định xám
                        let starClass = 'ti ti-star-filled'; // Mặc định sao đầy
                        let starStyle = {
                          color: starColor,
                          fontSize: '14px',
                          marginRight: '2px'
                        };
                        
                        if (star <= Math.floor(rating)) {
                          // Sao hoàn chỉnh (phần nguyên)
                          starColor = '#ffc107';
                          starClass = 'ti ti-star-filled';
                          starStyle = {
                            color: starColor,
                            fontSize: '14px',
                            marginRight: '2px'
                          };
                        } else if (star === Math.floor(rating) + 1 && rating % 1 > 0) {
                          // Sao một phần (có phần thập phân) - hiển thị nửa vàng nửa xám
                          starClass = 'ti ti-star-filled';
                          const fillPercentage = (rating % 1) * 100;
                          starStyle = {
                            background: `linear-gradient(90deg, #ffc107 ${fillPercentage}%, #d9d9d9 ${fillPercentage}%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '14px',
                            marginRight: '2px'
                          };
                        }
                        
                        return (
                          <i 
                            key={star}
                            className={starClass}
                            style={starStyle}
                          />
                        );
                      })}
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số công việc hoàn thành">{technician.jobCompleted ?? 0}</Descriptions.Item>
                <Descriptions.Item label="Năm kinh nghiệm">{technician.experienceYears || 0} năm</Descriptions.Item>
              </Descriptions>

              {/* Specialties Section */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
                  Chuyên Ngành
                </div>
                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                  {technician.specialtiesCategories && technician.specialtiesCategories.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {technician.specialtiesCategories.map((catId, index) => {
                        const category = categories.find(cat => cat.id === catId || cat._id === catId);
                        return (
                          <Tag
                            key={index}
                            color="blue"
                            style={{
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 500,
                              border: 'none'
                            }}
                          >
                            {category ? category.categoryName : catId}
                          </Tag>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                      Chưa có chuyên ngành nào được đăng ký
                    </div>
                  )}
                </div>
              </div>
            </Card>
                         <Tabs
               items={[
                 {
                   key: 'profile',
                   label: 'Thông Tin Tài Khoản',
                   children: (
                     <Card variant="borderless" style={{ borderRadius: 12 }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                         

                         {/* Location Information */}
                         <div>
                           <h4 style={{ marginBottom: 16, color: '#333' }}>Vị Trí</h4>
                           <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                             {technician.currentLocation && technician.currentLocation.coordinates && technician.currentLocation.coordinates.length >= 2 ? (
                               <>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Vĩ độ:</strong> {technician.currentLocation.coordinates[1]?.toFixed(6) || 'N/A'}
                                 </div>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Kinh độ:</strong> {technician.currentLocation.coordinates[0]?.toFixed(6) || 'N/A'}
                                 </div>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Loại vị trí:</strong> {technician.currentLocation.type || 'Point'}
                                 </div>
                                 <div style={{ marginBottom: 8 }}>
                                   <strong>Google Maps: </strong>
                                    <a 

                                    href={`https://www.google.com/maps?q=${technician.currentLocation.coordinates[1]},${technician.currentLocation.coordinates[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#1890ff',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <i className="ti ti-map-pin" style={{ fontSize: '16px' }}></i>
                                    Xem trên Google Maps
                                  </a>
                                 </div>
                                 
                               </>
                             ) : (
                               <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                                 Chưa cập nhật vị trí
                               </div>
                             )}
                           </div>
                         </div>

                         {/* Bank Information */}
                         <div>
                           <h4 style={{ marginBottom: 16, color: '#333' }}>Thông Tin Ngân Hàng</h4>
                           <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                             {technician.bankAccount ? (
                               <>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Ngân hàng:</strong> {technician.bankAccount.bankName}
                                 </div>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Số tài khoản:</strong> {technician.bankAccount.accountNumber}
                                 </div>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Chủ tài khoản:</strong> {technician.bankAccount.accountHolder}
                                 </div>
                                 <div style={{ marginBottom: 12 }}>
                                   <strong>Chi nhánh:</strong> {technician.bankAccount.branch}
                                 </div>
                               </>
                             ) : (
                               <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                                 Chưa cập nhật thông tin ngân hàng
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </Card>
                   ),
                 },
                 {
                   key: 'documents',
                   label: 'Tài Liệu & Chứng Chỉ',
                   children: (
                     <Card variant="borderless" style={{ borderRadius: 12 }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                         {/* ID Images */}
                         <div>
                           <h4 style={{ marginBottom: 16, color: '#333' }}>Chứng Minh Nhân Dân</h4>
                           <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                             <div style={{ marginBottom: 16 }}>
                               <div style={{ marginBottom: 8 }}>
                                 <strong>Mặt trước CMND/CCCD:</strong>
                               </div>
                               {technician.frontIdImage ? (
                                 <div style={{ textAlign: 'center' }}>
                                   <img
                                     src={technician.frontIdImage}
                                     alt="Front ID"
                                     style={{
                                       maxWidth: '100%',
                                       maxHeight: '200px',
                                       borderRadius: '8px',
                                       border: '1px solid #d9d9d9'
                                     }}
                                   />
                                   <div style={{ marginTop: 8 }}>
                                     <Button
                                       type="link"
                                       size="small"
                                       onClick={() => window.open(technician.frontIdImage, '_blank')}
                                     >
                                       Xem ảnh gốc
                                     </Button>
                                   </div>
                                 </div>
                               ) : (
                                 <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                                   Chưa cập nhật ảnh mặt trước
                                 </div>
                               )}
                             </div>
                             
                             <div>
                               <div style={{ marginBottom: 8 }}>
                                 <strong>Mặt sau CMND/CCCD:</strong>
                               </div>
                               {technician.backIdImage ? (
                                 <div style={{ textAlign: 'center' }}>
                                   <img
                                     src={technician.backIdImage}
                                     alt="Back ID"
                                     style={{
                                       maxWidth: '100%',
                                       maxHeight: '200px',
                                       borderRadius: '8px',
                                       border: '1px solid #d9d9d9'
                                     }}
                                   />
                                   <div style={{ marginTop: 8 }}>
                                     <Button
                                       type="link"
                                       size="small"
                                       onClick={() => window.open(technician.backIdImage, '_blank')}
                                     >
                                       Xem ảnh gốc
                                     </Button>
                                   </div>
                                 </div>
                               ) : (
                                 <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                                   Chưa cập nhật ảnh mặt sau
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>

                         {/* Certificates */}
                         <div>
                           <h4 style={{ marginBottom: 16, color: '#333' }}>Chứng Chỉ & Bằng Cấp</h4>
                           <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                             {technician.certificate && technician.certificate.length > 0 ? (
                               <div>
                                 {technician.certificate.map((cert, index) => (
                                   <div key={index} style={{ marginBottom: 16, padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e8e8e8' }}>
                                     <div style={{ marginBottom: 8 }}>
                                       <strong>Chứng chỉ {index + 1}:</strong>
                                     </div>
                                     <div style={{ textAlign: 'center' }}>
                                       {cert.toLowerCase().includes('.pdf') ? (
                                         <div>
                                           <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: 8 }}>📄</div>
                                           <div style={{ marginBottom: 8, fontSize: '14px', color: '#666' }}>
                                             {cert.split('/').pop()}
                                           </div>
                                           <Button
                                             type="primary"
                                             size="small"
                                             onClick={() => window.open(cert, '_blank')}
                                           >
                                             Xem PDF
                                           </Button>
                                         </div>
                                       ) : (
                                         <div>
                                           <img
                                             src={cert}
                                             alt={`Certificate ${index + 1}`}
                                             style={{
                                               maxWidth: '100%',
                                               maxHeight: '150px',
                                               borderRadius: '6px',
                                               border: '1px solid #d9d9d9'
                                             }}
                                           />
                                           <div style={{ marginTop: 8 }}>
                                             <Button
                                               type="link"
                                               size="small"
                                               onClick={() => window.open(cert, '_blank')}
                                             >
                                               Xem ảnh gốc
                                             </Button>
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                                 Chưa có chứng chỉ nào được cập nhật
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </Card>
                   ),
                 },
                 {
                   key: 'bookings',
                   label: 'Lịch Sử Công Việc',
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
                              style={{ width: 250 }}
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
                              style={{ width: 250 }}
                              allowClear
                              options={[
                                { value: 'PENDING', label: 'Đang chờ' },
                                { value: 'CANCELLED', label: 'Đã hủy' },
                                { value: 'WAITING_CONFIRM', label: 'Chờ xác nhận' },
                                { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                                { value: 'CONFIRMED', label: 'Đã xác nhận' },
                                { value: 'DONE', label: 'Hoàn thành' },
                                { value: 'AWAITING_CONFIRM', label: 'Chờ xác nhận' },
                                { value: 'CONFIRM_ADDITIONAL', label: 'Xác nhận bổ sung' },
                                { value: 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL', label: 'Chờ khách hàng xác nhận bổ sung' },
                                { value: 'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL', label: 'Chờ kỹ thuật viên xác nhận bổ sung' },
                                { value: 'AWAITING_DONE', label: 'Chờ hoàn thành' }
                              ]}
                            />
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
                                Trạng thái: {bookingStatusMapping[filterStatus] || filterStatus.replace(/_/g, ' ')}
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
                            showSizeChanger: false,
                            showQuickJumper: false,
                          }}
                        />
                      </div>
                   ),
                 },
                 {
                   key: 'financial',
                   label: 'Tài Chính & Thu Nhập',
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
                                  placeholder="Tìm kiếm đơn hàng tài chính..."
                                  value={financialSearchText}
                                  onChange={e => setFinancialSearchText(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Service Filter */}
                            <Select
                              placeholder="Dịch vụ"
                              value={financialFilterService || undefined}
                              onChange={(value) => setFinancialFilterService(value)}
                              style={{ width: 250 }}
                              allowClear
                            >
                              {allServices.map(s => (
                                <Select.Option key={s.id} value={s.id}>
                                  {s.serviceName || s.name}
                                </Select.Option>
                              ))}
                            </Select>

                            {/* Payment Status Filter */}
                            <Select
                              placeholder="Trạng thái thanh toán"
                              value={financialFilterStatus || undefined}
                              onChange={(value) => setFinancialFilterStatus(value)}
                              style={{ width: 250 }}
                              allowClear
                              options={[
                                { value: 'PAID', label: 'Đã thanh toán' },
                                { value: 'PENDING', label: 'Đang chờ' },
                                { value: 'CANCELLED', label: 'Đã hủy' },
                                { value: 'FAILED', label: 'Thất bại' },
                                { value: 'REFUNDED', label: 'Đã hoàn tiền' }
                              ]}
                            />
                          </div>
                        </div>

                        

                        {/* Filter Info */}
                        {(financialSearchText || financialFilterService || financialFilterStatus) && (
                          <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
                            <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
                            {financialSearchText && (
                              <span className="badge bg-primary-transparent">
                                <i className="ti ti-search me-1"></i>
                                Tìm kiếm: "{financialSearchText}"
                              </span>
                            )}
                            {financialFilterService && (
                              <span className="badge bg-info-transparent">
                                <i className="ti ti-tools me-1"></i>
                                Dịch vụ: {serviceMap[financialFilterService] || financialFilterService}
                              </span>
                            )}
                            {financialFilterStatus && (
                              <span className="badge bg-warning-transparent">
                                <i className="ti ti-filter me-1"></i>
                                Trạng thái thanh toán: {paymentStatusMapping[financialFilterStatus] || financialFilterStatus}
                              </span>
                            )}
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                setFinancialSearchText('');
                                setFinancialFilterService('');
                                setFinancialFilterStatus('');
                              }}
                            >
                              <i className="ti ti-x me-1"></i>
                              Xóa tất cả
                            </button>
                          </div>
                        )}

                       

                           {/* Financial Bookings Table */}
                        {financialData ? (
                               <Table
                            rowKey={(r) => r.id}
                            dataSource={filteredFinancialBookings}
                                 columns={[
                                   {
                                     title: 'Mã đơn hàng',
                                     dataIndex: 'bookingCode',
                                     key: 'bookingCode',
                                   },
                                   {
                                     title: 'Giá cuối',
                                     dataIndex: 'finalPrice',
                                     key: 'finalPrice',
                                     render: (value) => value ? formatCurrency(value) : formatCurrency(0),
                                   },
                                   {
                                     title: 'Thu nhập',
                                     dataIndex: 'technicianEarning',
                                     key: 'technicianEarning',
                                     render: (value) => value ? formatCurrency(value) : formatCurrency(0),
                                   },
                                   {
                                     title: 'Thanh toán',
                                     dataIndex: 'paymentStatus',
                                     key: 'paymentStatus',
                                     render: (status) => (
                                       <Tag color={getPaymentStatusColor(status)}>
                                         {paymentStatusMapping[status] || status}
                                       </Tag>
                                     ),
                                   },
                                   {
                                     title: 'Ngày tạo',
                                     dataIndex: 'createdAt',
                                     key: 'createdAt',
                                     render: (date) => formatDateTime(date),
                                   },
                                 ]}
                            pagination={{ 
                              pageSize: 10,
                              showSizeChanger: false,
                              showQuickJumper: false
                            }}
                          />
                        ) : (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '50px', 
                            color: '#999',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '1px dashed #d9d9d9'
                          }}>
                             </div>
                           )}
                         </div>
                   ),
                 },
               ]}
             />

          </Space>
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

      {/* Reject Modal */}
      <Modal
        title="Từ chối đăng ký kỹ thuật viên"
        open={showRejectModal}
        onCancel={handleCloseRejectModal}
        footer={[
          <Button key="cancel" onClick={handleCloseRejectModal}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" danger onClick={handleRejectTechnician} loading={loading}>
            Xác nhận từ chối
          </Button>,
        ]}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
            Họ và tên: {technician?.fullName && technician.fullName.length > 25 
              ? `${technician.fullName.substring(0, 25)}...` 
              : (technician?.fullName || '')}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Tình trạng hiện tại: {technician?.status === 'PENDING' ? 'Đang chờ' : technician?.status}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#d32f2f' }}>
            Lý do từ chối <span style={{ color: 'red' }}>*</span>
          </div>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối đăng ký kỹ thuật viên..."
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>
    </div>
  );
}

