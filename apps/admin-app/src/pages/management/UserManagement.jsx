import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message, Select, Descriptions, Modal, Spin, Button } from 'antd';
import { userAPI } from '../../features/users/userAPI';
import { roleAPI } from '../../features/roles/roleAPI';
import { setUsers, setLoading, setError, setFilters } from '../../features/users/userSlice';
import { selectFilteredUsers, selectUserFilters } from '../../features/users/userSelectors';
import { EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { createExportData, formatDateTime, formatStatus } from '../../utils/exportUtils';


 const UserManagement = () => {
   const navigate = useNavigate();
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
   const [filterRole, setFilterRole] = useState('');
   const [filterStatus, setFilterStatus] = useState('');
   
   // Mapping vai trò từ tiếng Anh sang tiếng Việt
   const roleNameMapping = {
       'ADMIN': 'Quản trị viên',
       'PENDING': 'Đang chờ',
       'TECHNICIAN': 'Kỹ thuật viên',
       'CUSTOMER': 'Khách hàng',
       'admin': 'Quản trị viên',
       'technician': 'Kỹ thuật viên',
       'customer': 'Khách hàng',
       'pending': 'Đang chờ'
   };


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

   // Set export data và columns
   useEffect(() => {
     const exportColumns = [
       { title: 'Họ và tên', dataIndex: 'Họ và tên' },
       { title: 'Email', dataIndex: 'Email' },
       { title: 'SĐT', dataIndex: 'SĐT' },
       { title: 'Vai trò', dataIndex: 'Vai trò' },
       { title: 'Trạng thái', dataIndex: 'Trạng thái' },
       { title: 'Thời gian tạo', dataIndex: 'Thời gian tạo' },
     ];

     // Export toàn bộ dữ liệu đã filter, không chỉ trang hiện tại
     const exportData = filteredUsers.map(user => {
       const roleName = roleNameMapping[user.roleName || roleMap[user.role] || user.role] || user.roleName || roleMap[user.role] || user.role || '';
       const roleKey = user.roleName || roleMap[user.role] || user.role || '';
       const roleColor = getRoleColor(user.role);
       
       return {
         'Họ và tên': user.fullName,
         Email: user.email,
         SĐT: user.phone,
         'Vai trò': roleName,
         'Trạng thái': user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'INACTIVE' ? 'Không hoạt động' : formatStatus(user.status),
         'Thời gian tạo': formatDateTime(user.createdAt),
       };
     });
     
     // Thông tin export để user biết đang export gì
     const exportInfo = {
       totalRecords: filteredUsers.length,
       hasFilters: !!(search || filterRole || filterStatus),
       filters: {
         search: search || null,
         role: filterRole ? roles.find(r => r.id === filterRole)?.name : null,
         status: filterStatus || null
       }
     };

     createExportData(exportData, exportColumns, 'users_export', 'Users', exportInfo);
   }, [filteredUsers, roleMap, search, filterRole, filterStatus, roles]);

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
           message.error('Tải các người dùng thất bại.');
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
           message.error('Tải các vai trò thất bại.');
       }
   };


   useEffect(() => {
       fetchUsers();
       fetchRoles();
   }, [dispatch]);

   // Reset to first page when filters change
   useEffect(() => {
       setCurrentPage(1);
   }, [search, filterRole, filterStatus]);

   // Cleanup filters when component unmounts
   useEffect(() => {
       return () => {
           // Reset filters when leaving the page
           dispatch(setFilters({ search: '', role: '', status: '' }));
           // Reset local states
           setFilterRole('');
           setFilterStatus('');
           setCurrentPage(1);
       };
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
           message.error("Mật khẩu không chính xác!");
           return;
       }
       try {
           dispatch(setLoading(true));
           const { confirmPassword, id, ...userData } = formData;
           if (!userData.password) {
               delete userData.password;
           }
           await userAPI.update(selectedUser.id, { ...userData, role: formData.role, status: formData.status });
           message.success('Cập nhật thành công!');
           setShowEditModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.title || err.message || 'Cập nhật thất bại.';
           dispatch(setError(errorMessage));
           message.error(errorMessage);
       } finally {
           dispatch(setLoading(false));
       }
   };


   const handleLockSubmit = async (e) => {
       e.preventDefault();
       if (!lockReason.trim()) {
           message.error('Bắt buộc phải nhập ly do khóa!');
           return;
       }
       try {
           dispatch(setLoading(true));
           await userAPI.lockUser(selectedUser.id, { lockedReason: lockReason });
           message.success('Khóa người dùng thành công!');
           setShowLockModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.message || err.message || 'Khóa người dùng thất bại.';
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
           await userAPI.unlockUser(selectedUser.id);
           message.success('Mở khóa người dùng thành công!');
           setShowUnlockModal(false);
           fetchUsers();
       } catch (err) {
           const errorMessage = err.response?.data?.message || err.message || 'Mở khóa người dùng thất bại.';
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
           case 'PENDING':
               return 'bg-warning-transparent';
           default:
               return 'bg-secondary-transparent';
       }
   };

   const getRoleBadgeClass = (role) => {
       const roleName = roleMap[role]?.toUpperCase();
       switch (roleName) {
           case 'ADMIN':
               return 'bg-danger-transparent';
           case 'TECHNICIAN':
               return 'bg-primary-transparent';
           case 'CUSTOMER':
               return 'bg-success-transparent';
           case 'PENDING':
               return 'bg-warning-transparent';
           default:
               return 'bg-secondary-transparent';
       }
   };

   const getRoleColor = (role) => {
       const roleName = roleMap[role]?.toUpperCase();
       switch (roleName) {
           case 'ADMIN':
               return '#dc3545'; // Đỏ đậm
           case 'TECHNICIAN':
               return '#0d6efd'; // Xanh dương đậm
           case 'CUSTOMER':
               return '#198754'; // Xanh lá đậm
           case 'PENDING':
               return '#ffc107'; // Vàng đậm
           default:
               return '#6c757d'; // Xám
       }
   };

   const getRoleIconClass = (role) => {
       const roleName = roleMap[role]?.toUpperCase();
       switch (roleName) {
           case 'ADMIN':
               return 'role-admin';
           case 'TECHNICIAN':
               return 'role-technician';
           case 'CUSTOMER':
               return 'role-customer';
           case 'PENDING':
               return 'role-pending';
           default:
               return 'role-default';
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
       <div className="modern-page- wrapper">
           <div className="modern-content-card">
               <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                   <div className="my-auto mb-2">
                       <h4 className="mb-1">Người dùng</h4>
                       <nav>
                           <ol className="breadcrumb mb-0">
                               <li className="breadcrumb-item">
                                   <a href="/admin">Trang chủ</a>
                               </li>
                               <li className="breadcrumb-item active" aria-current="page">Người dùng</li>
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
                                    placeholder="Tìm kiếm tên, mail, số điện thoại"
                                   value={search}
                                   onChange={e => dispatch(setFilters({ search: e.target.value }))}
                               />
                           </div>
                       </div>
                       {/* Role Filter */}
                       <Select
                           allowClear
                           placeholder="Vai trò"
                           style={{ width: 160 }}
                           value={filterRole || undefined}
                           onChange={value => {
                             setFilterRole(value);
                             dispatch(setFilters({ role: value }));
                           }}
                           options={roles.map(role => ({ 
                               value: role.id, 
                               label: (
                                   <div className="d-flex align-items-center">
                                       <div className="me-2" style={{ 
                                           width: '6px', 
                                           height: '6px', 
                                           borderRadius: '50%',
                                           backgroundColor: getRoleColor(role.id)
                                       }}></div>
                                       <span style={{ color: getRoleColor(role.id), fontWeight: '500' }}>
                                           {roleNameMapping[role.name] || role.name}
                                       </span>
                                   </div>
                               )
                           }))}
                       />
                       {/* Status Filter */}
                       <Select
                           allowClear
                           placeholder="Trạng thái"
                           style={{ width: 160 }}
                           value={filterStatus || undefined}
                           onChange={value => {
                             setFilterStatus(value);
                             dispatch(setFilters({ status: value }));
                           }}
                           options={[
                               { value: 'ACTIVE', label: 'Hoạt động' },
                               { value: 'INACTIVE', label: 'Không hoạt động' },
                           ]}
                       />
                   </div>
                   <div className="d-flex align-items-center" style={{ gap: 12 }}>
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
               {(search || filterRole || filterStatus) && (
                 <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
                   <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
                   {search && (
                     <span className="badge bg-primary-transparent">
                       <i className="ti ti-search me-1"></i>
                       Tìm kiếm: "{search}"
                     </span>
                   )}
                   {filterRole && (
                     <span className="badge bg-info-transparent">
                       <i className="ti ti-user me-1"></i>
                       Vai trò: <span className="ms-1" style={{ 
                           color: getRoleColor(filterRole),
                           fontSize: '11px',
                           fontWeight: '600',
                           textTransform: 'uppercase',
                           letterSpacing: '0.5px'
                       }}>
                           {roleNameMapping[roles.find(r => r.id === filterRole)?.name] || roles.find(r => r.id === filterRole)?.name || filterRole}
                       </span>
                     </span>
                   )}
                   {filterStatus && (
                     <span className="badge bg-warning-transparent">
                       <i className="ti ti-filter me-1"></i>
                       Trạng thái: {filterStatus === 'ACTIVE' ? 'Hoạt động' : filterStatus === 'INACTIVE' ? 'Không hoạt động' : filterStatus}
                     </span>
                   )}
                   <button 
                     className="btn btn-sm btn-outline-secondary"
                     onClick={() => {
                       dispatch(setFilters({ search: '', role: undefined, status: undefined }));
                       setFilterRole('');
                       setFilterStatus('');
                     }}
                   >
                     <i className="ti ti-x me-1"></i>
                     Xóa tất cả
                   </button>
                 </div>
               )}

               <div className="custom-datatable-filter table-responsive">
                   <table className="table datatable ">
                       <thead className="thead-light">
                           <tr>
                               <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                                   Họ và tên
                                   {sortField === 'fullName' && (
                                       <span style={{ marginLeft: 4 }}>
                                           {sortOrder === 'asc' ? '▲' : '▼'}
                                       </span>
                                   )}
                               </th>
                               <th style={{ cursor: 'pointer' }} onClick={handleSortByEmail}>
                                   Email
                                   {sortField === 'email' && (
                                       <span style={{ marginLeft: 4 }}>
                                           {sortOrder === 'asc' ? '▲' : '▼'}
                                       </span>
                                   )}
                               </th>
                               <th>Vai trò</th>
                               <th>Trạng thái</th>
                               <th>Hành động</th>
                           </tr>
                       </thead>
                       <tbody>
                           {loading && filteredUsers.length === 0 ? (
                               <tr>
                                   <td colSpan={6} className="text-center"><Spin /></td>
                               </tr>
                           ) : filteredUsers.length === 0 ? (
                               <tr>
                                   <td colSpan={6} className="text-center text-muted py-4">
                                       <div>
                                           <i className="ti ti-users" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                                           <p className="mb-0">Không có người dùng nào</p>
                                       </div>
                                   </td>
                               </tr>
                           ) : currentUsers.length === 0 ? (
                               <tr>
                                   <td colSpan={6} className="text-center text-muted py-4">
                                       <div>
                                           <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                                           <p className="mb-0">Không tìm thấy người dùng nào phù hợp</p>
                                       </div>
                                   </td>
                               </tr>
                           ) : (
                               currentUsers.map(user => (
                                   <tr key={user.id}>
                                       <td>
                                           <div className="d-flex align-items-center">
                                               <p className="avatar me-2 flex-shrink-0">
                                                   {user.avatar ? (
                                                    <img src={user.avatar} className="rounded-circle" alt="" />
                                                   ) : (
                                                    <div className="rounded-circle" style={{width: 32, height: 32, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888'}}>
                                                        {(user.fullName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                   )}
                                               </p>
                                               <h6><p className="fs-14 fw-semibold" style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                    {user.fullName && user.fullName.length > 18 
                                                        ? `${user.fullName.substring(0, 18)}...` 
                                                        : (user.fullName || "")}
                                                </p></h6>
                                           </div>
                                       </td>
                                       <td><p className="text-gray-9">{user.email}</p></td>
                                       <td>
                                           <div className="d-flex align-items-center">
                                               <div className={`role-icon me-2 ${getRoleIconClass(user.role)}`} style={{ 
                                                   width: '8px', 
                                                   height: '8px', 
                                                   borderRadius: '50%',
                                                   backgroundColor: getRoleColor(user.role)
                                               }}></div>
                                               <span className="fw-semibold" style={{ 
                                                   color: getRoleColor(user.role),
                                                   fontSize: '13px',
                                                   textTransform: 'uppercase',
                                                   letterSpacing: '0.5px'
                                               }}>
                                                   {roleNameMapping[roleMap[user.role]] || roleMap[user.role]}
                                               </span>
                                           </div>
                                       </td>
                                       <td>
                                           <span className={`badge ${getStatusBadgeClass(user.status)} text-dark`}>
                                               {user.status === 'ACTIVE' ? 'Hoạt động' : 
                                                user.status === 'INACTIVE' ? 'Không hoạt động' : 
                                                user.status === 'PENDING' ? 'Đang chờ' : 
                                                user.status}
                                           </span>
                                       </td>
                                       <td>
                                           <div className="d-flex align-items-center gap-2">
                                               {/* <button className="btn btn-sm btn-primary" onClick={() => handleEditUser(user)}>
                                                   <i className="ti ti-edit me-1"></i>Edit
                                               </button> */}
                                               {user.lockedReason ? (
                                                <Button className="management-action-btn" size="middle" onClick={() => handleUnlockUser(user)} style={{ marginRight: 8 }}>
                                                    <UnlockOutlined style={{ color: 'green', marginRight: 4 }} />Mở khóa
                                                </Button>
                                               ) : (
                                                <Button className="management-action-btn" size="middle" onClick={() => handleLockUser(user)} style={{ marginRight: 8 }}>
                                                    <LockOutlined style={{ color: 'red', marginRight: 4 }} />Khóa
                                                </Button>
                                               )}
                                                <Button className="management-action-btn" size="middle" onClick={() => navigate(`/admin/user-management/${user.id}`)}>
                                                     <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
                                                 </Button>
                                           </div>
                                       </td>
                                   </tr>
                               ))
                           )}
                       </tbody>
                   </table>


               </div>
               <div className="d-flex justify-content-between align-items-center mt-3">
                   <div className="d-flex align-items-center gap-3">
                       <div className="text-muted">
                           Hiển thị {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
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
                                       <h5 className="mb-0">Khóa người dùng</h5>
                                       <button type="button" className="btn-close" onClick={() => setShowLockModal(false)} aria-label="Close"></button>
                                   </div>
                                   <div className="modal-body pb-1">
                                       <div className="alert alert-warning">
                                           <i className="ti ti-alert-triangle me-2"></i>
                                           Bạn có chắc chắn muốn khóa người dùng:  <strong>{selectedUser?.fullName}</strong>?
                                       </div>
                                       <div className="mb-3">
                                           <label className="form-label">Lý do khóa<span className="text-danger">*</span></label>
                                           <textarea
                                               className="form-control"
                                               rows="3"
                                               value={lockReason}
                                               onChange={(e) => setLockReason(e.target.value)}
                                               placeholder="Hãy cung cấp lý do để khóa người dùng..."
                                               required
                                           />
                                       </div>
                                   </div>
                                   <div className="modal-footer">
                                       <div className="d-flex justify-content-end w-100">
                                           <button type="button" className="btn btn-light me-3" onClick={() => setShowLockModal(false)}>Hủy</button>
                                           <button type="submit" className="btn btn-danger">Xác nhận</button>
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
                                       <h5 className="mb-0">Mở khóa người dùng</h5>
                                       <button type="button" className="btn-close" onClick={() => setShowUnlockModal(false)} aria-label="Close"></button>
                                   </div>
                                   <div className="modal-body pb-1">
                                       <div className="alert alert-info">
                                           <i className="ti ti-info-circle me-2"></i>
                                           Bạn có chắc chắn muốn mở khóa người dùng: <strong>{selectedUser?.fullName}</strong>?
                                       </div>
                                   </div>
                                   <div className="modal-footer">
                                       <div className="d-flex justify-content-end w-100">
                                           <button type="button" className="btn btn-light me-3" onClick={() => setShowUnlockModal(false)}>Hủy</button>
                                           <button type="submit" className="btn btn-success">Xác nhận</button>
                                       </div>
                                   </div>
                               </form>
                           </div>
                       </div>
                   </div>
               )}


               {/* Modal View Detail */}
               {/* {showDetailModal && selectedUser && (
                   <Modal
                       open={showDetailModal}
                       onCancel={() => setShowDetailModal(false)}
                       footer={null}
                       title={null}
                       width={600}
                   >
                     <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32}}>
                       <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
                         <div style={{width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#888'}}>
                           {selectedUser.avatar ? (
                             <img
                               src={selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `${process.env.REACT_APP_API_URL || ''}${selectedUser.avatar}`}
                               alt="avatar"
                               style={{width: '100%', height: '100%', objectFit: 'cover'}}
                             />
                           ) : (
                             selectedUser.fullName ? selectedUser.fullName[0].toUpperCase() : <i className="ti ti-user"></i>
                           )}
                         </div>
                         <div style={{flex: 1}}>
                           <div style={{fontSize: 22, fontWeight: 600, marginBottom: 4}}>{selectedUser.fullName || "UNKNOWN"}</div>
                           <div style={{fontSize: 15, color: '#888', marginBottom: 2}}>{selectedUser.email || "-"}</div>
                           <div style={{fontSize: 13, color: '#888'}}>
                             <span style={{marginRight: 12}}><b>Status:</b> <span style={{color: selectedUser.status === 'ACTIVE' ? '#52c41a' : '#faad14'}}>{selectedUser.status}</span></span>
                             <span><b>Role:</b> {roleMap[selectedUser.role] || '-'}</span>
                           </div>
                         </div>
                       </div>
                       <div style={{borderTop: '1px solid #f0f0f0', marginBottom: 16}}></div>
                       <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                         <div>
                           <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Phone</div>
                           <div>{selectedUser.phone || '-'}</div>
                         </div>
                         <div>
                           <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>User Code</div>
                           <div>{selectedUser.userCode || '-'}</div>
                         </div>
                         <div style={{gridColumn: '1 / span 2'}}>
                           <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Address</div>
                           <div>{selectedUser.address ? [selectedUser.address.street, selectedUser.address.district, selectedUser.address.city].filter(Boolean).join(', ') : '-'}</div>
                         </div>
                         <div>
                           <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Phone Verified</div>
                           <div>{selectedUser.phoneVerified ? 'Yes' : 'No'}</div>
                         </div>
                         <div>
                           <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Email Verified</div>
                           <div>{selectedUser.emailVerified ? 'Yes' : 'No'}</div>
                         </div>
                         {selectedUser.lockedReason && (
                           <div style={{gridColumn: '1 / span 2', color: '#cf1322', background: '#fff1f0', borderRadius: 6, padding: 8, fontWeight: 500}}>
                             <b>Lock Reason:</b> {selectedUser.lockedReason}
                           </div>
                         )}
                         {selectedUser.verificationOTP && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Verification OTP</div>
                             <div>{selectedUser.verificationOTP}</div>
                           </div>
                         )}
                         {selectedUser.otpExpires && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>OTP Expires</div>
                             <div>{new Date(selectedUser.otpExpires).toLocaleString()}</div>
                           </div>
                         )}
                         {selectedUser.verificationCode && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Verification Code</div>
                             <div>{selectedUser.verificationCode}</div>
                           </div>
                         )}
                         {selectedUser.verificationCodeExpires && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Verification Code Expires</div>
                             <div>{new Date(selectedUser.verificationCodeExpires).toLocaleString()}</div>
                           </div>
                         )}
                         {selectedUser.pendingDeletionAt && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Pending Deletion At</div>
                             <div>{new Date(selectedUser.pendingDeletionAt).toLocaleString()}</div>
                           </div>
                         )}
                         {selectedUser.lastDeletionReminderSent && (
                           <div>
                             <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Last Deletion Reminder Sent</div>
                             <div>{new Date(selectedUser.lastDeletionReminderSent).toLocaleString()}</div>
                           </div>
                         )}
                       </div>
                     </div>
                   </Modal>
               )} */}
           </div>
       </div>
   );
};


export default UserManagement;

