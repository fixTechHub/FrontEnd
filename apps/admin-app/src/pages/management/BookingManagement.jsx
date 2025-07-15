import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import ApiBE from '../../services/ApiBE';
import { Modal, Button, Select, Descriptions, Spin } from 'antd';


const BookingManagement = () => {
 const [bookings, setBookings] = useState([]);
 const [userMap, setUserMap] = useState({});
 const [serviceMap, setServiceMap] = useState({});
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


 useEffect(() => {
   const fetchData = async () => {
     const data = await bookingAPI.getAll();
     setBookings(data || []);
     // Lấy tất cả customerId và serviceId duy nhất
     const customerIds = Array.from(new Set((data || []).map(b => b.customerId)));
     const serviceIds = Array.from(new Set((data || []).map(b => b.serviceId)));
     // Lấy tên customer (chỉ fetch nếu chưa có trong userMap)
     const userMapTemp = { ...userMap };
     await Promise.all(customerIds.map(async (id) => {
       if (id && !userMapTemp[id]) {
         try {
           const user = await userAPI.getById(id);
           userMapTemp[id] = user.fullName || user.email || id;
         } catch {
           userMapTemp[id] = id;
         }
       }
     }));
     setUserMap(userMapTemp);
     // Lấy tên service (chỉ fetch nếu chưa có trong serviceMap)
     const serviceMapTemp = { ...serviceMap };
     await Promise.all(serviceIds.map(async (id) => {
       if (id && !serviceMapTemp[id]) {
         try {
           const res = await ApiBE.get(`/Dashboard/services/${id}`);
           serviceMapTemp[id] = res.data.serviceName || id;
         } catch {
           serviceMapTemp[id] = id;
         }
       }
     }));
     setServiceMap(serviceMapTemp);
   };
   fetchData();
   // eslint-disable-next-line
 }, []);

useEffect(() => {
  // Gọi API lấy tất cả service
  const fetchAllServices = async () => {
    try {
      const res = await ApiBE.get('/Dashboard/services'); // hoặc endpoint đúng của bạn
      setAllServices(res.data || []);
    } catch {
      setAllServices([]);
    }
  };
  fetchAllServices();
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
               <Select.Option key={s.id} value={s.id}>{s.serviceName}</Select.Option>
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
             <Select.Option value="DONE">DONE</Select.Option>
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
               <th>TIME</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {!isDataReady ? (
               <tr>
                 <td><Spin /></td>
               </tr>
             ) : (
               currentBookings.map(b => (
                 <tr key={b.id}>
                   <td>{b.bookingCode || b.id}</td>
                   <td>{userMap[b.customerId]}</td>
                   <td>{serviceMap[b.serviceId]}</td>
                   <td>{b.status}</td>
                   <td>
                     {b.schedule && typeof b.schedule === 'object' && b.schedule.startTime
                       ? `${new Date(b.schedule.startTime).toLocaleString()} - ${b.schedule.endTime ? new Date(b.schedule.endTime).toLocaleString() : ''}`
                       : ''}
                   </td>
                   <td>
                     <Button size="small" onClick={() => { setSelectedBooking(b); setShowDetailModal(true); }}>
                       View Detail
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
         title="Booking Detail"
         width={600}
       >
         <Descriptions bordered column={1} size="middle">
           <Descriptions.Item label="Booking Code">{selectedBooking.bookingCode || selectedBooking.id}</Descriptions.Item>
           <Descriptions.Item label="Customer">{userMap[selectedBooking.customerId] || selectedBooking.customerId}</Descriptions.Item>
           <Descriptions.Item label="Service">{serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId}</Descriptions.Item>
           <Descriptions.Item label="Status">{selectedBooking.status}</Descriptions.Item>
           <Descriptions.Item label="Created At">{selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ''}</Descriptions.Item>
           <Descriptions.Item label="Schedule">
             {selectedBooking.schedule?.startTime ? new Date(selectedBooking.schedule.startTime).toLocaleString() : ''}
             {selectedBooking.schedule?.endTime ? ` - ${new Date(selectedBooking.schedule.endTime).toLocaleString()}` : ''}
           </Descriptions.Item>
           {/* Thêm các trường khác nếu cần */}
         </Descriptions>
       </Modal>
     )}
   </div>
 );
};


export default BookingManagement;

