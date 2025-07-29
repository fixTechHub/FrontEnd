import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllWarranties, updateWarrantyStatus } from '../../features/warranty/warrantySlice';
import { Modal, Button, Select, Switch, message, Descriptions, Spin } from 'antd';
import { userAPI } from "../../features/users/userAPI";
import { technicianAPI } from "../../features/technicians/techniciansAPI";
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";


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
  const [editReviewed, setEditReviewed] = useState(false);
  const [userNames, setUserNames] = useState({});
  const [technicianNames, setTechnicianNames] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const warrantiesPerPage = 10;
  const [bookingMap, setBookingMap] = useState({});
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState();
  const [filterUnderWarranty, setFilterUnderWarranty] = useState();
  const [filterReviewed, setFilterReviewed] = useState();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);


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
         map[b.id] = b.bookingCode || '';
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
     (bookingId.includes(search) || customer.includes(search) || technician.includes(search)) &&
     (!filterStatus || w.status === filterStatus) &&
     (!filterUnderWarranty || (filterUnderWarranty === 'Yes' ? w.isUnderWarranty : !w.isUnderWarranty)) &&
     (!filterReviewed || (filterReviewed === 'Yes' ? w.isReviewedByAdmin : !w.isReviewedByAdmin))
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
         <div className="d-flex align-items-center gap-2">
           <div className="top-search">
             <div className="top-search-group">
               <span className="input-icon">
                 <i className="ti ti-search"></i>
               </span>
               <input
                 type="text"
                 className="form-control"
                 placeholder="Search booking, customer, technician"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>           
           <Select
             placeholder="Under Warranty"
             value={filterUnderWarranty || undefined}
             onChange={value => setFilterUnderWarranty(value)}
             style={{ width: 150 }}
             allowClear
           >
             <Select.Option value="Yes">Yes</Select.Option>
             <Select.Option value="No">No</Select.Option>
           </Select>
           <Select
             placeholder="Reviewed"
             value={filterReviewed || undefined}
             onChange={value => setFilterReviewed(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="Yes">Yes</Select.Option>
             <Select.Option value="No">No</Select.Option>
           </Select>
           <Select
             placeholder="Status"
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
         {/* Bảng warranties */}
         {loading || !warranties || warranties.length === 0 ? (
           <Spin />
         ) : (
           <table className="table datatable">
             <thead className="thead-light">
               <tr>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByBooking}>
                   BOOKING CODE
                   {sortField === 'bookingId' && (
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
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByTechnician}>
                   TECHNICIAN
                   {sortField === 'technician' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>STATUS</th>
                 <th>UNDER WARRANTY</th>
                 <th>REVIEWED</th>
                 <th>ACTION</th>
               </tr>
             </thead>
             <tbody>
               {currentWarranties.map(w => (
                 <tr key={w.id}>
                   <td>{bookingMap[w.bookingId] || ''}</td>
                   <td>{userNames[w.customerId]|| 'UNKNOWN'}</td>
                   <td>{technicianNames[w.technicianId]|| 'UNKNOWN'}</td>
                   <td>{w.status}</td>
                   <td>{w.isUnderWarranty ? 'Yes' : 'No'}</td>
                   <td>{w.isReviewedByAdmin ? 'Yes' : 'No'}</td>
                   <td>
                     <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => openEdit(w)} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                     <Button className="management-action-btn" size="middle" onClick={() => { setSelectedWarranty(w); setShowDetailModal(true); }}>
                       <EyeOutlined style={{marginRight: 4}} />View Detail
                     </Button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
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
       title="Update warranty"
       okText="Update"
       confirmLoading={loading}
     >
       <div style={{ marginBottom: 16 }}>
         <b>Status:</b>
         <Select
           value={editStatus}
           onChange={setEditStatus}
           options={statusOptions}
           style={{ width: '100%' }}
         />
       </div>
       <div>
         <b>Admin reviewed: </b>
         <Switch checked={editReviewed} onChange={setEditReviewed} />
       </div>
     </Modal>
     {/* View Detail Modal */}
     {showDetailModal && selectedWarranty && (
       <Modal
         open={showDetailModal}
         onCancel={() => setShowDetailModal(false)}
         footer={null}
         title={null}
         width={600}
       >
         <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32}}>
           <div style={{fontSize: 22, fontWeight: 600, marginBottom: 16}}>Warranty Detail</div>
           <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Booking Code</div>
               <div>{bookingMap[selectedWarranty.bookingId] || "-"}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Customer</div>
               <div>{userNames[selectedWarranty.customerId] || selectedWarranty.customerId || 'UNKNOWN'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Technician</div>
               <div>{technicianNames[selectedWarranty.technicianId] || selectedWarranty.technicianId || 'UNKNOWN'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Status</div>
               <div>{selectedWarranty.status}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Reported Issue</div>
               <div>{selectedWarranty.reportedIssue}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Resolution Note</div>
               <div>{selectedWarranty.resolutionNote || 'Chưa có'}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Rejection Reason</div>
               <div>{selectedWarranty.rejectionReason || 'Chưa có'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Expire At</div>
               <div>{selectedWarranty.expireAt ? new Date(selectedWarranty.expireAt).toLocaleDateString() : 'Chưa có'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Request Date</div>
               <div>{new Date(selectedWarranty.requestDate).toLocaleString()}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Is Under Warranty</div>
               <div>{selectedWarranty.isUnderWarranty ? 'Yes' : 'No'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Is Reviewed By Admin</div>
               <div>{selectedWarranty.isReviewedByAdmin ? 'Yes' : 'No'}</div>
             </div>
             {/* Nếu có trường images hoặc ảnh liên quan trong Warranty Detail, hiển thị như gallery đẹp: */}
             {selectedWarranty.images && selectedWarranty.images.length > 0 && (
               <div style={{gridColumn: '1 / span 2'}}>
                 <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Images</div>
                 <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', minHeight: 60}}>
                   {selectedWarranty.images.map((img, idx) => (
                     <img key={idx} src={img} alt="img" style={{maxWidth: 120, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover'}} />
                   ))}
                 </div>
               </div>
             )}
           </div>
         </div>
       </Modal>
     )}
   </div>
 );
};


export default WarrantyManagement;

