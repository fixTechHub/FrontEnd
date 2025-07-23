import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Select, Descriptions, Spin } from 'antd';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import {
 setTechnicians,
 setLoading,
 setError,
 setFilters,
 updateTechnician,
} from '../../features/technicians/technicianSlice';
import {
 selectFilteredTechnicians,
 selectTechnicianFilters,
 selectTechnicianLoading,
 selectTechnicianError,
} from '../../features/technicians/technicianSelectors';
import { categoryAPI } from "../../features/categories/categoryAPI";
import { EyeOutlined } from '@ant-design/icons';
import './ManagementTableStyle.css';


const TechnicianManagement = () => {
 const dispatch = useDispatch();
 const technicians = useSelector(selectFilteredTechnicians);
 const filters = useSelector(selectTechnicianFilters);
 const loading = useSelector(selectTechnicianLoading);
 const error = useSelector(selectTechnicianError);


 const [searchText, setSearchText] = useState(filters.search || '');
 const [showDetailModal, setShowDetailModal] = useState(false);
 const [selectedTechnician, setSelectedTechnician] = useState(null);
 const [statusData, setStatusData] = useState({ status: '', note: '' });
 const [showEditStatusModal, setShowEditStatusModal] = useState(false);
 const [categories, setCategories] = useState([]);
 const [categoryMap, setCategoryMap] = useState({});
 const [currentPage, setCurrentPage] = useState(1);
 const techniciansPerPage = 10;
 const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');
const [filterAvailability, setFilterAvailability] = useState('');



 const filteredTechnicians = filterAvailability
  ? technicians.filter(tech => tech.availability === filterAvailability)
  : technicians;

 const indexOfLastTechnician = currentPage * techniciansPerPage;
 const indexOfFirstTechnician = indexOfLastTechnician - techniciansPerPage;
 const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
  if (sortField === 'fullName') {
    if (!a.fullName) return 1;
    if (!b.fullName) return -1;
    if (sortOrder === 'asc') {
      return a.fullName.localeCompare(b.fullName);
    } else {
      return b.fullName.localeCompare(a.fullName);
    }
  } else if (sortField === 'email') {
    if (!a.email) return 1;
    if (!b.email) return -1;
    if (sortOrder === 'asc') {
      return a.email.localeCompare(b.email);
    } else {
      return b.email.localeCompare(a.email);
    }
  } else if (sortField === 'phone') {
    if (!a.phone) return 1;
    if (!b.phone) return -1;
    if (sortOrder === 'asc') {
      return a.phone.localeCompare(b.phone);
    } else {
      return b.phone.localeCompare(a.phone);
    }
  } else if (sortField === 'rating') {
    const aRating = Number(a.ratingAverage) || 0;
    const bRating = Number(b.ratingAverage) || 0;
    if (sortOrder === 'asc') {
      return aRating - bRating;
    } else {
      return bRating - aRating;
    }
  } else if (sortField === 'jobs') {
    const aJobs = Number(a.jobCompleted) || 0;
    const bJobs = Number(b.jobCompleted) || 0;
    if (sortOrder === 'asc') {
      return aJobs - bJobs;
    } else {
      return bJobs - aJobs;
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
const currentTechnicians = sortedTechnicians.slice(indexOfFirstTechnician, indexOfLastTechnician);


 const totalPages = Math.ceil(technicians.length / techniciansPerPage);


 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 const fetchTechnicians = async () => {
   try {
     dispatch(setLoading(true));
     const data = await technicianAPI.getAll();
     dispatch(setTechnicians(data || []));
   } catch (err) {
     dispatch(setError(err.message || 'Failed to load technicians.'));
     message.error('Failed to load technicians.');
   } finally {
     dispatch(setLoading(false));
   }
 };


 useEffect(() => {
   fetchTechnicians();
 }, [dispatch]);


 useEffect(() => {
   dispatch(setFilters({ search: searchText }));
 }, [searchText, dispatch]);


 useEffect(() => {
   categoryAPI.getAll().then(data => {
     setCategories(data || []);
     const map = {};
     (data || []).forEach(cat => {
       const key = cat._id?.$oid || cat._id || cat.id;
       map[key] = cat.categoryName || cat.name;
     });
     setCategoryMap(map);
     console.log("Categories:", data);
   });
 }, []);


 const handleOpenDetail = (technician) => {
   setSelectedTechnician(technician);
   setShowDetailModal(true);
 };


 const handleCloseDetail = () => {
   setShowDetailModal(false);
   setSelectedTechnician(null);
 };


 const handleOpenEditStatus = (technician) => {
   console.log('Technician được chọn để edit:', technician);
   setSelectedTechnician(technician);
   setStatusData({ status: technician.status || 'PENDING', note: technician.note || '' });
   setShowEditStatusModal(true);
 };


 const handleCloseEditStatus = () => {
   setShowEditStatusModal(false);
   setSelectedTechnician(null);
 };


 const handleStatusChange = (e) => {
   const { name, value } = e.target;
   setStatusData((prev) => ({ ...prev, [name]: value }));
 };


 const handleUpdateStatus = async (e) => {
   e.preventDefault();
   if (!selectedTechnician) return;
   try {
     dispatch(setLoading(true));
     console.log('--- Bắt đầu update status ---');
     await technicianAPI.updateStatus(selectedTechnician.id, statusData.status, statusData.note);
     console.log('--- Update status thành công, fetch lại list ---');
     await fetchTechnicians();
     console.log('--- Fetch xong, show message và đóng modal ---');
     message.success('Technician status updated successfully!');
     handleCloseEditStatus();
   } catch (err) {
     console.error('Update status error:', err);
     dispatch(setError(err.message || 'Failed to update status.'));
     message.error('Failed to update status: ' + (err.message || 'Unknown error'));
   } finally {
     dispatch(setLoading(false));
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

const handleSortByName = () => {
  if (sortField === 'fullName') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('fullName');
    setSortOrder('asc');
  }
};

const handleSortByEmail = () => {
  if (sortField === 'email') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('email');
    setSortOrder('asc');
  }
};
const handleSortByPhone = () => {
  if (sortField === 'phone') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('phone');
    setSortOrder('asc');
  }
};

const handleSortByRating = () => {
  if (sortField === 'rating') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('rating');
    setSortOrder('asc');
  }
};
const handleSortByJobs = () => {
  if (sortField === 'jobs') {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortField('jobs');
    setSortOrder('asc');
  }
};

const TECHNICIAN_STATUS_MAP = {
  0: 'PENDING',
  1: 'APPROVED',
  2: 'REJECTED',
  3: 'INACTIVE',
  4: 'PENDING_DELETION',
  5: 'DELETED',
  'PENDING': 'PENDING',
  'APPROVED': 'APPROVED',
  'REJECTED': 'REJECTED',
  'INACTIVE': 'INACTIVE',
  'PENDING_DELETION': 'PENDING_DELETION',
  'DELETED': 'DELETED'
};

function getTechnicianStatus(status) {
  return TECHNICIAN_STATUS_MAP[status] || status || 'Chưa cập nhật';
}

// Thêm hàm chuyển đổi availability nếu chưa có
const TECHNICIAN_AVAILABILITY_MAP = {
  1: 'FREE',
  2: 'BUSY',
  0: 'ONJOB',
};
function getTechnicianAvailability(availability) {
  return TECHNICIAN_AVAILABILITY_MAP[availability] || availability || 'Chưa cập nhật';
}

// Thêm hàm getStatusBadgeClass giống UserManagement
const getStatusBadgeClass = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':
      return 'bg-success-transparent';
    case 'REJECTED':
      return 'bg-danger-transparent';
    default:
      return 'bg-secondary-transparent';
  }
};


 return (
   <div className="modern-page-wrapper">
     <div className="modern-content-card">
       {/* Breadcrumb */}
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Technicians</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Technicians</li>
             </ol>
           </nav>
         </div>
       </div>
       {/* Search & Filters */}
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
                 placeholder="Search technicians"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
           <Select
             placeholder="Availability"
             value={filterAvailability || undefined}
             onChange={value => setFilterAvailability(value)}
             style={{ width: 150, marginRight: 8 }}
             allowClear
           >
             <Select.Option value="ONJOB">ONJOB</Select.Option>
             <Select.Option value="FREE">FREE</Select.Option>
             <Select.Option value="BUSY">BUSY</Select.Option>
           </Select>
           <Select
             placeholder="Status"
             value={filters.status || undefined}
             onChange={value => dispatch(setFilters({ ...filters, status: value }))}
             style={{ width: 130, marginRight: 8 }}
             allowClear
           >
             <Select.Option value="PENDING">PENDING</Select.Option>
             <Select.Option value="APPROVED">APPROVED</Select.Option>
             <Select.Option value="REJECTED">REJECTED</Select.Option>
           </Select>
           
         </div>
         <div className="d-flex align-items-center" style={{ gap: 12 }}>
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
       {/* Table */}
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                 NAME
                 {sortField === 'fullName' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByEmail}>
                 EMAIL
                 {sortField === 'email' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByPhone}>
                 PHONE
                 {sortField === 'phone' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th>STATUS</th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByRating}>
                 RATING
                 {sortField === 'rating' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th style={{ cursor: 'pointer' }} onClick={handleSortByJobs}>
                 JOBS
                 {sortField === 'jobs' && (
                   <span style={{ marginLeft: 4 }}>
                     {sortOrder === 'asc' ? '▲' : '▼'}
                   </span>
                 )}
               </th>
               <th>AVAILABILITY</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {loading && technicians.length === 0 ? (
               <tr>
                 <td colSpan={7} className="text-center"><Spin /></td>
               </tr>
             ) : (
               currentTechnicians.map((tech) => (
                 <tr key={tech.id}>
                   <td>{tech.fullName}</td>
                   <td>{tech.email}</td>
                   <td>{tech.phone}</td>
                   <td>
                     <span className={`badge ${getStatusBadgeClass(getTechnicianStatus(tech.status))} text-dark`}>
                       {getTechnicianStatus(tech.status)}
                     </span>
                   </td>
                   <td>{tech.ratingAverage?.toFixed(1) ?? '-'}</td>
                   <td>{tech.jobCompleted ?? 0}</td>
                   <td>{getTechnicianAvailability(tech.availability)}</td>
                   <td>
                     <div className="d-flex align-items-center gap-2">
                       {tech.status === "PENDING" && (
                         <button className="btn btn-sm btn-primary" onClick={() => handleOpenEditStatus(tech)}>
                           <i className="ti ti-edit me-1"></i>Edit Status
                         </button>
                       )}
                       <Button className="management-action-btn" size="middle" onClick={() => handleOpenDetail(tech)}>
                          <EyeOutlined style={{marginRight: 4}} />View Detail
                        </Button>
                     </div>
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


     {/* Detail Modal */}
     {showDetailModal && selectedTechnician && (
       <Modal
         open={showDetailModal}
         onCancel={handleCloseDetail}
         footer={null}
         title={null}
         width={800}
       >
         <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32}}>
           <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
             <div style={{width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#888'}}>
               {selectedTechnician.avatar ? (
                 <img src={selectedTechnician.avatar.startsWith('http') ? selectedTechnician.avatar : `${process.env.REACT_APP_API_URL || ''}${selectedTechnician.avatar}`}
                      alt="avatar"
                      style={{width: '100%', height: '100%', objectFit: 'cover'}} />
               ) : (
                 selectedTechnician.fullName ? selectedTechnician.fullName[0].toUpperCase() : <i className="ti ti-user"></i>
               )}
             </div>
             <div style={{flex: 1}}>
               <div style={{fontSize: 22, fontWeight: 600, marginBottom: 4}}>{selectedTechnician.fullName || 'No Name'}</div>
               <div style={{fontSize: 15, color: '#888', marginBottom: 2}}>{selectedTechnician.email}</div>
               <div style={{fontSize: 13, color: '#888'}}>
                 <span style={{marginRight: 12}}><b>Status:</b> <span style={{color: getTechnicianStatus(selectedTechnician.status) === 'APPROVED' ? '#52c41a' : getTechnicianStatus(selectedTechnician.status) === 'REJECTED' ? '#cf1322' : '#faad14'}}>{getTechnicianStatus(selectedTechnician.status)}</span></span>
                 <span><b>Phone:</b> {selectedTechnician.phone || '-'}</span>
               </div>
             </div>
           </div>
           <div style={{borderTop: '1px solid #f0f0f0', marginBottom: 16}}></div>
           <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Kinh nghiệm (năm)</div>
               <div>{selectedTechnician.experienceYears ?? '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Số job hoàn thành</div>
               <div>{selectedTechnician.jobCompleted ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Rating trung bình</div>
               <div>{selectedTechnician.ratingAverage ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Chuyên môn</div>
               <div style={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
                 {[...new Set(selectedTechnician.specialtiesCategories || [])].map(catIdRaw => {
                   let catId = catIdRaw && typeof catIdRaw === 'object' && catIdRaw.$oid
                     ? catIdRaw.$oid
                     : (catIdRaw.id || catIdRaw._id || catIdRaw).toString().trim();
                   return (
                     <span key={catId} className="badge bg-secondary mb-1">
                       {categoryMap[catId] || catId}
                     </span>
                   );
                 })}
               </div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Chứng chỉ</div>
               <div>{(selectedTechnician.certificate && selectedTechnician.certificate.length > 0) ? selectedTechnician.certificate.join(', ') : '-'}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Tài khoản ngân hàng</div>
               <div>
                 {selectedTechnician.bankAccount ? (
                   <>
                     <div>Ngân hàng: {selectedTechnician.bankAccount.bankName}</div>
                     <div>Số TK: {selectedTechnician.bankAccount.accountNumber}</div>
                     <div>Chủ TK: {selectedTechnician.bankAccount.accountHolder}</div>
                     <div>Chi nhánh: {selectedTechnician.bankAccount.branch}</div>
                   </>
                 ) : '-'}
               </div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Số dư</div>
               <div>{selectedTechnician.balance ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Tổng thu nhập</div>
               <div>{selectedTechnician.totalEarning ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Tổng hoa hồng đã trả</div>
               <div>{selectedTechnician.totalCommissionPaid ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Tổng giữ lại</div>
               <div>{selectedTechnician.totalHoldingAmount ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Tổng đã rút</div>
               <div>{selectedTechnician.totalWithdrawn ?? 0}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Đơn giá kiểm tra</div>
               <div>{selectedTechnician.rates?.inspectionFee ?? '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Đơn giá công (tier1)</div>
               <div>{selectedTechnician.rates?.laborTiers?.tier1 ?? '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Đơn giá công (tier2)</div>
               <div>{selectedTechnician.rates?.laborTiers?.tier2 ?? '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Đơn giá công (tier3)</div>
               <div>{selectedTechnician.rates?.laborTiers?.tier3 ?? '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Trạng thái làm việc</div>
               <div>{getTechnicianAvailability(selectedTechnician.availability)}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ảnh mặt trước CCCD</div>
               <div>{selectedTechnician.frontIdImage ? <img src={selectedTechnician.frontIdImage.startsWith('http') ? selectedTechnician.frontIdImage : `${process.env.REACT_APP_API_URL || ''}${selectedTechnician.frontIdImage}`} alt="frontId" style={{ maxWidth: 120, borderRadius: 8 }} /> : '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ảnh mặt sau CCCD</div>
               <div>{selectedTechnician.backIdImage ? <img src={selectedTechnician.backIdImage.startsWith('http') ? selectedTechnician.backIdImage : `${process.env.REACT_APP_API_URL || ''}${selectedTechnician.backIdImage}`} alt="backId" style={{ maxWidth: 120, borderRadius: 8 }} /> : '-'}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Vị trí hiện tại</div>
               <div>
                 {selectedTechnician.currentLocation ? (
                   <>
                     <div>Type: {selectedTechnician.currentLocation.type}</div>
                     <div>Toạ độ: {selectedTechnician.currentLocation.coordinates?.join(', ')}</div>
                   </>
                 ) : '-'}
               </div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ngày chờ xoá</div>
               <div>{selectedTechnician.pendingDeletionAt ? new Date(selectedTechnician.pendingDeletionAt).toLocaleString() : '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ngày xoá</div>
               <div>{selectedTechnician.deletedAt ? new Date(selectedTechnician.deletedAt).toLocaleString() : '-'}</div>
             </div>
             <div>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ngày cập nhật giá</div>
               <div>{selectedTechnician.pricesLastUpdatedAt ? new Date(selectedTechnician.pricesLastUpdatedAt).toLocaleString() : '-'}</div>
             </div>
             <div style={{gridColumn: '1 / span 2'}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Ghi chú</div>
               <div>{selectedTechnician.note || '-'}</div>
             </div>
           </div>
         </div>
       </Modal>
     )}
     {/* Edit Status Modal */}
     {showEditStatusModal && selectedTechnician && (
       <Modal
         open={showEditStatusModal}
         onCancel={handleCloseEditStatus}
         footer={null}
         title="Update Technician Status"
       >
         <form onSubmit={handleUpdateStatus}>
           <div className="mb-3">
             <label className="form-label">Status</label>
             <select name="status" className="form-select" value={statusData.status} onChange={handleStatusChange} required>
               <option value="PENDING">PENDING</option>
               <option value="APPROVED">APPROVED</option>
               <option value="REJECTED">REJECTED</option>
             </select>
           </div>
           <div className="mb-3">
             <label className="form-label">Note (Optional)</label>
             <textarea name="note" className="form-control" value={statusData.note} onChange={handleStatusChange} rows="3"></textarea>
           </div>
           <div className="d-flex justify-content-end">
             <button type="button" className="btn btn-light me-2" onClick={handleCloseEditStatus}>Cancel</button>
             <button type="submit" className="btn btn-primary">Save Changes</button>
           </div>
         </form>
       </Modal>
     )}


   </div>
 );
};


export default TechnicianManagement;

