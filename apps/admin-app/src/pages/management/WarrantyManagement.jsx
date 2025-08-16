import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllWarranties, updateWarrantyStatus, updateWarrantyDetails } from '../../features/warranty/warrantySlice';
import { Modal, Button, Select, Switch, message, Descriptions, Spin, Form, Input, Row, Col, Tag } from 'antd';
import { userAPI } from "../../features/users/userAPI";
import { technicianAPI } from "../../features/technicians/techniciansAPI";
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";
import { createExportData, formatDateTime } from '../../utils/exportUtils';


const statusOptions = [
 { value: 'PENDING', label: 'PENDING' },
 { value: 'DONE', label: 'DONE' },
 { value: 'CONFIRMED', label: 'CONFIRMED' },
 { value: 'RESOLVED', label: 'RESOLVED' },
 { value: 'DENIED', label: 'DENIED' },
 { value: 'EXPIRED', label: 'EXPIRED' },
];
const WarrantyManagement = () => {
  const dispatch = useDispatch();
  const { list: warranties, loading, error } = useSelector(state => state.warranty);
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
    { title: 'Mã đơn hàng', dataIndex: 'bookingCode' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Kỹ thuật viên', dataIndex: 'technicianName' },
    { title: 'Dịch vụ', dataIndex: 'serviceName' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Tình trạng bảo hành', dataIndex: 'underWarranty' },
    { title: 'Thời gian tạo', dataIndex: 'createdAt' }
  ];

  const exportData = sorted.map(warranty => ({
    warrantyCode: warranty.warrantyCode,
    bookingCode: warranty.bookingId,
    customerName: userNames[warranty.customerId] || warranty.customerId,
    technicianName: technicianNames[warranty.technicianId] || warranty.technicianId,
    serviceName: serviceNames[warranty.serviceId] || warranty.serviceId,
    warrantyPeriod: warranty.warrantyPeriod,
    startDate: formatDateTime(warranty.startDate),
    endDate: formatDateTime(warranty.endDate),
    status: warranty.status?.toUpperCase(),
    underWarranty: warranty.isUnderWarranty ? 'Yes' : 'No',
    reviewed: warranty.isReviewedByAdmin ? 'Yes' : 'No',
    createdAt: formatDateTime(warranty.createdAt),
    updatedAt: formatDateTime(warranty.updatedAt),
  }));

  createExportData(exportData, exportColumns, 'warranties_export', 'Warranties');
}, [sorted, userNames, technicianNames, serviceNames]);

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
                 placeholder="Tìm kiếm bảo hành..."
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
             <Select.Option value="Yes">Yes</Select.Option>
             <Select.Option value="No">No</Select.Option>
           </Select>
           <Select
             placeholder="Trạng thái"
             value={filterStatus || undefined}
             onChange={value => setFilterStatus(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="PENDING">PENDING</Select.Option>
             <Select.Option value="DONE">DONE</Select.Option>
             <Select.Option value="CONFIRMED">CONFIRMED</Select.Option>
             <Select.Option value="RESOLVED">RESOLVED</Select.Option>
             <Select.Option value="DENIED">DENIED</Select.Option>
             <Select.Option value="EXPIRED">EXPIRED</Select.Option>
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
               Trạng thái: {filterStatus}
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
                 <th>Tình trạng bảo hành</th>
                 <th>Duyệt</th>
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
                     <td>{w.status}</td>
                    
                     <td>{w.isUnderWarranty ? 'Yes' : 'No'}</td>
                     <td>{w.isReviewedByAdmin ? 'Yes' : 'No'}</td>
                     <td>
                       <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => openEdit(w)} style={{ marginRight: 8 }}>
                          Chỉnh sửa
                        </Button>
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
         {filtered.length > 0 && (
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
     <Modal
       open={showModal}
       onCancel={() => {
         setShowModal(false);
         setEditResolutionNote('');
         setEditRejectionReason('');
       }}
       onOk={handleUpdate}
       title="Cập nhật bảo hành"
       okText="Lưu"
       confirmLoading={loading}
       width={600}
     >
       <Form layout="vertical">
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Trạng thái" required>
               <Select
                 value={editStatus}
                 onChange={setEditStatus}
                 options={statusOptions}
                 style={{ width: '100%' }}
               />
             </Form.Item>
           </Col>
         </Row>
         
         <Form.Item label="Phương án giải quyết">
           <Input.TextArea
             value={editResolutionNote}
             onChange={(e) => setEditResolutionNote(e.target.value)}
             placeholder="Nhập ghi chú giải quyết (nếu có)"
             rows={3}
           />
         </Form.Item>
         
         <Form.Item label="Lý do từ chối">
           <Input.TextArea
             value={editRejectionReason}
             onChange={(e) => setEditRejectionReason(e.target.value)}
             placeholder="Nhập lý do từ chối (nếu có)"
             rows={3}
           />
         </Form.Item>
       </Form>
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
             background: 'linear-gradient(135deg, #1890ff 0%, #73d13d 100%)',
             padding: '20px 24px',
             color: '#fff'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700 }}>
                 Chi tiết bảo hành
               </div>
               <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                 {selectedWarranty.status}
               </Tag>
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
                       <span style={{ fontWeight: 600, color: '#52c41a' }}>{selectedWarranty.status}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Tình trạng bảo hành</span>
                       <span style={{ fontWeight: 600, color: selectedWarranty.isUnderWarranty ? '#52c41a' : '#ff4d4f' }}>
                         {selectedWarranty.isUnderWarranty ? 'Yes' : 'No'}
                       </span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ color: '#8c8c8c' }}>Admin duyệt</span>
                       <span style={{ fontWeight: 600, color: selectedWarranty.isReviewedByAdmin ? '#52c41a' : '#faad14' }}>
                         {selectedWarranty.isReviewedByAdmin ? 'Yes' : 'No'}
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

