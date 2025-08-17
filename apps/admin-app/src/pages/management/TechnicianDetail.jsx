import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Spin, message, Tabs, Table, Avatar, Select } from 'antd';
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
  return <Tag color={colorMap[status] || 'default'}>{status || 'UNKNOWN'}</Tag>;
};

const availabilityTag = (availability) => {
  const color = availability === 'FREE' ? 'blue' : availability === 'ONJOB' ? 'yellow' : availability === 'BUSY' ? 'red' : 'default';
  return <Tag color={color}>{availability || 'UNKNOWN'}</Tag>;
};

const formatStatusLabel = (status) => (status ? String(status).replace(/_/g, ' ') : '');

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
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag>{formatStatusLabel(s)}</Tag> },
      { title: 'Thời gian tạo đơn hàng', dataIndex: 'createdAt', key: 'createdAt', render: (v) => formatDateTime(v) },
    ],
    [serviceMap]
  );
  //Load Number of times the technician has been reported 
  useEffect(() => {
    if (technician?.id) {
      dispatch(fetchReportCounts(technician.id));
    }
  }, [technician?.id, dispatch]);

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
    const exportColumns = bookingColumns.map((c) => ({ title: c.title, dataIndex: c.dataIndex }));
    const exportData = filteredBookings.map((b) => ({
      bookingCode: b.bookingCode,
      serviceName: serviceMap[b.serviceId] || b.serviceName || b.serviceId,
      status: formatStatusLabel(b.status),
      createdAt: formatDateTime(b.createdAt),
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
              <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back</Button>
            </Space>

            <Card title="Thông tin kỹ thuật viên" variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                <Avatar size={80} src={technician.avatar || user?.avatar || `https://i.pravatar.cc/150?u=${technician.id}`} style={{ flexShrink: 0 }}>
                  {(technician.fullName || user?.fullName || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{technician.fullName || user?.fullName || ''}</div>
                  <div style={{ color: '#888', marginTop: 4 }}>ID: {technician.id}</div>
                  <br></br>
                  <div>
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>Gửi Cảnh Cáo</Button>

                  </div>
                  {/* Thêm cảnh cáo ở dưới*/}

                </div>
              </div>

              <Descriptions column={2} bordered>
                <Descriptions.Item label="Họ và tên" span={1}>{technician.fullName || user?.fullName || ''}</Descriptions.Item>
                <Descriptions.Item label="Email" span={1}>{technician.email || user?.email || ''}</Descriptions.Item>
                <Descriptions.Item label="SĐT" span={1}>{technician.phone || user?.phone || ''}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1}>{statusTag(technician.status)}</Descriptions.Item>
                <Descriptions.Item label="Tình trạng" span={1}>{availabilityTag(technician.availability)}</Descriptions.Item>
                <Descriptions.Item label="Đánh giá" span={1}>
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
                <Descriptions.Item label="Số công việc hoàn thành" span={1}>{technician.jobCompleted ?? 0}</Descriptions.Item>
                <Descriptions.Item label="Năm kinh nghiệm" span={1}>{technician.experienceYears || 0} năm</Descriptions.Item>

                  <Descriptions.Item label="Số lần bị báo cáo">{reportCount}</Descriptions.Item>
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
                              style={{ width: 150 }}
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
                              style={{ width: 150 }}
                              allowClear
                            >
                              <Select.Option value="PAID">PAID</Select.Option>
                              <Select.Option value="PENDING">PENDING</Select.Option>
                              <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                              <Select.Option value="FAILED">FAILED</Select.Option>
                              <Select.Option value="REFUNDED">REFUNDED</Select.Option>
                            </Select>
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
                                Trạng thái thanh toán: {financialFilterStatus}
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

                        {/* Financial Summary Cards */}
                       {financialLoading ? (
                         <div style={{ textAlign: 'center', padding: '50px' }}>
                           <Spin size="large" />
                         </div>
                       ) : financialData ? (
                          <div style={{ marginBottom: 24 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                               <Card size="small">
                                 <div style={{ textAlign: 'center' }}>
                                   <div style={{ fontSize: '24px', fontWeight: 600, color: '#52c41a', marginBottom: 8 }}>
                                     {formatCurrency(financialData.totalEarning || 0)}
                                   </div>
                                   <div style={{ color: '#666', fontSize: '14px' }}>Tổng Thu Nhập</div>
                                 </div>
                               </Card>
                               <Card size="small">
                                 <div style={{ textAlign: 'center' }}>
                                   <div style={{ fontSize: '24px', fontWeight: 600, color: '#1890ff', marginBottom: 8 }}>
                                     {formatCurrency(financialData.totalCommissionPaid || 0)}
                                   </div>
                                   <div style={{ color: '#666', fontSize: '14px' }}>Hoa Hồng Đã Trả</div>
                                 </div>
                               </Card>
                               <Card size="small">
                                 <div style={{ textAlign: 'center' }}>
                                   <div style={{ fontSize: '24px', fontWeight: 600, color: '#faad14', marginBottom: 8 }}>
                                     {formatCurrency(financialData.totalHoldingAmount || 0)}
                                   </div>
                                   <div style={{ color: '#666', fontSize: '14px' }}>Số Tiền Đang Giữ</div>
                                 </div>
                               </Card>
                               <Card size="small">
                                 <div style={{ textAlign: 'center' }}>
                                   <div style={{ fontSize: '24px', fontWeight: 600, color: '#722ed1', marginBottom: 8 }}>
                                     {formatCurrency(financialData.totalWithdrawn || 0)}
                                   </div>
                                   <div style={{ color: '#666', fontSize: '14px' }}>Đã Rút Tiền</div>
                                 </div>
                               </Card>
                             </div>
                           </div>
                        ) : null}

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
                                     title: 'Số tiền giữ',
                                     dataIndex: 'holdingAmount',
                                     key: 'holdingAmount',
                                     render: (value) => value ? formatCurrency(value) : formatCurrency(0),
                                   },
                                   {
                                     title: 'Hoa hồng',
                                     dataIndex: 'commissionAmount',
                                     key: 'commissionAmount',
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
                                     render: (status) => <Tag color={status === 'PAID' ? 'green' : 'orange'}>{status}</Tag>,
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
    </div>
  );
}

