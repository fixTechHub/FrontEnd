import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import ApiBE from '../../services/ApiBE';
import { Modal, Button, Select } from 'antd';


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


 useEffect(() => {
   const fetchData = async () => {
     const data = await bookingAPI.getAll();
     setBookings(data || []);
     // Lấy tất cả customerId và serviceId duy nhất
     const customerIds = Array.from(new Set((data || []).map(b => b.customerId)));
     const serviceIds = Array.from(new Set((data || []).map(b => b.serviceId)));
     // Lấy tên customer
     const userMapTemp = {};
     await Promise.all(customerIds.map(async (id) => {
       try {
         const user = await userAPI.getById(id);
         userMapTemp[id] = user.fullName || user.email || id;
       } catch {
         userMapTemp[id] = id;
       }
     }));
     setUserMap(userMapTemp);
     // Lấy tên service
     const serviceMapTemp = {};
     await Promise.all(serviceIds.map(async (id) => {
       try {
         const res = await ApiBE.get(`/Dashboard/services/${id}`);
         serviceMapTemp[id] = res.data.name || id;
       } catch {
         serviceMapTemp[id] = id;
       }
     }));
     setServiceMap(serviceMapTemp);
   };
   fetchData();
 }, []);


 const filteredBookings = bookings.filter(b =>
   (userMap[b.customerId] || '').toLowerCase().includes(searchText.toLowerCase()) ||
   (serviceMap[b.serviceId] || '').toLowerCase().includes(searchText.toLowerCase()) ||
   (b.status || '').toLowerCase().includes(searchText.toLowerCase()) ||
   (b.id || '').toLowerCase().includes(searchText.toLowerCase())
 );
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
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('customer');
    setSortOrder('asc');
  }
};

const handleSortByService = () => {
  if (sortField === 'service') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('service');
    setSortOrder('asc');
  }
 };


 return (
   <div className="modern-page-wrapper">
     <div className="moder-content-card">
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
         <div className="top-search me-2">
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
                 ID
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
               <th>CREATED AT</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {currentBookings.map(b => (
               <tr key={b.id}>
                 <td>{b.id}</td>
                 <td>{userMap[b.customerId] || b.customerId}</td>
                 <td>{serviceMap[b.serviceId] || b.serviceId}</td>
                 <td>{b.status}</td>
                 <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</td>
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
             ))}
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
       >
         <div><b>ID:</b> {selectedBooking.id}</div>
         <div><b>Customer:</b> {userMap[selectedBooking.customerId] || selectedBooking.customerId}</div>
         <div><b>Service:</b> {serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId}</div>
         <div><b>Status:</b> {selectedBooking.status}</div>
         <div><b>Created At:</b> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ''}</div>
         <div><b>Schedule:</b> {selectedBooking.schedule?.startTime ? new Date(selectedBooking.schedule.startTime).toLocaleString() : ''} - {selectedBooking.schedule?.endTime ? new Date(selectedBooking.schedule.endTime).toLocaleString() : ''}</div>


       </Modal>
     )}
   </div>
 );
};


export default BookingManagement;

