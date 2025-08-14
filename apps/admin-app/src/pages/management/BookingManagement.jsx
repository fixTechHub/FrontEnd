import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import ApiBE from '../../services/ApiBE';
import { Modal, Button, Select, Descriptions, Spin, Row, Col, Tag, Divider, Image } from 'antd';
import { serviceAPI } from '../../features/service/serviceAPI';
import { EyeOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { createExportData, formatDateTime, formatStatus } from '../../utils/exportUtils';

dayjs.extend(utc);
dayjs.extend(timezone);

const BookingManagement = () => {
 const [bookings, setBookings] = useState([]);
 const [userMap, setUserMap] = useState({});
 const [serviceMap, setServiceMap] = useState({});
 const [technicianMap, setTechnicianMap] = useState({});
 const [searchText, setSearchText] = useState('');
 const [showDetailModal, setShowDetailModal] = useState(false);
 const [selectedBooking, setSelectedBooking] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [bookingsPerPage, setBookingsPerPage] = useState(10);
 const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');
const [filterService, setFilterService] = useState('');
const [filterStatus,  setFilterStatus] = useState('');
const [allServices, setAllServices] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'default';
      case 'CONFIRMED':
        return 'processing';
      case 'IN_PROGRESS':
        return 'blue';
      case 'AWAITING_DONE':
      case 'WAITING_CONFIRM':
        return 'gold';
      case 'DONE':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };


 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [users, services, technicians, bookingsData] = await Promise.all([
        userAPI.getAll(),
        serviceAPI.getAll(), // chỉ dùng serviceAPI.getAll()
        technicianAPI.getAll(),
        bookingAPI.getAll()
      ]);
      const userMapData = {};
      users.forEach(u => userMapData[u.id] = u.fullName || u.email);
      setUserMap(userMapData);

      const serviceMapData = {};
      services.forEach(s => serviceMapData[s.id] = s.serviceName || s.name); // lấy đúng tên service
      setServiceMap(serviceMapData);
      setAllServices(services); // cho dropdown filter

      const technicianMapData = {};
      technicians.forEach(t => technicianMapData[t.id] = t.fullName || t.email);
      setTechnicianMap(technicianMapData);
      setBookings(bookingsData);
    } catch (error) {
      setError(error);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  setCurrentPage(1);
}, [filterService, filterStatus, searchText]);


 const filteredBookings = bookings.filter(b => {
  const bookingCode = (b.bookingCode || '').toLowerCase();
  const customer = (userMap[b.customerId] || '').toLowerCase();
  const service = (serviceMap[b.serviceId] || '').toLowerCase();
  const status = (b.status || '').toLowerCase();
  const id = (b.id || '').toLowerCase();
  const search = searchText.toLowerCase();

  return (
    (bookingCode.includes(search) ||
     customer.includes(search) ||
     service.includes(search) ||
     status.includes(search) ||
     id.includes(search)
    ) &&
    (!filterService || b.serviceId === filterService) &&
    (!filterStatus || b.status === filterStatus)
  );
});
 const indexOfLastBooking = currentPage * bookingsPerPage;
 const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
 const sortedBookings = [...filteredBookings].sort((a, b) => {
  if (sortField === 'id') {
    if (!a.id) return 1;
    if (!b.id) return -1;
    if (sortOrder === 'asc') {
      return (a.id || '').localeCompare(b.id || '');
    } else {
      return (b.id || '').localeCompare(a.id || '');
    }
  } else if (sortField === 'customer') {
    const nameA = (userMap[a.customerId] || '').toLowerCase();
    const nameB = (userMap[b.customerId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  } else if (sortField === 'service') {
    const nameA = (serviceMap[a.serviceId] || '').toLowerCase();
    const nameB = (serviceMap[b.serviceId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  } else if (sortField === 'createdAt') {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  }
  return 0;
});
const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
 const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

 // Set export data và columns
 useEffect(() => {
  const exportColumns = [
    { title: 'Mã đơn hàng', dataIndex: 'bookingCode' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Dịch vụ', dataIndex: 'serviceName' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Kỹ thuật viên', dataIndex: 'technicianName' },
    { title: 'Thời gian tạo', dataIndex: 'createdAt' },
    { title: 'Mô tả', dataIndex: 'description' },
  ];

  const exportData = sortedBookings.map(b => ({
    bookingCode: b.bookingCode,
    customerName: userMap[b.customerId],
    serviceName: serviceMap[b.serviceId],
    status: formatStatus(b.status),
    technicianName: technicianMap[b.technicianId],
    createdAt: formatDateTime(b.createdAt),
    updatedAt: formatDateTime(b.updatedAt),
    description: b.description,
  }));

  createExportData(exportData, exportColumns, 'bookings_export', 'Bookings');

}, [sortedBookings, userMap, serviceMap, technicianMap]);


 const handlePageChange = (pageNumber) => {
   setCurrentPage(pageNumber);
 };

const handleSortChange = (value) => {
  if (value === 'lasted') {
    setSortField('createdAt');
    setSortOrder('desc');
  } else if (value === 'oldest') {
    setSortField('createdAt');
    setSortOrder('asc');
  }
};

const handleSortById = () => {
  if (sortField === 'id') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('id');
    setSortOrder('asc');
  }
};

const handleSortByCustomer = () => {
  if (sortField === 'customer') {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('customer');
    setSortOrder('asc');
  }
};

const handleSortByService = () => {
  if (sortField === 'service') {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('service');
    setSortOrder('asc');
  }
};

const isUserMapReady = bookings.every(b => !b.customerId || userMap[b.customerId]);
const isServiceMapReady = bookings.every(b => !b.serviceId || serviceMap[b.serviceId]);
const isDataReady = isUserMapReady && isServiceMapReady;


 // Định nghĩa các cột export cho booking
 const exportColumns = [
   { title: 'Mã đơn hàng', dataIndex: 'bookingCode' },
   { title: 'Khách hàng', dataIndex: 'customerName' },
   { title: 'Dịch vụ', dataIndex: 'serviceName' },
   { title: 'Trạng thái', dataIndex: 'status' },
   { title: 'Kỹ thuật viên', dataIndex: 'technicianName' },
   { title: 'Thời gian tạo', dataIndex: 'createdAt' },
   { title: 'Mô tả', dataIndex: 'description' },
 ];

 // Chuẩn hóa dữ liệu export (map id sang tên, format ngày...)
 const exportData = sortedBookings.map(b => ({
   bookingCode: b.bookingCode,
   customerName: userMap[b.customerId],
   serviceName: serviceMap[b.serviceId],
   status: b.status,
   technicianName: technicianMap[b.technicianId],
   createdAt: b.createdAt,
   updatedAt: b.updatedAt,
   description: b.description,
 }));


 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Đơn hàng</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
               <li className="breadcrumb-item active">Đơn hàng</li>
             </ol>
           </nav>
         </div>
       </div>
       <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
         <div className="d-flex align-items-center gap-2">
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
           <Select
             placeholder="Dịch vụ"
             value={filterService || undefined}
             onChange={value => setFilterService(value)}
             style={{ width: 150, marginRight: 8 }}
             allowClear
           >
             {allServices.map(s => (
               <Select.Option key={s.id} value={s.id}>{s.serviceName || s.name}</Select.Option>
             ))}
           </Select>
           <Select
             placeholder="Trạng thái"
             value={filterStatus || undefined}
             onChange={value => setFilterStatus(value)}
             style={{ width: 130, marginRight: 8 }}
             allowClear
           >
             <Select.Option value="PENDING">PENDING</Select.Option>
             <Select.Option value="CANCELLED">CANCELLED</Select.Option>
             <Select.Option value="WAITING_CONFIRM">WAITING CONFIRM</Select.Option>
             <Select.Option value="IN_PROGRESS">IN PROGRESS</Select.Option>
             <Select.Option value="CONFIRMED">CONFIRMED</Select.Option>
             <Select.Option value="DONE">DONE</Select.Option>
             <Select.Option value="AWAITING_DONE">AWAITING DONE</Select.Option>
           </Select>
         </div>
         <div className="d-flex align-items-center">
           <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
           <Select
             value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
             style={{ width: 120 }}
             onChange={handleSortChange}
             options={[
               { value: 'lasted', label: 'Mới nhất' },
               { value: 'oldest', label: 'Cũ nhất' },
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
               Trạng thái: {filterStatus}
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

       {/* Table */}
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th style={{ cursor: 'pointer' }} onClick={handleSortById}>
                 Mã đơn hàng
                 {sortField === 'id' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByCustomer}>
                 Khách hàng
                 {sortField === 'customer' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByService}>
                 Dịch vụ
                 {sortField === 'service' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th>Trạng thái</th>
               <th>Hành động</th>
             </tr>
           </thead>
           <tbody>
             {loading ? (
               <tr>
                 <td colSpan={5} className="text-center">
                   <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading...</span>
                   </div>
                 </td>
               </tr>
             ) : error ? (
               <tr>
                 <td colSpan={5} style={{ color: 'red' }}>{error.message || 'Không thể tải các đơn hàng.'}</td>
               </tr>
             ) : filteredBookings.length === 0 ? (
               <tr>
                 <td colSpan={5} className="text-center text-muted py-4">
                   <div>
                     <i className="ti ti-calendar" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                     <p className="mb-0">Không có đơn hàng nào</p>
                   </div>
                 </td>
               </tr>
             ) : currentBookings.length === 0 ? (
               <tr>
                 <td colSpan={5} className="text-center text-muted py-4">
                   <div>
                     <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                     <p className="mb-0">Không tìm thấy đơn hàng nào phù hợp</p>
                   </div>
                 </td>
               </tr>
             ) : (
               currentBookings.map(b => (
                 <tr key={b.id}>
                   <td>{b.bookingCode}</td>
                   <td>{userMap[b.customerId]}</td>
                   <td>{serviceMap[b.serviceId]}</td>
                   <td>{b.status ? b.status.replace(/_/g, ' ') : ''}</td>
                   {/* <td>
                      {b.schedule && typeof b.schedule === 'object' && b.schedule.startTime
                        ? `${dayjs(b.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')} - ${
                            b.schedule.endTime
                              ? dayjs(b.schedule.endTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')
                              : (b.schedule.expectedEndTime
                                  ? dayjs(b.schedule.expectedEndTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')
                                  : '')
                          }`
                        : ''}
                    </td> */}
                   <td>
                     <Button className="management-action-btn" size="middle" onClick={() => { setSelectedBooking(b); setShowDetailModal(true); }}>
                       <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
                     </Button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>

       {/* Pagination Info and Controls */}
       <div className="d-flex justify-content-between align-items-center mt-3">
         <div className="d-flex align-items-center gap-3">
           <div className="text-muted">
             Hiển thị {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} trong tổng số {filteredBookings.length} đơn hàng
           </div>
           {(searchText || filterService || filterStatus) && (
             <div className="text-muted">
               <i className="ti ti-filter me-1"></i>
               Đã lọc theo: {searchText && `Tìm kiếm: "${searchText}"`} {filterService && `Dịch vụ: ${serviceMap[filterService] || filterService}`} {filterStatus && `Trạng thái: ${filterStatus}`}
             </div>
           )}
         </div>
         {filteredBookings.length > 0 && (
           <nav>
             <ul className="pagination mb-0" style={{ gap: '2px' }}>
               {/* Previous button */}
               <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                 <button 
                   className="page-link" 
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage === 1}
                   style={{ 
                     border: '1px solid #dee2e6',
                     borderRadius: '6px',
                     padding: '8px 12px',
                     minWidth: '40px'
                   }}
                 >
                   <i className="ti ti-chevron-left"></i>
                 </button>
               </li>
               
               {/* Page numbers */}
               {[...Array(totalPages)].map((_, i) => {
                 const pageNumber = i + 1;
                 // Show all pages if total pages <= 7
                 if (totalPages <= 7) {
                   return (
                     <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                       <button 
                         className="page-link" 
                         onClick={() => handlePageChange(pageNumber)}
                         style={{ 
                           border: '1px solid #dee2e6',
                           borderRadius: '6px',
                           padding: '8px 12px',
                           minWidth: '40px',
                           backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                           color: currentPage === pageNumber ? 'white' : '#007bff',
                           borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                         }}
                       >
                         {pageNumber}
                       </button>
                     </li>
                   );
                 }
                 
                 // Show first page, last page, current page, and pages around current page
                 if (
                   pageNumber === 1 || 
                   pageNumber === totalPages || 
                   (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                 ) {
                   return (
                     <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                       <button 
                         className="page-link" 
                         onClick={() => handlePageChange(pageNumber)}
                         style={{ 
                           border: '1px solid #dee2e6',
                           borderRadius: '6px',
                           padding: '8px 12px',
                           minWidth: '40px',
                           backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                           color: currentPage === pageNumber ? 'white' : '#007bff',
                           borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                         }}
                       >
                         {pageNumber}
                       </button>
                     </li>
                   );
                 } else if (
                   pageNumber === currentPage - 2 || 
                   pageNumber === currentPage + 2
                 ) {
                   return (
                     <li key={i} className="page-item disabled">
                       <span className="page-link" style={{ 
                         border: '1px solid #dee2e6',
                         borderRadius: '6px',
                         padding: '8px 12px',
                         minWidth: '40px',
                         backgroundColor: '#f8f9fa',
                         color: '#6c757d'
                       }}>...</span>
                     </li>
                   );
                 }
                 return null;
               })}
               
               {/* Next button */}
               <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                 <button 
                   className="page-link" 
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage === totalPages}
                   style={{ 
                     border: '1px solid #dee2e6',
                     borderRadius: '6px',
                     padding: '8px 12px',
                     minWidth: '40px'
                   }}
                 >
                   <i className="ti ti-chevron-right"></i>
                 </button>
               </li>
             </ul>
           </nav>
         )}
       </div>
     </div>

     {showDetailModal && selectedBooking && (
        <Modal
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={null}
          title={null}
          width={960}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1890ff 0%, #73d13d 100%)', padding: 24, color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>Chi tiết đơn hàng</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>Mã đơn hàng : {selectedBooking.bookingCode || selectedBooking.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Tag color={getStatusColor(selectedBooking.status)} style={{ fontSize: 12, fontWeight: 600 }}>
                    {selectedBooking.status ? selectedBooking.status.replace(/_/g, ' ') : ''}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              <Row gutter={16}>
                {/* Overview */}
                <Col span={12}>
                  <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Tổng quan</div>
                    <Descriptions size="small" column={1} bordered={false}
                      items={[
                        { key: 'service', label: 'Dịch vụ', children: serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId },
                        { key: 'location', label: 'Địa chỉ', children: selectedBooking.location?.address || '' },
                        { key: 'scheduledAt', label: 'Lịch trình', children: (
                          selectedBooking.schedule?.startTime
                            ? `${dayjs(selectedBooking.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}${selectedBooking.schedule?.endTime
                                ? ` - ${dayjs(selectedBooking.schedule.endTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                                : (selectedBooking.schedule?.expectedEndTime
                                    ? ` - ${dayjs(selectedBooking.schedule.expectedEndTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                                    : '')}`
                            : 'Chưa có lịch trình'
                        ) },
                      ]}
                    />
                  </div>
                </Col>
                {/* People */}
                <Col span={12}>
                  <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Khách hàng & Kỹ thuật viên</div>
                    <Descriptions size="small" column={1} bordered={false}
                      items={[
                        { key: 'customer', label: 'Khách hàng', children: userMap[selectedBooking.customerId] || selectedBooking.customerId || 'UNKNOWN' },
                        { key: 'technician', label: 'Kỹ thuật viên', children: (selectedBooking?.technicianId ? (technicianMap[selectedBooking.technicianId] || '-') : 'UNKNOWN') },
                      ]}
                    />
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: '16px 0' }} />

              {/* Status & Flags */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Trạng thái & Thanh toán</div>
                <Row gutter={12}>
                  <Col span={6}>
                    <div style={{ textAlign: 'center', background: '#e6f7ff', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Trạng thái thanh toán</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1890ff' }}>{selectedBooking.paymentStatus || ''}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center', background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Loại đặt lịch</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.isUrgent ? '#faad14' : '#888' }}>{selectedBooking.isUrgent ? 'Đặt lịch ngay' : 'Đặt lịch theo lịch trình'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center', background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Khách hàng xác nhận</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888' }}>{selectedBooking.customerConfirmedDone ? 'Đã xác nhận' : 'Chưa xác nhận'}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center', background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Kỹ thuật viên xác nhận</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888' }}>{selectedBooking.technicianConfirmedDone ? 'Đã xác nhận' : 'Chưa xác nhận'}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Description */}
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Mô tả</div>
                <div style={{ color: '#333' }}>{selectedBooking.description || 'Chưa cung cấp mô tả'}</div>
              </div>

              {/* Images */}
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Hình ảnh</div>
                {selectedBooking.images && selectedBooking.images.length > 0 ? (
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {selectedBooking.images.map((img, idx) => (
                        <Col key={idx} span={4}>
                          <Image src={img} alt="booking" width={80} height={80} style={{ objectFit: 'cover', borderRadius: 6 }} />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                ) : (
                  <div style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: 20 }}>Chưa có hình ảnh</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
   </div>
 );
};


export default BookingManagement;