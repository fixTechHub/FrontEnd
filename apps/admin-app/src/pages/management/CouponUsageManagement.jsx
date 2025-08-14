import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCouponUsages, setFilters } from '../../features/couponusages/couponUsageSlice';
import { userAPI } from '../../features/users/userAPI';
import { couponAPI } from '../../features/coupons/couponAPI';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { Modal, Button, Select, Descriptions, Spin, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';


const CouponUsageManagement = () => {
 const dispatch = useDispatch();
 const { usages = [], loading = false, error = null, filters = {} } = useSelector(state => state.couponUsage) || {};


 const [userMap, setUserMap] = useState({});
 const [couponMap, setCouponMap] = useState({});
 const [bookingMap, setBookingMap] = useState({});
 const [showDetailModal, setShowDetailModal] = useState(false);
 const [selectedUsage, setSelectedUsage] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [couponsPerPage, setCouponsPerPage] = useState(10);
 const [sortField, setSortField] = useState('usedAt');
const [sortOrder, setSortOrder] = useState('desc');
const [hasSorted, setHasSorted] = useState(false);
const [isDataReady, setIsDataReady] = useState(false);


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
   
   // Reset sort state khi component mount
   setHasSorted(false);
   setSortField('usedAt');
   setSortOrder('desc');
   console.log('🚀 Component mounted, resetting sort state');
 }, [dispatch]);


 // Reset trang khi filter thay đổi
 useEffect(() => {
   setCurrentPage(1);
 }, [filters]);

 // Reset to first page when search text changes
 useEffect(() => {
   setCurrentPage(1);
 }, [filters.search, filters.user, filters.coupon, filters.bookingId]);


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
         } catch (err) {
           if (err.response && err.response.status === 404) {
             // User not found, do not log error
             userMapTemp[id] = id;
           } else {
             console.error('Get user by ID error:', err);
             userMapTemp[id] = id;
           }
         }
       })),
       Promise.all(couponIds.map(async (id) => {
         try {
           const coupon = await couponAPI.getById(id);
           couponMapTemp[id] = coupon.code || id;
         } catch (err) {
           if (err.response && err.response.status === 404) {
             // Coupon not found, do not log error
             couponMapTemp[id] = id;
           } else {
             console.error('Get coupon by ID error:', err);
             couponMapTemp[id] = id;
           }
         }
       }))
     ]);


     setUserMap(userMapTemp);
     setCouponMap(couponMapTemp);
     setIsDataReady(true);
   };


   if (usages.length > 0) fetchDetails();
 }, [usages]);

 // Đảm bảo sắp xếp mặc định khi dữ liệu được load
 useEffect(() => {
   if (usages.length > 0) {
     // Force set sort state
     setSortField('usedAt');
     setSortOrder('desc');
     setHasSorted(false);
     console.log('🔧 FORCE setting default sort: usedAt desc');
   }
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
 // Force sắp xếp mới nhất trước theo usedAt
 const sortedUsages = [...filteredUsages].sort((a, b) => {
  console.log(`🔍 Sorting: sortField=${sortField}, sortOrder=${sortOrder}`);
  
  // LUÔN sắp xếp theo usedAt mới nhất trước khi không có sortField cụ thể
  if (!sortField || sortField === 'usedAt') {
    const dateA = new Date(a.usedAt || 0);
    const dateB = new Date(b.usedAt || 0);
    console.log(`📅 FORCE sorting by usedAt DESC: ${dateA.toISOString()} vs ${dateB.toISOString()}`);
    // Luôn trả về mới nhất trước, bỏ qua sortOrder
    return dateB - dateA;
  }
  
  if (sortField === 'user') {
    const nameA = (userMap[a.userId] || '').toLowerCase();
    const nameB = (userMap[b.userId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  } else if (sortField === 'coupon') {
    const codeA = (couponMap[a.couponId] || '').toLowerCase();
    const codeB = (couponMap[b.couponId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return codeA.localeCompare(codeB);
    } else {
      return codeB.localeCompare(codeA);
    }
  } else if (sortField === 'booking') {
    const codeA = (bookingMap[a.bookingId] || '').toLowerCase();
    const codeB = (bookingMap[b.bookingId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return codeA.localeCompare(codeB);
    } else {
      return codeB.localeCompare(codeA);
    }
  }
  
  // Fallback: LUÔN sắp xếp theo thời gian sử dụng mới nhất trước
  const dateA = new Date(a.usedAt || 0);
  const dateB = new Date(b.usedAt || 0);
  console.log(`📅 FORCE fallback sorting DESC: ${dateA.toISOString()} vs ${dateB.toISOString()}`);
  return dateB - dateA;
 });
const currentPageData = sortedUsages.slice(indexOfFirst, indexOfLast);

// Set export data và columns
useEffect(() => {
  const exportColumns = [
    { title: 'Mã giảm giá', dataIndex: 'couponCode' },
    { title: 'Khách hàng', dataIndex: 'userName' },
    { title: 'Đơn hàng', dataIndex: 'bookingCode' },
    { title: 'Thời gian sử dụng', dataIndex: 'usedAt' },
    { title: 'Thời gian tạo', dataIndex: 'createdAt' },
  ];

  const exportData = sortedUsages.map(usage => ({
    couponCode: couponMap[usage.couponId] || usage.couponId,
    userName: userMap[usage.userId] || usage.userId,
    bookingCode: bookingMap[usage.bookingId] || usage.bookingId,
    discountApplied: formatCurrency(usage.discountApplied || 0),
    usedAt: formatDateTime(usage.usedAt),
    createdAt: formatDateTime(usage.createdAt),
    updatedAt: formatDateTime(usage.updatedAt),
  }));

  createExportData(exportData, exportColumns, 'coupon_usages_export', 'Coupon Usages');
 }, [sortedUsages, couponMap, userMap, bookingMap]);

 // Debug: Log dữ liệu sắp xếp
 useEffect(() => {
   if (sortedUsages.length > 0) {
     console.log('🔍 Original usages:', usages.slice(0, 3).map(u => ({ id: u.id, usedAt: u.usedAt })));
     console.log('🔍 Sorted usages:', sortedUsages.slice(0, 3).map(u => ({ id: u.id, usedAt: u.usedAt })));
     console.log('🔍 Sort config:', { sortField, sortOrder });
   }
 }, [sortedUsages, sortField, sortOrder]);

 // Force re-render khi sort state thay đổi
 useEffect(() => {
   console.log('🔄 Sort state changed:', { sortField, sortOrder, hasSorted });
 }, [sortField, sortOrder, hasSorted]);

 const totalPages = Math.ceil(filteredUsages.length / couponsPerPage);

 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 const handleSearchChange = (e) => {
   dispatch(setFilters({ search: e.target.value }));
 };


 const handleSortByUser = () => {
  setHasSorted(true);
  if (sortField === 'user') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('user');
    setSortOrder('asc');
  }
};
const handleSortByCoupon = () => {
  setHasSorted(true);
  if (sortField === 'coupon') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('coupon');
    setSortOrder('asc');
  }
};
const handleSortByBooking = () => {
  setHasSorted(true);
  if (sortField === 'booking') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('booking');
    setSortOrder('asc');
  }
};
const handleSortByUsedAt = () => {
  setHasSorted(true);
  if (sortField === 'usedAt') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('usedAt');
    setSortOrder('desc');
  }
};


 const handleSortChange = (value) => {
  setHasSorted(true);
  if (value === 'lasted') {
    setSortField('usedAt');
    setSortOrder('desc');
  } else if (value === 'oldest') {
    setSortField('usedAt');
    setSortOrder('asc');
  }
};


 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Lịch sử sử dụng mã giảm giá</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
               <li className="breadcrumb-item active">Lịch sử sử dụng mã giảm giá</li>
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
               placeholder="Tìm kiếm đơn hàng, mã giảm giá, khách hàng..."
               value={filters.search || ''}
               onChange={handleSearchChange}
             />
           </div>
         </div>
         <div className="d-flex align-items-center">
           <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
                       <Select
              value="lasted"
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
       {filters.search && (
         <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
           <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
           <span className="badge bg-primary-transparent">
             <i className="ti ti-search me-1"></i>
             Tìm kiếm: "{filters.search}"
           </span>
           <button 
             className="btn btn-sm btn-outline-secondary"
             onClick={() => {
               dispatch(setFilters({ ...filters, search: '' }));
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
               <th style={{ cursor: 'pointer' }} onClick={handleSortByUser}>
                 Khách hàng
                 {sortField === 'user' && hasSorted && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByCoupon}>
                 Mã giảm giá
                 {sortField === 'coupon' && hasSorted && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByBooking}>
                 Mã đơn hàng
                 {sortField === 'booking' && hasSorted && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByUsedAt}>
                 Thời gian sử dụng
                 {sortField === 'usedAt' && hasSorted && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th>Hàng động</th>
             </tr>
           </thead>
           <tbody>
             {!isDataReady ? (
               <tr>
                 <td colSpan={5} className="text-center">
                   <div className="spinner-border text-primary" role="status">
                     <span className="visually-hidden">Loading...</span>
                   </div>
                 </td>
               </tr>
             ) : filteredUsages.length === 0 ? (
               <tr>
                 <td colSpan={5} className="text-center text-muted py-4">
                   <div>
                     <i className="ti ti-ticket" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                     <p className="mb-0">Không có lịch sử sử dụng nào</p>
                   </div>
                 </td>
               </tr>
             ) : currentPageData.length === 0 ? (
               <tr>
                 <td colSpan={5} className="text-center text-muted py-4">
                   <div>
                     <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                     <p className="mb-0">Không tìm thấy lịch sử sử dụng nào phù hợp</p>
                   </div>
                 </td>
               </tr>
             ) : (
               currentPageData.map((usage) => (
                 <tr key={usage.id}>
                   <td>{userMap[usage.userId] || usage.userId || ""}</td>
                   <td>{couponMap[usage.couponId]}</td>
                   <td>{bookingMap[usage.bookingId]}</td>
                   <td>{usage.usedAt ? new Date(usage.usedAt).toLocaleString() : ''}</td>
                   <td>
                     <Button className="management-action-btn" size="middle" onClick={() => { setSelectedUsage(usage); setShowDetailModal(true); }}>
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
             Hiển thị {indexOfFirst + 1}-{Math.min(indexOfLast, filteredUsages.length)} trong tổng số {filteredUsages.length} lịch sử sử dụng
           </div>
           {filters.search && (
             <div className="text-muted">
               <i className="ti ti-filter me-1"></i>
               Đã lọc theo: {filters.search && `Tìm kiếm: "${filters.search}"`}
             </div>
           )}
         </div>
         {filteredUsages.length > 0 && (
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


     {/* Coupon Usage Details Modal */}
     {showDetailModal && selectedUsage && (
       <Modal
         open={showDetailModal}
         onCancel={() => setShowDetailModal(false)}
         footer={null}
         title={null}
         width={960}
         styles={{ body: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
       >
         <div style={{ background: '#fff', borderRadius: 16 }}>
           <div style={{
             background: 'linear-gradient(135deg, #1890ff 0%, #73d13d 100%)',
             padding: '20px 24px',
             color: '#fff'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700 }}>
                 Chi tiết sử dụng mã giảm giá
               </div>
               <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                 USED
               </Tag>
             </div>
             {selectedUsage.id && (
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontFamily: 'monospace', fontSize: 15 }}>ID: {selectedUsage.id}</span>
               </div>
             )}
           </div>
           <div style={{ padding: 24 }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
               {/* Overview */}
               <div>
                 <div style={{
                   background: '#ffffff',
                   border: '1px solid #f0f0f0',
                   borderRadius: 12,
                   padding: 16,
                   marginBottom: 16,
                 }}>
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Tỏng quan</div>
                   <div style={{ display: 'grid', rowGap: 10 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Thời gian sử dụng</span>
                       <span style={{ fontWeight: 600 }}>{selectedUsage.usedAt ? new Date(selectedUsage.usedAt).toLocaleString() : ''}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Trạng thái</span>
                       <span style={{ fontWeight: 600, color: '#52c41a' }}>ACTIVE</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* People */}
               <div>
                 <div style={{
                   background: '#ffffff',
                   border: '1px solid #f0f0f0',
                   borderRadius: 12,
                   padding: 16,
                 }}>
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thông tin</div>
                   <div style={{ display: 'grid', rowGap: 12 }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Khách hàng</span>
                       <span style={{ fontWeight: 600 }}>{userMap[selectedUsage.userId] || selectedUsage.userId || ''}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Mã giảm giá</span>
                       <span style={{ fontWeight: 600 }}>{couponMap[selectedUsage.couponId] || selectedUsage.couponId || ''}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Booking Information full width */}
               <div style={{ gridColumn: '1 / span 2' }}>
                 <div style={{
                   background: '#ffffff',
                   border: '1px solid #f0f0f0',
                   borderRadius: 12,
                   padding: 16,
                   marginBottom: 16,
                 }}>
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thông tin đơn hàng</div>
                   <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <span style={{ color: '#8c8c8c' }}>Mã đơn hàng:</span>
                       <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{bookingMap[selectedUsage.bookingId] || ''}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Áp dụng:</span>
                       <span style={{ fontWeight: 600, color: '#52c41a' }}>✓ Đã áp dụng</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </Modal>
     )}
   </div>
 );
};


export default CouponUsageManagement;



