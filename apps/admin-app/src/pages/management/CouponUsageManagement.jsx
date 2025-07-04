import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCouponUsages, setFilters } from '../../features/couponusages/couponUsageSlice';
import { userAPI } from '../../features/users/userAPI';
import { couponAPI } from '../../features/coupons/couponAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { Modal, Button } from 'antd';


const CouponUsageManagement = () => {
 const dispatch = useDispatch();
 const { usages = [], loading = false, error = null, filters = {} } = useSelector(state => state.couponUsage) || {};


 const [userMap, setUserMap] = useState({});
 const [couponMap, setCouponMap] = useState({});
 const [bookingMap, setBookingMap] = useState({});
 const [showDetailModal, setShowDetailModal] = useState(false);
 const [selectedUsage, setSelectedUsage] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const couponsPerPage = 10;


 // Fetch usages + bookings
 useEffect(() => {
   dispatch(fetchCouponUsages());
   // Fetch all bookings for mapping bookingId -> bookingCode
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


 // Reset trang khi filter thay đổi
 useEffect(() => {
   setCurrentPage(1);
 }, [filters]);


 // Lấy thông tin user + coupon
 useEffect(() => {
   const fetchDetails = async () => {
     const userIds = Array.from(new Set(usages.map(u => u.userId)));
     const couponIds = Array.from(new Set(usages.map(u => u.couponId)));


     const userMapTemp = {};
     const couponMapTemp = {};


     await Promise.all([
       Promise.all(userIds.map(async (id) => {
         try {
           const user = await userAPI.getById(id);
           userMapTemp[id] = user.fullName || user.email || id;
         } catch {
           userMapTemp[id] = id;
         }
       })),
       Promise.all(couponIds.map(async (id) => {
         try {
           const coupon = await couponAPI.getById(id);
           couponMapTemp[id] = coupon.code || id;
         } catch {
           couponMapTemp[id] = id;
         }
       }))
     ]);


     setUserMap(userMapTemp);
     setCouponMap(couponMapTemp);
   };


   if (usages.length > 0) fetchDetails();
 }, [usages]);


 // Lọc dữ liệu
 const filteredUsages = usages.filter((usage) => {
   const userValue = userMap[usage.userId] || usage.userId || '';
   const couponValue = couponMap[usage.couponId] || usage.couponId || '';
   const bookingIdValue = usage.bookingId || '';
   return (
     (!filters.search ||
       userValue.toLowerCase().includes(filters.search.toLowerCase()) ||
       couponValue.toLowerCase().includes(filters.search.toLowerCase()) ||
       bookingIdValue.toLowerCase().includes(filters.search.toLowerCase())) &&
     (!filters.user || userValue.toLowerCase().includes(filters.user.toLowerCase())) &&
     (!filters.coupon || couponValue.toLowerCase().includes(filters.coupon.toLowerCase())) &&
     (!filters.bookingId || bookingIdValue.toLowerCase().includes(filters.bookingId.toLowerCase()))
   );
 });


 // Phân trang
 const indexOfLast = currentPage * couponsPerPage;
 const indexOfFirst = indexOfLast - couponsPerPage;
 const currentPageData = filteredUsages.slice(indexOfFirst, indexOfLast);
 const totalPages = Math.ceil(filteredUsages.length / couponsPerPage);


 const handlePageChange = (pageNumber) => {
   setCurrentPage(pageNumber);
 };


 const handleSearchChange = (e) => {
   dispatch(setFilters({ search: e.target.value }));
 };


 return (
   <div className="modern-page-wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Coupon Usages</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Coupon Usages</li>
             </ol>
           </nav>
         </div>
       </div>


       <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
         <div className="top-search me-2">
           <div className="top-search-group">
             <span className="input-icon"><i className="ti ti-search" /></span>
             <input
               type="text"
               className="form-control"
               placeholder="Search"
               value={filters.search || ''}
               onChange={handleSearchChange}
             />
           </div>
         </div>
       </div>


       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>USER</th>
               <th>COUPON</th>
               <th>BOOKING CODE</th>
               <th>USED AT</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {currentPageData.map((usage) => (
               <tr key={usage.id}>
                 <td>{userMap[usage.userId] || usage.userId}</td>
                 <td>{couponMap[usage.couponId] || usage.couponId}</td>
                 <td>{bookingMap[usage.bookingId] || usage.bookingId}</td>
                 <td>{usage.usedAt ? new Date(usage.usedAt).toLocaleString() : ''}</td>
                 <td>
                   <Button size="small" onClick={() => { setSelectedUsage(usage); setShowDetailModal(true); }}>
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
               <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                 <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
               </li>
             ))}
           </ul>
         </nav>
       </div>
     </div>


     {showDetailModal && selectedUsage && (
       <Modal
         open={showDetailModal}
         onCancel={() => setShowDetailModal(false)}
         footer={null}
         title="Coupon Usage Detail"
       >
         <div><b>ID:</b> {selectedUsage.id}</div>
         <div><b>User:</b> {userMap[selectedUsage.userId] || selectedUsage.userId}</div>
         <div><b>Coupon:</b> {couponMap[selectedUsage.couponId] || selectedUsage.couponId}</div>
         <div><b>Booking Code:</b> {bookingMap[selectedUsage.bookingId] || selectedUsage.bookingId}</div>
         <div><b>Used At:</b> {selectedUsage.usedAt ? new Date(selectedUsage.usedAt).toLocaleString() : ''}</div>
       </Modal>
     )}
   </div>
 );
};


export default CouponUsageManagement;



