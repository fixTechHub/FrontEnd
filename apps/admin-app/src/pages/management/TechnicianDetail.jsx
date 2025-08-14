import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Spin, message, Tabs, Table, Avatar } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { userAPI } from '../../features/users/userAPI';
import { categoryAPI } from '../../features/categories/categoryAPI';
import { financialReportAPI } from '../../features/financialReport/financialReportAPI';
import { createExportData, formatDateTime } from '../../utils/exportUtils';
import { formatCurrency } from '../../utils/formatCurrency';

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
  const color = availability === 'FREE' ? 'green' : availability === 'ONJOB' ? 'blue' : 'default';
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
          } catch {}
        }
        const sm = {};
        (services || []).forEach((s) => {
          sm[s.id] = s.serviceName || s.name;
        });
        setServiceMap(sm);
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

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const exportColumns = bookingColumns.map((c) => ({ title: c.title, dataIndex: c.dataIndex }));
    const exportData = bookings.map((b) => ({
      bookingCode: b.bookingCode,
      serviceName: serviceMap[b.serviceId] || b.serviceName || b.serviceId,
      status: formatStatusLabel(b.status),
      createdAt: formatDateTime(b.createdAt),
    }));
    createExportData(exportData, exportColumns, `technician_${id}_bookings`, 'TechnicianBookings');
  }, [bookings, bookingColumns, id, serviceMap]);

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

            <Card title="Thông tin kỹ thuật viên" bordered={false} style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                <Avatar size={80} src={technician.avatar || user?.avatar || `https://i.pravatar.cc/150?u=${technician.id}`} style={{ flexShrink: 0 }}>
                  {(technician.fullName || user?.fullName || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{technician.fullName || user?.fullName || ''}</div>
                  <div style={{ color: '#888', marginTop: 4 }}>ID: {technician.id}</div>
                  <br></br>

                  {/* Thêm cảnh cáo ở dưới*/}

                </div>
              </div>

              <Descriptions column={2} bordered>
                <Descriptions.Item label="Họ và tên">{technician.fullName || user?.fullName || ''}</Descriptions.Item>
                <Descriptions.Item label="Email">{technician.email || user?.email || ''}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{technician.phone || user?.phone || ''}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{statusTag(technician.status)}</Descriptions.Item>
                <Descriptions.Item label="Tình trạng">{availabilityTag(technician.availability)}</Descriptions.Item>
                <Descriptions.Item label="Đánh giá">{technician.ratingAverage ?? 0}</Descriptions.Item>
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
                     <Card bordered={false} style={{ borderRadius: 12 }}>
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
                     <Card bordered={false} style={{ borderRadius: 12 }}>
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
                     <Table
                       rowKey={(r) => r.id}
                       dataSource={bookings}
                       columns={bookingColumns}
                       pagination={{ pageSize: 10 }}
                     />
                   ),
                 },
                 {
                   key: 'financial',
                   label: 'Tài Chính & Thu Nhập',
                   children: (
                     <Card bordered={false} style={{ borderRadius: 12 }}>
                       {financialLoading ? (
                         <div style={{ textAlign: 'center', padding: '50px' }}>
                           <Spin size="large" />
                         </div>
                       ) : financialData ? (
                         <Space direction="vertical" size={24} style={{ width: '100%' }}>
                           {/* Financial Summary */}
                           <div>
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

                           {/* Financial Bookings Table */}
                           {financialData.bookings && financialData.bookings.length > 0 && (
                             <div>
                               <Table
                                 dataSource={financialData.bookings}
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
                                 pagination={{ pageSize: 10 }}
                                 size="small"
                               />
                             </div>
                           )}
                         </Space>
                       ) : (
                         <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                           Không có dữ liệu tài chính
                         </div>
                       )}
                     </Card>
                   ),
                 },
               ]}
             />
          </Space>
        </div>
      </div>
    </div>
  );
}

