import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Select } from 'antd';
import { userAPI } from '../../features/users/userAPI';
import { roleAPI } from '../../features/roles/roleAPI';
import { setUsers, setLoading, setError, setFilters } from '../../features/users/userSlice';
import { selectFilteredUsers, selectUserFilters } from '../../features/users/userSelectors';


const UserManagement = () => {
   const dispatch = useDispatch();
   const filteredUsers = useSelector(selectFilteredUsers);
   const { search } = useSelector(selectUserFilters);
   const loading = useSelector(state => state.users.loading);
   const error = useSelector(state => state.users.error);


   const [showEditModal, setShowEditModal] = useState(false);
   const [showLockModal, setShowLockModal] = useState(false);
   const [showUnlockModal, setShowUnlockModal] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   const [roles, setRoles] = useState([]);
   const [lockReason, setLockReason] = useState('');
   const [unlockNote, setUnlockNote] = useState('');
   const [roleMap, setRoleMap] = useState({});
   const [showDetailModal, setShowDetailModal] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const usersPerPage = 10;
   const [sortField, setSortField] = useState('createdAt');
   const [sortOrder, setSortOrder] = useState('desc');


   const indexOfLastUser = currentPage * usersPerPage;
   const indexOfFirstUser = indexOfLastUser - usersPerPage;
   const sortedUsers = [...filteredUsers].sort((a, b) => {
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
   const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);


   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);


   const handlePageChange = (pageNumber) => {
       setCurrentPage(pageNumber);
   };


   const initialFormState = {
       fullName: '',
       email: '',
       phone: '',
       password: '',
       confirmPassword: '',
       role: '',
       status: 'ACTIVE',
   };
   const [formData, setFormData] = useState(initialFormState);


   const fetchUsers = async () => {
       try {
           dispatch(setLoading(true));
           const usersData = await userAPI.getAll();
           dispatch(setUsers(usersData || []));
       } catch (err) {
           dispatch(setError(err.toString()));
           message.error('Failed to load users.');
       } finally {
           dispatch(setLoading(false));
       }
   };


   const fetchRoles = async () => {
       try {
           const rolesData = await roleAPI.getAll();
           setRoles(rolesData || []);
           const map = {};
           (rolesData || []).forEach(r => { map[r.id] = r.name; });
           setRoleMap(map);
       } catch (err) {
           message.error('Failed to load roles.');
       }
   };


   useEffect(() => {
       fetchUsers();
       fetchRoles();
   }, [dispatch]);


   const handleEditUser = (user) => {
       setSelectedUser(user);
       setFormData({
           ...user,
           password: '',
           confirmPassword: ''
       });
       setShowEditModal(true);
   };


   const handleLockUser = (user) => {
       setSelectedUser(user);
       setLockReason('');
       setShowLockModal(true);
   };


   const handleUnlockUser = (user) => {
       setSelectedUser(user);
       setUnlockNote('');
       setShowUnlockModal(true);
   };


   const handleChange = (e) => {
       setFormData({ ...formData, [e.target.name]: e.target.value });
   };


   const handleSubmit = async (e) => {
       e.preventDefault();
       if (formData.password && formData.password !== formData.confirmPassword) {
           message.error("Passwords do not match!");
           return;
       }
       try {
           dispatch(setLoading(true));
           const { confirmPassword, id, ...userData } = formData;
           if (!userData.password) {
               delete userData.password;
           }
           await userAPI.update(selectedUser.id, { ...userData, role: formData.role, status: formData.status });
           message.success('User updated successfully!');
           setShowEditModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.title || err.message || 'An operation failed.';
           dispatch(setError(errorMessage));
           message.error(errorMessage);
       } finally {
           dispatch(setLoading(false));
       }
   };


   const handleLockSubmit = async (e) => {
       e.preventDefault();
       if (!lockReason.trim()) {
           message.error('Lock reason is required!');
           return;
       }
       try {
           dispatch(setLoading(true));
           await userAPI.lockUser(selectedUser.id, lockReason);
           message.success('User locked successfully!');
           setShowLockModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.message || err.message || 'Failed to lock user.';
           dispatch(setError(errorMessage));
           message.error(errorMessage);
       } finally {
           dispatch(setLoading(false));
       }
   };


   const handleUnlockSubmit = async (e) => {
       e.preventDefault();
       try {
           dispatch(setLoading(true));
           await userAPI.unlockUser(selectedUser.id, unlockNote);
           message.success('User unlocked successfully!');
           setShowUnlockModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.message || err.message || 'Failed to unlock user.';
           dispatch(setError(errorMessage));
           message.error(errorMessage);
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


   const getStatusBadgeClass = (status) => {
       switch (status?.toUpperCase()) {
           case 'ACTIVE':
               return 'bg-success-transparent';
           case 'INACTIVE':
               return 'bg-danger-transparent';
           default:
               return 'bg-secondary-transparent';
       }
   };


   const getStatusIconClass = (status) => {
       switch (status?.toUpperCase()) {
           case 'ACTIVE':
               return 'text-success';
           case 'INACTIVE':
               return 'text-danger';
           default:
               return 'text-secondary';
       }
   };


   return (
       <div className="modern-page-wrapper">
           <div className="modern-content-card">
               <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                   <div className="my-auto mb-2">
                       <h4 className="mb-1">Users</h4>
                       <nav>
                           <ol className="breadcrumb mb-0">
                               <li className="breadcrumb-item">
                                   <a href="/admin">Home</a>
                               </li>
                               <li className="breadcrumb-item active" aria-current="page">Users</li>
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
                                   value={search}
                                   onChange={e => dispatch(setFilters({ search: e.target.value }))}
                               />
                           </div>
                       </div>
                       {/* Role Filter */}
                       <Select
                           allowClear
                           placeholder="Role"
                           style={{ width: 130 }}
                           onChange={value => dispatch(setFilters({ role: value }))}
                           options={roles.map(role => ({ value: role.id, label: role.name }))}
                       />
                       {/* Status Filter */}
                       <Select
                           allowClear
                           placeholder="Status"
                           style={{ width: 130 }}
                           onChange={value => dispatch(setFilters({ status: value }))}
                           options={[
                               { value: 'ACTIVE', label: 'ACTIVE' },
                               { value: 'INACTIVE', label: 'INACTIVE' },
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
               <div className="custom-datatable-filter table-responsive">
                   <table className="table datatable">
                       <thead className="thead-light">
                           <tr>
                               <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                                   FULL NAME
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
                               <th>ROLE</th>
                               <th>STATUS</th>
                               <th>ACTION</th>
                           </tr>
                       </thead>
                       <tbody>
                           {currentUsers.map(user => (
                               <tr key={user.id}>
                                   <td>
                                       <div className="d-flex align-items-center">
                                           <a href="#" className="avatar me-2 flex-shrink-0">
                                               <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="rounded-circle" alt="" />
                                           </a>
                                           <h6><a href="#" className="fs-14 fw-semibold">{user.fullName}</a></h6>
                                       </div>
                                   </td>
                                   <td><p className="text-gray-9">{user.email}</p></td>
                                   <td><p className="text-gray-9">{user.phone}</p></td>
                                   <td><p className="text-gray-9">{roleMap[user.role] || user.role}</p></td>
                                   <td>
                                       <span className={`badge ${getStatusBadgeClass(user.status)} text-dark`}>
                                           <i className={`ti ti-point-filled ${getStatusIconClass(user.status)} me-1`}></i>
                                           {user.status}
                                       </span>
                                   </td>
                                   <td>
                                       <div className="d-flex align-items-center gap-2">
                                           {/* <button className="btn btn-sm btn-primary" onClick={() => handleEditUser(user)}>
                                               <i className="ti ti-edit me-1"></i>Edit
                                           </button> */}
                                           {user.lockedReason ? (
                                               <button className="btn btn-sm btn-success" onClick={() => handleUnlockUser(user)}>
                                                   <i className="ti ti-unlock me-1"></i>Unlock
                                               </button>
                                           ) : (
                                               <button className="btn btn-sm btn-danger" onClick={() => handleLockUser(user)}>
                                                   <i className="ti ti-lock me-1"></i>Lock
                                               </button>
                                           )}
                                           <button className="btn btn-sm btn-info" onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}>
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
                               <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                   <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                                       {i + 1}
                                   </button>
                               </li>
                           ))}
                       </ul>
                   </nav>
               </div>




               {/* Edit Modal chỉ cho phép chỉnh Role */}
               {showEditModal && (
                   <div className="modal fade show" style={{ display: 'block', zIndex: 2000, background: 'rgba(0,0,0,0.2)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                       <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
                           <div className="modal-content">
                               <form onSubmit={handleSubmit}>
                                   <div className="modal-header">
                                       <h5 className="mb-0">Edit User Role</h5>
                                       <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
                                   </div>
                                   <div className="modal-body pb-1">
                                       <div className="mb-3">
                                           <label className="form-label">Role <span className="text-danger">*</span></label>
                                           <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                                               <option value="">Select Role</option>
                                               {roles.map(role => (
                                                   <option key={role.id} value={role.id}>{role.name}</option>
                                               ))}
                                           </select>
                                       </div>
                                   </div>
                                   <div className="modal-footer">
                                       <div className="d-flex justify-content-end w-100">
                                           <button type="button" className="btn btn-light me-3" onClick={() => setShowEditModal(false)}>Cancel</button>
                                           <button type="submit" className="btn btn-primary">Save Changes</button>
                                       </div>
                                   </div>
                               </form>
                           </div>
                       </div>
                   </div>
               )}


               {/* Lock Modal */}
               {showLockModal && (
                   <div
                       className="modal fade show"
                       style={{
                           display: 'block',
                           zIndex: 2000,
                           background: 'rgba(0,0,0,0.2)',
                           position: 'fixed',
                           top: 0, left: 0, right: 0, bottom: 0
                       }}
                   >
                       <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
                           <div className="modal-content">
                               <form onSubmit={handleLockSubmit}>
                                   <div className="modal-header">
                                       <h5 className="mb-0">Lock User</h5>
                                       <button type="button" className="btn-close" onClick={() => setShowLockModal(false)} aria-label="Close"></button>
                                   </div>
                                   <div className="modal-body pb-1">
                                       <div className="alert alert-warning">
                                           <i className="ti ti-alert-triangle me-2"></i>
                                           Are you sure you want to lock <strong>{selectedUser?.fullName}</strong>?
                                       </div>
                                       <div className="mb-3">
                                           <label className="form-label">Lock Reason <span className="text-danger">*</span></label>
                                           <textarea
                                               className="form-control"
                                               rows="3"
                                               value={lockReason}
                                               onChange={(e) => setLockReason(e.target.value)}
                                               placeholder="Please provide a reason for locking this user..."
                                               required
                                           />
                                       </div>
                                   </div>
                                   <div className="modal-footer">
                                       <div className="d-flex justify-content-end w-100">
                                           <button type="button" className="btn btn-light me-3" onClick={() => setShowLockModal(false)}>Cancel</button>
                                           <button type="submit" className="btn btn-danger">Lock User</button>
                                       </div>
                                   </div>
                               </form>
                           </div>
                       </div>
                   </div>
               )}


               {/* Unlock Modal */}
               {showUnlockModal && (
                   <div
                       className="modal fade show"
                       style={{
                           display: 'block',
                           zIndex: 2000,
                           background: 'rgba(0,0,0,0.2)',
                           position: 'fixed',
                           top: 0, left: 0, right: 0, bottom: 0
                       }}
                   >
                       <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
                           <div className="modal-content">
                               <form onSubmit={handleUnlockSubmit}>
                                   <div className="modal-header">
                                       <h5 className="mb-0">Unlock User</h5>
                                       <button type="button" className="btn-close" onClick={() => setShowUnlockModal(false)} aria-label="Close"></button>
                                   </div>
                                   <div className="modal-body pb-1">
                                       <div className="alert alert-info">
                                           <i className="ti ti-info-circle me-2"></i>
                                           Are you sure you want to unlock <strong>{selectedUser?.fullName}</strong>?
                                       </div>
                                       <div className="mb-3">
                                           <label className="form-label">Note (Optional)</label>
                                           <textarea
                                               className="form-control"
                                               rows="3"
                                               value={unlockNote}
                                               onChange={(e) => setUnlockNote(e.target.value)}
                                               placeholder="Add a note about why this user is being unlocked..."
                                           />
                                       </div>
                                   </div>
                                   <div className="modal-footer">
                                       <div className="d-flex justify-content-end w-100">
                                           <button type="button" className="btn btn-light me-3" onClick={() => setShowUnlockModal(false)}>Cancel</button>
                                           <button type="submit" className="btn btn-success">Unlock User</button>
                                       </div>
                                   </div>
                               </form>
                           </div>
                       </div>
                   </div>
               )}


               {/* Modal View Detail */}
               {showDetailModal && selectedUser && (
                   <div className="modal fade show" style={{ display: 'block', zIndex: 2000, background: 'rgba(0,0,0,0.2)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                       <div className="modal-dialog modal-dialog-centered modal-md" style={{ zIndex: 2100 }}>
                           <div className="modal-content">
                               <div className="modal-header">
                                   <h5 className="mb-0">User Detail</h5>
                                   <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} aria-label="Close"></button>
                               </div>
                               <div className="modal-body pb-1">
                                   <div><b>Full Name:</b> {selectedUser.fullName}</div>
                                   <div><b>Email:</b> {selectedUser.email}</div>
                                   <div><b>Phone:</b> {selectedUser.phone}</div>
                                   <div><b>Role:</b> {roleMap[selectedUser.role] || selectedUser.role}</div>
                                   <div><b>Status:</b> {selectedUser.status}</div>
                                   {selectedUser.lockedReason && (
                                       <div><b>Lock Reason:</b> {selectedUser.lockedReason}</div>
                                   )}
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>
   );
};


export default UserManagement;

