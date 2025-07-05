import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Select } from 'antd';
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



 const indexOfLastTechnician = currentPage * techniciansPerPage;
 const indexOfFirstTechnician = indexOfLastTechnician - techniciansPerPage;
 const sortedTechnicians = [...technicians].sort((a, b) => {
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
                 placeholder="Search name, email, phone"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
           {/* Status Filter */}
           <Select
             allowClear
             placeholder="Status"
             style={{ width: 130 }}
             onChange={value => dispatch(setFilters({ status: value }))}
             options={[
               { value: 'APPROVED', label: 'APPROVED' },
               { value: 'PENDING', label: 'PENDING' },
               { value: 'REJECTED', label: 'REJECTED' },
             ]}
           />
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
               <th></th>
             </tr>
           </thead>
           <tbody>
             {currentTechnicians.map((tech) => (
               <tr key={tech.id}>
                 <td>{tech.fullName}</td>
                 <td>{tech.email}</td>
                 <td>{tech.phone}</td>
                 <td>
                   <span className={`badge badge-dark-transparent ${tech.status === 'APPROVED' ? 'text-success' : tech.status === 'REJECTED' ? 'text-danger' : 'text-warning'}`}>
                     <i className={`ti ti-point-filled ${tech.status === 'APPROVED' ? 'text-success' : tech.status === 'REJECTED' ? 'text-danger' : 'text-warning'} me-1`}></i>
                     {tech.status}
                   </span>
                 </td>
                 <td>{tech.ratingAverage?.toFixed(1) ?? '-'}</td>
                 <td>{tech.jobCompleted ?? 0}</td>
                 <td>
                   <div className="d-flex align-items-center gap-2">
                     {tech.status === "PENDING" && (
                       <button className="btn btn-sm btn-primary" onClick={() => handleOpenEditStatus(tech)}>
                         <i className="ti ti-edit me-1"></i>Edit Status
                       </button>
                     )}
                     <button className="btn btn-sm btn-info" onClick={() => handleOpenDetail(tech)}>
                       <i className="ti ti-eye me-1"></i>View Detail
                     </button>
                   </div>
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


     {/* Detail Modal */}
     {showDetailModal && selectedTechnician && (
       <Modal
         open={showDetailModal}
         onCancel={handleCloseDetail}
         footer={null}
         title="Technician Detail"
       >
         <div><b>ID:</b> {selectedTechnician.id}</div>
         <div><b>Name:</b> {selectedTechnician.fullName}</div>
         <div><b>Email:</b> {selectedTechnician.email}</div>
         <div><b>Phone:</b> {selectedTechnician.phone}</div>
         <div><b>Specialization:</b>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
         <div><b>Status:</b> {selectedTechnician.status}</div>
         <div><b>Rating:</b> {selectedTechnician.ratingAverage?.toFixed(1) ?? '-'}</div>
         <div><b>Jobs Completed:</b> {selectedTechnician.jobCompleted ?? 0}</div>
         <div><b>Note:</b> {selectedTechnician.note || '-'}</div>
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

