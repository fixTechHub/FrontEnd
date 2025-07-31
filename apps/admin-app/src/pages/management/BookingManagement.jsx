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


 return (
   <div className="modern-page-wrapper">
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
             <Select.Option value="AWAITING_DONE">AWAITING_DONE</Select.Option>
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
         width={650}
       >
         <div style={{background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', padding: 0}}>
           {/* Section: Main Info */}
           <div style={{padding: 24, borderBottom: '1px solid #eee', background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16}}>
             <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#222'}}>Booking Detail</div>
             <div style={{display: 'flex', flexWrap: 'wrap', gap: 24}}>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Booking Code</div>
                 <div>{selectedBooking.bookingCode || selectedBooking.id}</div>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Customer</div>
                 <div>{userMap[selectedBooking.customerId] || selectedBooking.customerId || "UNKNOWN"}</div>
               </div>
               <div>
                <div style={{fontWeight: 500, color: '#888'}}>Technician</div>
                <div>{selectedBooking?.technicianId
                  ? (technicianMap[selectedBooking.technicianId] ? technicianMap[selectedBooking.technicianId] : "-")
                  : "UNKNOWN"}
                </div>
              </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Service</div>
                 <div>{serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId}</div>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Location</div>
                 <div>{selectedBooking.location?.address}</div>
               </div>
             </div>
           </div>
           {/* Section: Status & Payment */}
           <div style={{padding: 20, borderBottom: '1px solid #eee', background: '#f6faff'}}>
             <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Status</div>
                 <span style={{background: '#e6f7ff', color: '#1890ff', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.status ? selectedBooking.status.replace(/_/g, ' ') : ''}</span>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Payment</div>
                 <span style={{background: '#f6ffed', color: '#52c41a', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.paymentStatus}</span>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Is Urgent</div>
                 <span style={{background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', color: selectedBooking.isUrgent ? '#faad14' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.isUrgent ? 'Yes' : 'No'}</span>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Customer Confirmed</div>
                 <span style={{background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.customerConfirmedDone ? 'Yes' : 'No'}</span>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888'}}>Technician Confirmed</div>
                 <span style={{background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.technicianConfirmedDone ? 'Yes' : 'No'}</span>
               </div>
             </div>
           </div>
           {/* Section: Schedule & Description */}
           <div style={{padding: 20, borderBottom: '1px solid #eee', background: '#fff'}}>
             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Schedule</div>
             <div style={{marginBottom: 12}}>
                {selectedBooking.schedule?.startTime
                  ? dayjs(selectedBooking.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')
                  : ''}
                {selectedBooking.schedule?.endTime
                  ? ` - ${dayjs(selectedBooking.schedule.endTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                  : (selectedBooking.schedule?.expectedEndTime
                      ? ` - ${dayjs(selectedBooking.schedule.expectedEndTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                      : '')}
              </div>
             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Description</div>
             <div>{selectedBooking.description}</div>
           </div>
           {/* Section: Images */}
           <div style={{padding: 20, background: '#f6faff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16}}>
             <div style={{fontWeight: 500, color: '#888', marginBottom: 8}}>Images</div>
             <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', minHeight: 60}}>
               {selectedBooking.images && selectedBooking.images.length > 0 ? selectedBooking.images.map((img, idx) => (
                 <img key={idx} src={img} alt="img" style={{maxWidth: 120, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover'}} />
               )) : <span style={{color: '#aaa'}}>N/A</span>}
             </div>
           </div>
         </div>
       </Modal>
     )}
   </div>
 );
};


export default BookingManagement;

