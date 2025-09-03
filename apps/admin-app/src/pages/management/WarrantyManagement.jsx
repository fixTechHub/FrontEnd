import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllWarranties, updateWarrantyStatus, updateWarrantyDetails } from '../../features/warranty/warrantySlice';
import { Modal, Button, Select, Switch, message, Descriptions, Spin, Form, Input, Row, Col, Tag, Space } from 'antd';
import { userAPI } from "../../features/users/userAPI";
import { technicianAPI } from "../../features/technicians/techniciansAPI";
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import "../../styles/ManagementTableStyle.css";
import { createExportData, formatDateTime } from '../../utils/exportUtils';


const statusOptions = [
 { value: 'PENDING', label: 'Chờ xử lý' },
 { value: 'DONE', label: 'Đã hoàn thành' },
 { value: 'CONFIRMED', label: 'Đã xác nhận' },
 { value: 'RESOLVED', label: 'Đã giải quyết' },
 { value: 'DENIED', label: 'Đã từ chối' },
 { value: 'EXPIRED', label: 'Hết hạn' },
];

const WarrantyManagement = () => {
  const dispatch = useDispatch();
  const { list: warranties, loading, error } = useSelector(state => state.warranty);
  
  // Hàm để lấy màu sắc cho status
  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'default';
      case 'CONFIRMED':
        return 'processing';
      case 'DONE':
        return 'green';
      case 'RESOLVED':
        return 'success';
      case 'DENIED':
        return 'red';
      case 'EXPIRED':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Hàm để chuyển đổi status sang tiếng Việt
  const getStatusDisplayText = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'DONE':
        return 'Đã hoàn thành';
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'DENIED':
        return 'Đã từ chối';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status || 'N/A';
    }
  };

  // Hàm để chuyển đổi tình trạng bảo hành sang tiếng Việt
  const getWarrantyStatusText = (isUnderWarranty) => {
    return isUnderWarranty ? 'Có bảo hành' : 'Không bảo hành';
  };

  // Hàm để chuyển đổi trạng thái admin review sang tiếng Việt
  const getAdminReviewText = (isReviewedByAdmin) => {
    return isReviewedByAdmin ? 'Đã duyệt' : 'Chưa duyệt';
  };
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  // 🔄 IsReviewedByAdmin sẽ tự động được set thành true khi admin thay đổi
  const [editResolutionNote, setEditResolutionNote] = useState('');
  const [editRejectionReason, setEditRejectionReason] = useState('');
  const [userNames, setUserNames] = useState({});
  const [technicianNames, setTechnicianNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [warrantiesPerPage, setWarrantiesPerPage] = useState(10);
  const [bookingMap, setBookingMap] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState();
  const [filterUnderWarranty, setFilterUnderWarranty] = useState();
  // 🔄 Không còn cần filter isReviewedByAdmin vì nó sẽ tự động được set thành true khi admin thay đổi
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [serviceNames, setServiceNames] = useState({});


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
   // Lấy toàn bộ services để map serviceId -> serviceName
   serviceAPI.getAll().then(services => {
     const map = {};
     services.forEach(s => { map[s.id] = s.serviceName || s.name || s.id; });
     setServiceNames(map);
   });
   // Lấy toàn bộ bookings để map bookingId -> bookingCode
   const fetchBookings = async () => {
     try {
       const bookings = await bookingAPI.getAll();
       const map = {};
       bookings.forEach(b => {
         map[b.id] = b.bookingCode || '';
       });
       setBookingMap(map);
     } catch {
       setBookingMap({});
     }
   };
   fetchBookings();
 }, [dispatch]);

 // Reset to first page when filters change
 useEffect(() => {
   setCurrentPage(1);
 }, [searchText, filterStatus, filterUnderWarranty]);

 const filtered = warranties.filter(w => {
   const bookingId = (w.bookingId || '').toLowerCase();
   const customer = (userNames[w.customerId] || w.customerId || '').toLowerCase();
   const technician = (technicianNames[w.technicianId] || w.technicianId || '').toLowerCase();
   const search = searchText.toLowerCase();
   return (
     (bookingId.includes(search) || customer.includes(search) || technician.includes(search)) &&
     (!filterStatus || w.status === filterStatus) &&
     (!filterUnderWarranty || (filterUnderWarranty === 'Yes' ? w.isUnderWarranty : !w.isUnderWarranty))
   );
 });
 const indexOfLast = currentPage * warrantiesPerPage;
 const indexOfFirst = indexOfLast - warrantiesPerPage;
 const sorted = [...filtered].sort((a, b) => {
  if (sortField === 'bookingId') {
    if (!a.bookingId) return 1;
    if (!b.bookingId) return -1;
    if (sortOrder === 'asc') {
      return (a.bookingId || '').localeCompare(b.bookingId || '');
    } else {
      return (b.bookingId || '').localeCompare(a.bookingId || '');
    }
  } else if (sortField === 'customer') {
    const nameA = (userNames[a.customerId] || '').toLowerCase();
    const nameB = (userNames[b.customerId] || '').toLowerCase();
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  } else if (sortField === 'technician') {
    const nameA = (technicianNames[a.technicianId] || '').toLowerCase();
    const nameB = (technicianNames[b.technicianId] || '').toLowerCase();
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
const currentWarranties = sorted.slice(indexOfFirst, indexOfLast);

// Set export data và columns
useEffect(() => {
  const exportColumns = [
    { title: 'Mã đơn hàng', dataIndex: 'Mã đơn hàng' },
    { title: 'Khách hàng', dataIndex: 'Khách hàng' },
    { title: 'Kỹ thuật viên', dataIndex: 'Kỹ thuật viên' },
    { title: 'Trạng thái', dataIndex: 'Trạng thái' },
    { title: 'Tình trạng bảo hành', dataIndex: 'Tình trạng bảo hành' },
    { title: 'Thời gian tạo', dataIndex: 'Thời gian tạo' }
  ];

  const exportData = sorted.map(warranty => ({
    'Mã đơn hàng': bookingMap[warranty.bookingId] || warranty.bookingId,
    'Khách hàng': userNames[warranty.customerId] || warranty.customerId,
    'Kỹ thuật viên': technicianNames[warranty.technicianId] || warranty.technicianId,
    'Trạng thái': getStatusDisplayText(warranty.status),
    'Tình trạng bảo hành': getWarrantyStatusText(warranty.isUnderWarranty),
    'Thời gian tạo': formatDateTime(warranty.createdAt),
  }));

  createExportData(exportData, exportColumns, 'warranties_export', 'Warranties');
}, [sorted, userNames, technicianNames, serviceNames, bookingMap]);

const totalPages = Math.ceil(filtered.length / warrantiesPerPage);


 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 const openEdit = (w) => {
   setSelected(w);
   setEditStatus(w.status);
   // 🔄 IsReviewedByAdmin sẽ tự động được set thành true khi admin thay đổi
   setEditResolutionNote(w.resolutionNote || '');
   setEditRejectionReason(w.rejectionReason || '');
   
   // Khởi tạo font properties từ dữ liệu hiện có hoặc default
   // setResolutionFontFamily(w.resolutionFontFamily || 'Arial'); // Removed as per new modal
   // setResolutionFontSize(w.resolutionFontSize || 14); // Removed as per new modal
   // setResolutionTextAlign(w.resolutionTextAlign || 'left'); // Removed as per new modal
   // setRejectionFontFamily(w.rejectionFontFamily || 'Arial'); // Removed as per new modal
   // setRejectionFontSize(w.rejectionFontSize || 14); // Removed as per new modal
   // setRejectionTextAlign(w.rejectionTextAlign || 'left'); // Removed as per new modal
   
   setShowModal(true);
 };


 const handleUpdate = async () => {
   try {
     const updateData = {
       status: editStatus,
       // 🔄 IsReviewedByAdmin sẽ tự động được set thành true khi admin thay đổi
       resolutionNote: editResolutionNote.trim() || null,
       rejectionReason: editRejectionReason.trim() || null
     };
     
     await dispatch(updateWarrantyDetails({ id: selected.id, data: updateData })).unwrap();
     message.success('Cập nhật thành công!');
     setShowModal(false);
   } catch (e) {
     message.error('Cập nhật thất bại!');
   }
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

const handleSortByBooking = () => {
  if (sortField === 'bookingId') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('bookingId');
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

const handleSortByTechnician = () => {
  if (sortField === 'technician') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('technician');
    setSortOrder('asc');
  }
};


 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Bảo hành đơn hàng</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
               <li className="breadcrumb-item active">Bảo hành đơn hàng</li>
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
                 placeholder="Tìm kiếm Kỹ thuật viên..."
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>           
           <Select
             placeholder="Tình trạng bảo hành"
             value={filterUnderWarranty || undefined}
             onChange={value => setFilterUnderWarranty(value)}
             style={{ width: 150 }}
             allowClear
           >
             <Select.Option value="Yes">Có bảo hành</Select.Option>
             <Select.Option value="No">Không bảo hành</Select.Option>
           </Select>
           <Select
             placeholder="Trạng thái"
             value={filterStatus || undefined}
             onChange={value => setFilterStatus(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="PENDING">Chờ xử lý</Select.Option>
             <Select.Option value="DONE">Đã hoàn thành</Select.Option>
             <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
             <Select.Option value="RESOLVED">Đã giải quyết</Select.Option>
             <Select.Option value="DENIED">Đã từ chối</Select.Option>
             <Select.Option value="EXPIRED">Hết hạn</Select.Option>
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
       {(searchText || filterStatus || filterUnderWarranty) && (
         <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
           <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
           {searchText && (
             <span className="badge bg-primary-transparent">
               <i className="ti ti-search me-1"></i>
               Tìm kiếm: "{searchText}"
             </span>
           )}
           {filterStatus && (
             <span className="badge bg-warning-transparent">
               <i className="ti ti-filter me-1"></i>
               Trạng thái: {getStatusDisplayText(filterStatus)}
             </span>
           )}
           {filterUnderWarranty && (
             <span className="badge bg-info-transparent">
               <i className="ti ti-shield me-1"></i>
               Tình trạng bảo hành: {filterUnderWarranty === 'Yes' ? 'Có bảo hành' : 'Không bảo hành'}
             </span>
           )}
           <button 
             className="btn btn-sm btn-outline-secondary"
             onClick={() => {
               setSearchText('');
               setFilterStatus(undefined);
               setFilterUnderWarranty(undefined);
             }}
           >
             <i className="ti ti-x me-1"></i>
             Xóa tất cả
           </button>
         </div>
       )}

       <div className="custom-datatable-filter table-responsive">
         {/* Bảng warranties */}
         {loading || !warranties || warranties.length === 0 ? (
           <Spin />
         ) : (
           <table className="table datatable">
             <thead className="thead-light">
               <tr>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByBooking}>
                   Mã đơn hàng
                   {sortField === 'bookingId' && (
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
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByTechnician}>
                   Kỹ thuật viên
                   {sortField === 'technician' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>Trạng thái</th>
                 <th>Bảo hành</th>
                 <th>Hành động</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                 <tr>
                   <td colSpan={7} className="text-center">
                     <div className="spinner-border text-primary" role="status">
                       <span className="visually-hidden">Loading...</span>
                     </div>
                   </td>
                 </tr>
               ) : filtered.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="text-center text-muted py-4">
                     <div>
                       <i className="ti ti-shield" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                       <p className="mb-0">Không có bảo hành nào</p>
                     </div>
                   </td>
                 </tr>
               ) : currentWarranties.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="text-center text-muted py-4">
                     <div>
                       <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                       <p className="mb-0">Không tìm thấy bảo hành nào phù hợp</p>
                     </div>
                   </td>
                 </tr>
               ) : (
                 currentWarranties.map(w => (
                   <tr key={w.id}>
                     <td>{bookingMap[w.bookingId] || ''}</td>
                     <td>{userNames[w.customerId]|| ''}</td>
                     <td>{technicianNames[w.technicianId]|| ''}</td>
                     <td style={{ padding: '12px 8px' }}>
                       {w.status ? (
                         <Tag color={getStatusColor(w.status)} style={{ fontSize: 12, fontWeight: 600 }}>
                           {getStatusDisplayText(w.status)}
                         </Tag>
                       ) : (
                         <Tag color="default" style={{ fontSize: 12, fontWeight: 600 }}>
                           N/A
                         </Tag>
                       )}
                     </td>
                    
                     <td style={{ padding: '12px 8px' }}>
                       {w.isUnderWarranty ? (
                         <span className="badge bg-success-transparent text-dark">
                           Có bảo hành
                         </span>
                       ) : (
                         <span className="badge bg-danger-transparent text-dark">
                           Không bảo hành
                         </span>
                       )}
                     </td>
                     <td>
                       {/* <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => openEdit(w)} style={{ marginRight: 8 }}>
                          Chỉnh sửa
                        </Button> */}
                       <Button className="management-action-btn" size="middle" onClick={() => { setSelectedWarranty(w); setShowDetailModal(true); }}>
                         <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
                       </Button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         )}
       </div>

       {/* Pagination Info and Controls */}
       <div className="d-flex justify-content-between align-items-center mt-3">
         <div className="d-flex align-items-center gap-3">
           <div className="text-muted">
             Hiển thị {indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)} trong tổng số {filtered.length} bảo hành
           </div>
         </div>
         {totalPages > 1 && (
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
                   <Modal
          open={showModal}
          onCancel={() => {
            setShowModal(false);
            setEditResolutionNote('');
            setEditRejectionReason('');
          }}
          onOk={handleUpdate}
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '6px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 16,
                fontWeight: 600
              }}>
                <EditOutlined />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>
                  Chỉnh sửa trạng thái bảo hành
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  Cập nhật trạng thái và thông tin xử lý
                </div>
              </div>
            </div>
          }
          okText={loading ? "Đang xử lý..." : "Lưu thay đổi"}
          cancelText="Hủy bỏ"
          width={800}
        okButtonProps={{
          disabled: !editStatus || 
            (editStatus === 'CONFIRMED' && !editResolutionNote.trim()) ||
            (editStatus === 'RESOLVED' && !editResolutionNote.trim()) ||
            (editStatus === 'DENIED' && !editRejectionReason.trim()),
          loading: loading,
          style: {
            height: 36,
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
            border: 'none',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
          }
        }}
        cancelButtonProps={{
          style: {
            height: 36,
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            border: '2px solid #d9d9d9',
            color: '#595959'
          }
        }}
        styles={{
          body: { 
            padding: '20px 16px',
            background: '#fafafa'
          },
          header: {
            padding: '16px 16px 12px 16px',
            borderBottom: 'none'
          },
          footer: {
            padding: '12px 16px 16px 16px',
            borderTop: '1px solid #f0f0f0',
            background: '#ffffff'
          }
        }} 
      >
        {/* Status Selection Section */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* Status Selection Card */}
          <Col span={12}>
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ marginBottom: 16, flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 8
                }}>
                  Trạng thái bảo hành <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                </label>
                <Select
                  value={editStatus}
                  onChange={setEditStatus}
                  placeholder="Chọn trạng thái mới"
                  size="middle"
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <Select.Option value="PENDING">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#faad14'
                      }} />
                      <span>Chờ xử lý - Đang chờ xử lý</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="DONE">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#52c41a'
                      }} />
                      <span>Đã hoàn thành - Đã hoàn thành</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="CONFIRMED">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#1890ff'
                      }} />
                      <span>Đã xác nhận - Đã xác nhận</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="RESOLVED">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#52c41a'
                      }} />
                      <span>Đã giải quyết - Đã giải quyết</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="DENIED">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#ff4d4f'
                      }} />
                      <span>Đã từ chối - Đã từ chối</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="EXPIRED">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#fa8c16'
                      }} />
                      <span>Hết hạn - Hết hạn</span>
                    </div>
                  </Select.Option>
                </Select>
              </div>
            </div>
          </Col>

          {/* Info Card */}
          <Col span={12}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              padding: 16,
              height: '100%',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ marginBottom: 16, flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 8
                }}>
                  <i className="ti ti-info-circle" style={{ marginRight: 6, color: '#1890ff', fontSize: 14 }} />
                  Thông tin bổ sung
                </label>
                <div style={{ 
                  fontSize: 13, 
                  color: '#666', 
                  lineHeight: 1.6,
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  {editStatus === 'CONFIRMED' && 'Vui lòng điền phương án giải quyết để hoàn tất quy trình bảo hành'}
                  {editStatus === 'RESOLVED' && 'Vui lòng điền phương án giải quyết để hoàn tất quy trình bảo hành'}
                  {editStatus === 'DENIED' && 'Vui lòng điền lý do từ chối để khách hàng hiểu rõ nguyên nhân'}
                  {editStatus && !['CONFIRMED', 'RESOLVED', 'DENIED'].includes(editStatus) && 'Thông tin bổ sung sẽ giúp quy trình bảo hành rõ ràng hơn'}
                </div>
              </div>
            </div>
          </Col>
        </Row>

          {/* Resolution Section - Chỉ hiển thị khi status là CONFIRMED hoặc RESOLVED */}
          {(editStatus === 'CONFIRMED' || editStatus === 'RESOLVED') && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
              }} />
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 8
                }}>
                  <i className="ti ti-file-text" style={{ marginRight: 6, color: '#1890ff', fontSize: 14 }} />
                  Phương án giải quyết
                  <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                </label>
                <div style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px'
                }}>
                  <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Select
                      placeholder="Font Family"
                      style={{ width: 120 }}
                      onChange={(value) => {
                        const textarea = document.getElementById('resolution-textarea');
                        if (textarea) {
                          textarea.style.fontFamily = value;
                        }
                      }}
                      defaultValue="Arial"
                    >
                      <Select.Option value="Arial">Arial</Select.Option>
                      <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                      <Select.Option value="Courier New">Courier New</Select.Option>
                      <Select.Option value="Georgia">Georgia</Select.Option>
                      <Select.Option value="Verdana">Verdana</Select.Option>
                    </Select>
                    <Select
                      placeholder="Font Size"
                      style={{ width: 80 }}
                      onChange={(value) => {
                        const textarea = document.getElementById('resolution-textarea');
                        if (textarea) {
                          textarea.style.fontSize = `${value}px`;
                        }
                      }}
                      defaultValue="14"
                    >
                      <Select.Option value="12">12px</Select.Option>
                      <Select.Option value="14">14px</Select.Option>
                      <Select.Option value="16">16px</Select.Option>
                      <Select.Option value="18">18px</Select.Option>
                      <Select.Option value="20">20px</Select.Option>
                    </Select>
                    <Space.Compact size="small">
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('resolution-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'left';
                          }
                        }}
                      >
                        <i className="ti ti-align-left"></i>
                      </Button>
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('resolution-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'center';
                          }
                        }}
                      >
                        <i className="ti ti-align-center"></i>
                      </Button>
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('resolution-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'right';
                          }
                        }}
                      >
                        <i className="ti ti-align-right"></i>
                      </Button>
                    </Space.Compact>
                    <Button 
                      size="small"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const textarea = document.getElementById('resolution-textarea');
                              if (textarea) {
                                // Tạo img tag với base64 data
                                const imgTag = `\n<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />\n`;
                                const cursorPos = textarea.selectionStart;
                                const textBefore = textarea.value.substring(0, cursorPos);
                                const textAfter = textarea.value.substring(cursorPos);
                                const newValue = textBefore + imgTag + textAfter;
                                
                                // Cập nhật state
                                setEditResolutionNote(newValue);
                                
                                // Cập nhật textarea value
                                textarea.value = newValue;
                                
                                // Đặt con trỏ sau tag ảnh
                                const newCursorPos = cursorPos + imgTag.length;
                                textarea.focus();
                                textarea.setSelectionRange(newCursorPos, newCursorPos);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      icon={<i className="ti ti-photo"></i>}
                    >
                      Thêm ảnh
                    </Button>
                  </div>
                  <Input.TextArea
                    id="resolution-textarea"
                    value={editResolutionNote}
                    onChange={(e) => setEditResolutionNote(e.target.value)}
                    rows={4}
                    placeholder="Nhập phương án giải quyết..."
                    style={{
                      fontFamily: 'Arial',
                      fontSize: '14px',
                      textAlign: 'left',
                      border: 'none',
                      resize: 'none'
                    }}
                  />
                </div>
                {!editResolutionNote.trim() && (
                  <div style={{ 
                    color: '#ff4d4f', 
                    fontSize: 12, 
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 8px',
                    background: '#fff2f0',
                    borderRadius: 4,
                    border: '1px solid #ffccc7'
                  }}>
                    <i className="ti ti-exclamation-circle" style={{ fontSize: 12 }} />
                    Hãy nhập phương án giải quyết
                  </div>
                )}
                {editResolutionNote.trim() && (
                  <div style={{ 
                    color: '#52c41a', 
                    fontSize: 12, 
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 8px',
                    background: '#f6ffed',
                    borderRadius: 4,
                    border: '1px solid #b7eb8f'
                  }}>
                    <i className="ti ti-check-circle" style={{ fontSize: 12 }} />
                    Phương án giải quyết đã được nhập
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Section - Chỉ hiển thị khi status là DENIED */}
          {editStatus === 'DENIED' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
              }} />
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 8
                }}>
                  <i className="ti ti-file-text" style={{ marginRight: 6, color: '#1890ff', fontSize: 14 }} />
                  Lý do từ chối
                  <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                </label>
                <div style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '8px'
                }}>
                  <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Select
                      placeholder="Font Family"
                      style={{ width: 120 }}
                      onChange={(value) => {
                        const textarea = document.getElementById('rejection-textarea');
                        if (textarea) {
                          textarea.style.fontFamily = value;
                        }
                      }}
                      defaultValue="Arial"
                    >
                      <Select.Option value="Arial">Arial</Select.Option>
                      <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                      <Select.Option value="Courier New">Courier New</Select.Option>
                      <Select.Option value="Georgia">Georgia</Select.Option>
                      <Select.Option value="Verdana">Verdana</Select.Option>
                    </Select>
                    <Select
                      placeholder="Font Size"
                      style={{ width: 80 }}
                      onChange={(value) => {
                        const textarea = document.getElementById('rejection-textarea');
                        if (textarea) {
                          textarea.style.fontSize = `${value}px`;
                        }
                      }}
                      defaultValue="14"
                    >
                      <Select.Option value="12">12px</Select.Option>
                      <Select.Option value="14">14px</Select.Option>
                      <Select.Option value="16">16px</Select.Option>
                      <Select.Option value="18">18px</Select.Option>
                      <Select.Option value="20">20px</Select.Option>
                    </Select>
                    <Space.Compact size="small">
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('rejection-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'left';
                          }
                        }}
                      >
                        <i className="ti ti-align-left"></i>
                      </Button>
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('rejection-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'center';
                          }
                        }}
                      >
                        <i className="ti ti-align-center"></i>
                      </Button>
                      <Button 
                        type="default"
                        onClick={() => {
                          const textarea = document.getElementById('rejection-textarea');
                          if (textarea) {
                            textarea.style.textAlign = 'right';
                          }
                        }}
                      >
                        <i className="ti ti-align-right"></i>
                      </Button>
                    </Space.Compact>
                    <Button 
                      size="small"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const textarea = document.getElementById('rejection-textarea');
                              if (textarea) {
                                // Tạo img tag với base64 data
                                const imgTag = `\n<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />\n`;
                                const cursorPos = textarea.selectionStart;
                                const textBefore = textarea.value.substring(0, cursorPos);
                                const textAfter = textarea.value.substring(cursorPos);
                                const newValue = textBefore + imgTag + textAfter;
                                
                                // Cập nhật state
                                setEditRejectionReason(newValue);
                                
                                // Cập nhật textarea value
                                textarea.value = newValue;
                                
                                // Đặt con trỏ sau tag ảnh
                                const newCursorPos = cursorPos + imgTag.length;
                                textarea.focus();
                                textarea.setSelectionRange(newCursorPos, newCursorPos);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      icon={<i className="ti ti-photo"></i>}
                    >
                      Thêm ảnh
                    </Button>
                  </div>
                  <Input.TextArea
                    id="rejection-textarea"
                    value={editRejectionReason}
                    onChange={(e) => setEditRejectionReason(e.target.value)}
                    rows={4}
                    placeholder="Nhập lý do từ chối..."
                    style={{
                      fontFamily: 'Arial',
                      fontSize: '14px',
                      textAlign: 'left',
                      border: 'none',
                      resize: 'none'
                    }}
                  />
                </div>
                {!editRejectionReason.trim() && (
                  <div style={{ 
                    color: '#ff4d4f', 
                    fontSize: 12, 
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 8px',
                    background: '#fff2f0',
                    borderRadius: 4,
                    border: '1px solid #ffccc7'
                  }}>
                    <i className="ti ti-exclamation-circle" style={{ fontSize: 12 }} />
                    Hãy nhập lý do từ chối
                  </div>
                )}
                {editRejectionReason.trim() && (
                  <div style={{ 
                    color: '#52c41a', 
                    fontSize: 12, 
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 8px',
                    background: '#f6ffed',
                    borderRadius: 4,
                    border: '1px solid #b7eb8f'
                  }}>
                    <i className="ti ti-check-circle" style={{ fontSize: 12 }} />
                    Lý do từ chối đã được nhập
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <Row gutter={24} style={{ marginBottom: 24 }}>
            {/* Summary Card */}
            <Col span={12}>
              {(editStatus === 'CONFIRMED' || editStatus === 'RESOLVED' || editStatus === 'DENIED') && (
                <div style={{
                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                  border: '1px solid #b7eb8f',
                  borderRadius: 12,
                  padding: 16,
                  height: '100%',
                  animation: 'slideInUp 0.3s ease-out'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 12,
                    color: '#52c41a',
                    fontWeight: 600
                  }}>
                    <i className="ti ti-check-circle" />
                    Tóm tắt thay đổi
                  </div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                    Bảo hành sẽ được chuyển sang trạng thái <strong>{getStatusDisplayText(editStatus)}</strong>.
                    {(editStatus === 'CONFIRMED' || editStatus === 'RESOLVED') && editResolutionNote.trim() && ' Phương án giải quyết đã được thêm vào hệ thống.'}
                    {editStatus === 'DENIED' && editRejectionReason.trim() && ' Lý do từ chối đã được thêm vào hệ thống.'}
                  </div>
                </div>
              )}
            </Col>

            {/* Progress Card */}
            <Col span={12}>
              <div style={{
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)',
                border: '1px solid #bae7ff',
                borderRadius: 12,
                padding: 16,
                height: '100%'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 12,
                  color: '#1890ff',
                  fontWeight: 600
                }}>
                  <i className="ti ti-info-circle" />
                  Tiến độ xử lý
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  {editStatus === 'PENDING' && 'Bảo hành đang chờ xử lý'}
                  {editStatus === 'DONE' && 'Bảo hành đã hoàn thành'}
                  {editStatus === 'CONFIRMED' && 'Bảo hành đã được xác nhận'}
                  {editStatus === 'RESOLVED' && 'Bảo hành đã được giải quyết'}
                  {editStatus === 'DENIED' && 'Bảo hành đã bị từ chối'}
                  {editStatus === 'EXPIRED' && 'Bảo hành đã hết hạn'}
                </div>
              </div>
            </Col>
          </Row>
        </Modal>
     {/* View Detail Modal */}
     {showDetailModal && selectedWarranty && (
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
             background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
             padding: '20px 24px',
             color: 'black'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700 }}>
                 Chi tiết bảo hành
               </div>
             </div>
             {selectedWarranty.id && (
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontFamily: 'monospace', fontSize: 15 }}>ID: {selectedWarranty.id}</span>
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
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Tổng quán</div>
                   <div style={{ display: 'grid', rowGap: 10 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Trạng thái</span>
                       <span style={{ fontWeight: 600, color: 'black' }}>{getStatusDisplayText(selectedWarranty.status)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Tình trạng bảo hành</span>
                       <span style={{ fontWeight: 600, color: selectedWarranty.isUnderWarranty ? '#52c41a' : '#ff4d4f' }}>
                         {getWarrantyStatusText(selectedWarranty.isUnderWarranty)}
                       </span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Admin duyệt</span>
                       <span style={{ fontWeight: 600, color: selectedWarranty.isReviewedByAdmin ? '#52c41a' : '#faad14' }}>
                         {getAdminReviewText(selectedWarranty.isReviewedByAdmin)}
                       </span>
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Hạn bảo hành</span>
                       <span style={{ fontWeight: 600 }}>{selectedWarranty.expireAt ? new Date(selectedWarranty.expireAt).toLocaleDateString() : 'N/A'}</span>
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
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thông tin liên quan</div>
                   <div style={{ display: 'grid', rowGap: 12 }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Khách hàng</span>
                       <span style={{ fontWeight: 600 }}>{userNames[selectedWarranty.customerId] || selectedWarranty.customerId || ''}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Kỹ thuật viên</span>
                       <span style={{ fontWeight: 600 }}>{technicianNames[selectedWarranty.technicianId] || selectedWarranty.technicianId || ''}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Mã đơn hàng</span>
                       <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{bookingMap[selectedWarranty.bookingId] || 'N/A'}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Ngày yêu cầu</span>
                       <span style={{ fontWeight: 600 }}>{new Date(selectedWarranty.requestDate).toLocaleString()}</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Issue Details full width */}
               <div style={{ gridColumn: '1 / span 2' }}>
                 <div style={{
                   background: '#ffffff',
                   border: '1px solid #f0f0f0',
                   borderRadius: 12,
                   padding: 16,
                   marginBottom: 16,
                 }}>
                   <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Chi tiết vấn đề</div>
                   <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                     <div style={{ marginBottom: 12 }}>
                       <div style={{ fontWeight: 600, marginBottom: 4 }}>Vấn đề báo cáo:</div>
                       <div style={{ color: '#262626' }}>{selectedWarranty.reportedIssue}</div>
                     </div>
                     {selectedWarranty.resolutionNote && (
                       <div style={{ marginBottom: 12 }}>
                         <div style={{ fontWeight: 600, marginBottom: 4 }}>Phương án giải quyết:</div>
                         <div style={{ color: '#262626' }}>{selectedWarranty.resolutionNote}</div>
                       </div>
                     )}
                     {selectedWarranty.rejectionReason && (
                       <div>
                         <div style={{ fontWeight: 600, marginBottom: 4 }}>Lý do từ chối:</div>
                         <div style={{ color: '#ff4d4f' }}>{selectedWarranty.rejectionReason}</div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* Images if available */}
               {selectedWarranty.images && selectedWarranty.images.length > 0 && (
                 <div style={{ gridColumn: '1 / span 2' }}>
                   <div style={{
                     background: '#ffffff',
                     border: '1px solid #f0f0f0',
                     borderRadius: 16,
                     padding: 16,
                   }}>
                     <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Hình ảnh liên quan</div>
                     <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                       {selectedWarranty.images.map((img, idx) => (
                         <img 
                           key={idx} 
                           src={img} 
                           alt={`Warranty image ${idx + 1}`} 
                           style={{
                             maxWidth: 120, 
                             maxHeight: 120, 
                             borderRadius: 8, 
                             boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                             objectFit: 'cover',
                             cursor: 'pointer'
                           }} 
                         />
                       ))}
                     </div>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       </Modal>
     )}
   </div>
 );
};


export default WarrantyManagement;

