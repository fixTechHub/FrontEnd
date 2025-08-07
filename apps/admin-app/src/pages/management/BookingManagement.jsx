import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import ApiBE from '../../services/ApiBE';
import { Modal, Button, Select, Descriptions, Spin } from 'antd';
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
 const bookingsPerPage = 10;
 const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');
const [filterService, setFilterService] = useState('');
const [filterStatus,  setFilterStatus] = useState('');
const [allServices, setAllServices] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);


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
}, [filterService, filterStatus]);


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
    { title: 'Booking Code', dataIndex: 'bookingCode' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Service', dataIndex: 'serviceName' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Technician', dataIndex: 'technicianName' },
    { title: 'Created At', dataIndex: 'createdAt' },
    { title: 'Updated At', dataIndex: 'updatedAt' },
    { title: 'Description', dataIndex: 'description' },
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
   { title: 'Booking Code', dataIndex: 'bookingCode' },
   { title: 'Customer', dataIndex: 'customerName' },
   { title: 'Service', dataIndex: 'serviceName' },
   { title: 'Status', dataIndex: 'status' },
   { title: 'Technician', dataIndex: 'technicianName' },
   { title: 'Created At', dataIndex: 'createdAt' },
   { title: 'Updated At', dataIndex: 'updatedAt' },
   { title: 'Description', dataIndex: 'description' },
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
           <h4 className="mb-1">Bookings</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Bookings</li>
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
                 placeholder="Search bookings"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
           <Select
             placeholder="Service"
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
             placeholder="Status"
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
           <span style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</span>
           <Select
             value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
             style={{ width: 120 }}
             onChange={handleSortChange}
             options={[
               { value: 'lasted', label: 'Lasted' },
               { value: 'oldest', label: 'Oldest' },
             ]}
           />
         </div>
       </div>
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th style={{ cursor: 'pointer' }} onClick={handleSortById}>
                 BOOKING CODE
                 {sortField === 'id' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByCustomer}>
                 CUSTOMER
                 {sortField === 'customer' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByService}>
                 SERVICE
                 {sortField === 'service' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th>STATUS</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {loading ? (
               <tr>
                 <td><Spin /></td>
               </tr>
             ) : error ? (
               <tr>
                 <td colSpan={6} style={{ color: 'red' }}>{error.message || 'Failed to fetch bookings.'}</td>
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
                       <EyeOutlined style={{marginRight: 4}} />View Detail
                     </Button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
       <div className="d-flex justify-content-end mt-3">
         <nav>
           <ul className="pagination mb-0">
             {[...Array(totalPages)].map((_, i) => (
               <li
                 key={i}
                 className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
               >
                 <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                   {i + 1}
                 </button>
               </li>
             ))}
           </ul>
         </nav>
       </div>
     </div>
     {showDetailModal && selectedBooking && (
       <Modal
         open={showDetailModal}
         onCancel={() => setShowDetailModal(false)}
         footer={null}
         title={null}
         width={700}
       >
         <div style={{background: '#ffffff', borderRadius: 12, overflow: 'hidden'}}>
           {/* Header Section */}
           <div style={{background: 'linear-gradient(135deg, #000 0%, #FFAF47 100%)', padding: '24px', color: 'white'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div>
                 <div style={{fontSize: '24px', fontWeight: 700, marginBottom: '4px'}}>Booking Details</div>
                 <div style={{fontSize: '14px', opacity: 0.9}}>ID: {selectedBooking.bookingCode || selectedBooking.id}</div>
               </div>
               <div style={{textAlign: 'right'}}>
                 <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '4px'}}>Status</div>
                 <div style={{
                   background: 'rgba(255,255,255,0.2)', 
                   padding: '6px 12px', 
                   borderRadius: '20px',
                   fontSize: '12px',
                   fontWeight: 600
                 }}>
                   {selectedBooking.status ? selectedBooking.status.replace(/_/g, ' ') : ''}
                 </div>
               </div>
             </div>
           </div>

           {/* Main Content */}
           <div style={{padding: '24px'}}>
             {/* Basic Information Grid */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Basic Information</div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                 gap: '16px'
               }}>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Customer</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {userMap[selectedBooking.customerId] || selectedBooking.customerId || "UNKNOWN"}
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Technician</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedBooking?.technicianId
                       ? (technicianMap[selectedBooking.technicianId] ? technicianMap[selectedBooking.technicianId] : "-")
                       : "UNKNOWN"}
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Service</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId}
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Location</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedBooking.location?.address || 'N/A'}
                   </div>
                 </div>
               </div>
             </div>

             {/* Status & Payment Section */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Status & Payment</div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                 gap: '12px'
               }}>
                 <div style={{textAlign: 'center', background: '#e6f7ff', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Payment Status</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: '#1890ff'}}>{selectedBooking.paymentStatus}</div>
                 </div>
                 <div style={{textAlign: 'center', background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Urgent</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.isUrgent ? '#faad14' : '#888'}}>{selectedBooking.isUrgent ? 'Yes' : 'No'}</div>
                 </div>
                 <div style={{textAlign: 'center', background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Customer Confirmed</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888'}}>{selectedBooking.customerConfirmedDone ? 'Yes' : 'No'}</div>
                 </div>
                 <div style={{textAlign: 'center', background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Technician Confirmed</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888'}}>{selectedBooking.technicianConfirmedDone ? 'Yes' : 'No'}</div>
                 </div>
               </div>
             </div>

             {/* Schedule & Description Section */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Schedule & Description</div>
               <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                 <div style={{marginBottom: '12px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Schedule</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedBooking.schedule?.startTime
                       ? dayjs(selectedBooking.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')
                       : ''}
                     {selectedBooking.schedule?.endTime
                       ? ` - ${dayjs(selectedBooking.schedule.endTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                       : (selectedBooking.schedule?.expectedEndTime
                           ? ` - ${dayjs(selectedBooking.schedule.expectedEndTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                           : '')}
                   </div>
                 </div>
                 <div>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Description</div>
                   <div style={{fontSize: '14px', color: '#333', lineHeight: '1.5'}}>
                     {selectedBooking.description || 'No description provided'}
                   </div>
                 </div>
               </div>
             </div>

             {/* Images Section */}
             <div>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Images</div>
               <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                 {selectedBooking.images && selectedBooking.images.length > 0 ? (
                   <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                     {selectedBooking.images.map((img, idx) => (
                       <img 
                         key={idx} 
                         src={img} 
                         alt="booking" 
                         style={{
                           width: '80px', 
                           height: '80px', 
                           borderRadius: '6px', 
                           objectFit: 'cover',
                           border: '1px solid #e9ecef'
                         }} 
                       />
                     ))}
                   </div>
                 ) : (
                   <div style={{color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px'}}>No images available</div>
                 )}
               </div>
             </div>
           </div>
         </div>
       </Modal>
     )}
   </div>
 );
};


export default BookingManagement;