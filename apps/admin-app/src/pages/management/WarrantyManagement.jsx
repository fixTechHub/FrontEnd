import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllWarranties, updateWarrantyStatus } from '../../features/warranty/warrantySlice';
import { Modal, Button, Select, Switch, message } from 'antd';
import { userAPI } from "../../features/users/userAPI";
import { technicianAPI } from "../../features/technicians/techniciansAPI";
import { bookingAPI } from '../../features/bookings/bookingAPI';


const statusOptions = [
 { value: 'PENDING', label: 'Pending' },
 { value: 'APPROVED', label: 'Approved' },
 { value: 'REJECTED', label: 'Rejected' },
];


const WarrantyManagement = () => {
 const dispatch = useDispatch();
 const { list: warranties, loading, error } = useSelector(state => state.warranty);
 const [searchText, setSearchText] = useState('');
 const [showModal, setShowModal] = useState(false);
 const [selected, setSelected] = useState(null);
 const [editStatus, setEditStatus] = useState('');
 const [editReviewed, setEditReviewed] = useState(false);
 const [userNames, setUserNames] = useState({});
 const [technicianNames, setTechnicianNames] = useState({});
 const [currentPage, setCurrentPage] = useState(1);
 const warrantiesPerPage = 10;
 const [bookingMap, setBookingMap] = useState({});


 useEffect(() => {
   dispatch(fetchAllWarranties());
   // Lấy toàn bộ user và technician một lần
   userAPI.getAll().then(users => {
     const map = {};
     users.forEach(u => { map[u.id] = u.fullName || u.email || u.id; });
     setUserNames(map);
   });
   technicianAPI.getAll().then(techs => {
     const map = {};
     techs.forEach(t => { map[t.id] = t.fullName || t.email || t.id; });
     setTechnicianNames(map);
   });
   // Lấy toàn bộ bookings để map bookingId -> bookingCode
   const fetchBookings = async () => {
     try {
       const bookings = await bookingAPI.getAll();
       const map = {};
       bookings.forEach(b => {
         map[b.id] = b.bookingCode || b.id;
       });
       setBookingMap(map);
     } catch {
       setBookingMap({});
     }
   };
   fetchBookings();
 }, [dispatch]);


 const filtered = warranties.filter(w => {
   const bookingId = (w.bookingId || '').toLowerCase();
   const customer = (userNames[w.customerId] || w.customerId || '').toLowerCase();
   const technician = (technicianNames[w.technicianId] || w.technicianId || '').toLowerCase();
   const search = searchText.toLowerCase();
   return (
     bookingId.includes(search) ||
     customer.includes(search) ||
     technician.includes(search)
   );
 });
 const indexOfLast = currentPage * warrantiesPerPage;
 const indexOfFirst = indexOfLast - warrantiesPerPage;
 const currentWarranties = filtered.slice(indexOfFirst, indexOfLast);
 const totalPages = Math.ceil(filtered.length / warrantiesPerPage);


 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 const openEdit = (w) => {
   setSelected(w);
   setEditStatus(w.status);
   setEditReviewed(w.isReviewedByAdmin);
   setShowModal(true);
 };


 const handleUpdate = async () => {
   try {
     await dispatch(updateWarrantyStatus({ id: selected.id, data: { status: editStatus, isReviewedByAdmin: editReviewed } })).unwrap();
     message.success('Cập nhật thành công!');
     setShowModal(false);
   } catch (e) {
     message.error('Cập nhật thất bại!');
   }
 };


 return (
   <div className="modern-page-wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Booking Warranties</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Booking Warranties</li>
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
               placeholder="Search warranties"
               value={searchText}
               onChange={e => setSearchText(e.target.value)}
             />
           </div>
         </div>
       </div>
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>Booking</th>
               <th>Customer</th>
               <th>Technician</th>
               <th>Status</th>
               <th>Under Warranty</th>
               <th>Reviewed</th>
               <th>Action</th>
             </tr>
           </thead>
           <tbody>
             {currentWarranties.map(w => (
               <tr key={w.id}>
                 <td>{bookingMap[w.bookingId] || w.bookingId}</td>
                 <td>
                   {userNames[w.customerId] || w.customerId}
                 </td>
                 <td>
                   {technicianNames[w.technicianId] || w.technicianId}
                 </td>
                 <td>{w.status}</td>
                 <td>{w.isUnderWarranty ? 'Yes' : 'No'}</td>
                 <td>{w.isReviewedByAdmin ? 'Yes' : 'No'}</td>
                 <td>
                   <Button size="small" onClick={() => openEdit(w)}>
                     Update
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
             {[...Array(totalPages)].map((_, index) => (
               <li
                 key={index}
                 className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
               >
                 <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                   {index + 1}
                 </button>
               </li>
             ))}
           </ul>
         </nav>
       </div>


     </div>
     <Modal
       open={showModal}
       onCancel={() => setShowModal(false)}
       onOk={handleUpdate}
       title="Cập nhật trạng thái bảo hành"
       okText="Cập nhật"
       confirmLoading={loading}
     >
       <div style={{ marginBottom: 16 }}>
         <b>Trạng thái:</b>
         <Select
           value={editStatus}
           onChange={setEditStatus}
           options={statusOptions}
           style={{ width: '100%' }}
         />
       </div>
       <div>
         <b>Đã duyệt bởi admin:</b>
         <Switch checked={editReviewed} onChange={setEditReviewed} />
       </div>
     </Modal>
   </div>
 );
};


export default WarrantyManagement;

