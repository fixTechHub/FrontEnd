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
import "../../../public/css/ManagementTableStyle.css";
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';


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

// Set export data và columns
useEffect(() => {
  const exportColumns = [
    { title: 'Full Name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Availability', dataIndex: 'availability' },
    { title: 'Rating', dataIndex: 'rating' },
    { title: 'Jobs Completed', dataIndex: 'jobsCompleted' },
    { title: 'Total Earning', dataIndex: 'totalEarning' },
    { title: 'Total Commission Paid', dataIndex: 'totalCommissionPaid' },
    { title: 'Total Holding Amount', dataIndex: 'totalHoldingAmount' },
    { title: 'Total Withdrawn', dataIndex: 'totalWithdrawn' },
    { title: 'Created At', dataIndex: 'createdAt' },
    { title: 'Updated At', dataIndex: 'updatedAt' },
  ];

  const exportData = sortedTechnicians.map(technician => ({
    fullName: technician.fullName,
    email: technician.email,
    phone: technician.phone,
    status: technician.status,
    availability: technician.availability,
    rating: technician.ratingAverage || 0,
    jobsCompleted: technician.jobCompleted || 0,
    totalEarning: formatCurrency(technician.totalEarning || 0),
    totalCommissionPaid: formatCurrency(technician.totalCommissionPaid || 0),
    totalHoldingAmount: formatCurrency(technician.totalHoldingAmount || 0),
    totalWithdrawn: formatCurrency(technician.totalWithdrawn || 0),
    createdAt: formatDateTime(technician.createdAt),
    updatedAt: formatDateTime(technician.updatedAt),
  }));

  createExportData(exportData, exportColumns, 'technicians_export', 'Technicians');
}, [sortedTechnicians]);

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
     await technicianAPI.updateStatus(selectedTechnician.id, statusData.status, statusData.note);
     await fetchTechnicians();
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


 const handleUpdateStatusWithAction = async (action, technician = null) => {
   const targetTechnician = technician || selectedTechnician;
   
   if (action === 'REJECTED' && !statusData.note.trim()) {
     message.error('Please provide a reason for rejection');
     return;
   }

   if (!targetTechnician) return;
   
   try {
     dispatch(setLoading(true));
     const note = action === 'REJECTED' ? statusData.note : '';
     await technicianAPI.updateStatus(targetTechnician.id, action, note);
     await fetchTechnicians();
     message.success(`Technician ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
     if (technician) {
       // Nếu được gọi từ table, không cần đóng modal
     } else {
       handleCloseEditStatus();
     }
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
   <div className="modern-page- wrapper">
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
                       {tech.status === "PENDING" ? (
                         <>
                           <button 
                             className="btn btn-sm btn-success" 
                             onClick={() => handleUpdateStatusWithAction('APPROVED', tech)}
                             disabled={loading}
                           >
                             <i className="ti ti-check me-1"></i>
                             APPROVE
                           </button>
                           <button 
                             className="btn btn-sm btn-danger" 
                             onClick={() => handleOpenEditStatus(tech)}
                             disabled={loading}
                           >
                             <i className="ti ti-x me-1"></i>
                             REJECT
                           </button>
                         </>
                       ) : null}
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
         <div style={{background: '#ffffff', borderRadius: 12, overflow: 'hidden'}}>
           {/* Header Section */}
           <div style={{background: 'linear-gradient(135deg, #000 0%, #FFAF47 100%)', padding: '24px', color: 'white'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
               <div style={{
                 width: '80px', 
                 height: '80px', 
                 borderRadius: '50%', 
                 overflow: 'hidden', 
                 background: 'rgba(255,255,255,0.2)', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 fontSize: '32px', 
                 color: 'white',
                 border: '3px solid rgba(255,255,255,0.3)'
               }}>
                 {selectedTechnician.avatar ? (
                   <img 
                     src={selectedTechnician.avatar.startsWith('http') ? selectedTechnician.avatar : `${process.env.REACT_APP_API_URL || ''}${selectedTechnician.avatar}`}
                     alt="avatar"
                     style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                   />
                 ) : (
                   selectedTechnician.fullName ? selectedTechnician.fullName[0].toUpperCase() : 'T'
                 )}
               </div>
               <div style={{flex: 1}}>
                 <div style={{fontSize: '24px', fontWeight: 700, marginBottom: '4px'}}>
                   {selectedTechnician.fullName || 'UNKNOWN'}
                 </div>
                 <div style={{fontSize: '14px', opacity: 0.9, marginBottom: '8px'}}>
                   {selectedTechnician.email || "-"}
                 </div>
                 <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                   <div style={{
                     background: 'rgba(255,255,255,0.2)', 
                     padding: '4px 12px', 
                     borderRadius: '20px',
                     fontSize: '12px',
                     fontWeight: 600
                   }}>
                     {getTechnicianStatus(selectedTechnician.status)}
                   </div>
                   <div style={{fontSize: '12px', opacity: 0.8}}>
                     {selectedTechnician.phone || "-"}
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Main Content */}
           <div style={{padding: '24px'}}>
             {/* Basic Information Grid */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Basic Information</div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                 gap: '16px'
               }}>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Experience (Years)</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedTechnician.experienceYears ?? '-'} years
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Jobs Completed</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedTechnician.jobCompleted ?? 0}
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Average Rating</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {selectedTechnician.ratingAverage?.toFixed(1) ?? '0.0'} ⭐
                   </div>
                 </div>
                 <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                   <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Availability</div>
                   <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                     {getTechnicianAvailability(selectedTechnician.availability)}
                   </div>
                 </div>
               </div>
             </div>

             {/* Financial Information Section */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Financial Information</div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                 gap: '12px'
               }}>
                 <div style={{textAlign: 'center', background: '#e6f7ff', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Balance</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: '#1890ff'}}>
                     ${selectedTechnician.balance?.toLocaleString() ?? '0'}
                   </div>
                 </div>
                 <div style={{textAlign: 'center', background: '#f6ffed', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Total Earnings</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: '#52c41a'}}>
                     ${selectedTechnician.totalEarning?.toLocaleString() ?? '0'}
                   </div>
                 </div>
                 <div style={{textAlign: 'center', background: '#fffbe6', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Commission Paid</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: '#faad14'}}>
                     ${selectedTechnician.totalCommissionPaid?.toLocaleString() ?? '0'}
                   </div>
                 </div>
                 <div style={{textAlign: 'center', background: '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Holding Amount</div>
                   <div style={{fontSize: '13px', fontWeight: 600, color: '#888'}}>
                     ${selectedTechnician.totalHoldingAmount?.toLocaleString() ?? '0'}
                   </div>
                 </div>
               </div>
             </div>

             {/* Specialties Section */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Specialties</div>
               <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                 <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                   {[...new Set(selectedTechnician.specialtiesCategories || [])].map(catIdRaw => {
                     let catId = catIdRaw && typeof catIdRaw === 'object' && catIdRaw.$oid
                       ? catIdRaw.$oid
                       : (catIdRaw.id || catIdRaw._id || catIdRaw).toString().trim();
                     return (
                       <span 
                         key={catId} 
                         style={{
                           background: '#667eea',
                           color: 'white',
                           padding: '4px 12px',
                           borderRadius: '20px',
                           fontSize: '12px',
                           fontWeight: 500
                         }}
                       >
                         {categoryMap[catId] || catId}
                       </span>
                     );
                   })}
                   {(!selectedTechnician.specialtiesCategories || selectedTechnician.specialtiesCategories.length === 0) && (
                     <span style={{color: '#999', fontSize: '14px'}}>No specialties listed</span>
                   )}
                 </div>
               </div>
             </div>

             {/* Certificates Section */}
             <div style={{marginBottom: '24px'}}>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Certificates</div>
               <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                 <div style={{fontSize: '14px', color: '#333', lineHeight: '1.5'}}>
                   {(selectedTechnician.certificate && selectedTechnician.certificate.length > 0) 
                     ? selectedTechnician.certificate.join(', ') 
                     : 'No certificates listed'}
                 </div>
               </div>
             </div>

             {/* Bank Account Section */}
             <div>
               <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Bank Account</div>
               <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                 {selectedTechnician.bankAccount ? (
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                     gap: '12px'
                   }}>
                     <div>
                       <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Bank Name</div>
                       <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                         {selectedTechnician.bankAccount.bankName}
                       </div>
                     </div>
                     <div>
                       <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Account Number</div>
                       <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                         {selectedTechnician.bankAccount.accountNumber}
                       </div>
                     </div>
                     <div>
                       <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Account Holder</div>
                       <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                         {selectedTechnician.bankAccount.accountHolder}
                       </div>
                     </div>
                     <div>
                       <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Branch</div>
                       <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                         {selectedTechnician.bankAccount.branch}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div style={{color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px'}}>
                     No bank account information available
                   </div>
                 )}
               </div>
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
         title="Reject Technician"
       >
         <div style={{marginBottom: '20px'}}>
           <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '10px'}}>
             Technician: {selectedTechnician.fullName || 'Unknown'}
           </div>
           <div style={{fontSize: '14px', color: '#666'}}>
             Current Status: {getTechnicianStatus(selectedTechnician.status)}
           </div>
         </div>

         <div style={{marginBottom: '20px'}}>
           <div style={{fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#d32f2f'}}>
             Rejection Note (Required):
           </div>
           <textarea 
             name="note" 
             className="form-control" 
             value={statusData.note} 
             onChange={handleStatusChange} 
             rows="4"
             placeholder="Please provide a reason for rejection..."
             style={{borderColor: statusData.note ? '#d9d9d9' : '#ff4d4f'}}
             required
           />
         </div>

         <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
           <Button onClick={handleCloseEditStatus}>
             Cancel
           </Button>
           <Button 
             danger
             onClick={() => handleUpdateStatusWithAction('REJECTED')}
             loading={loading}
             disabled={!statusData.note.trim()}
           >
             Reject Technician
           </Button>
         </div>
       </Modal>
     )}


   </div>
 );
};


export default TechnicianManagement;