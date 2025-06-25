import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [roles, setRoles] = useState([]);

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
        } catch (err) {
            message.error('Failed to load roles.');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [dispatch]);

    const handleEditUser = (user) => {
        console.log('User edit:', user);
        console.log('Roles at edit:', roles);
        setSelectedUser(user);
        setFormData({
            ...user,
            password: '',
            confirmPassword: ''
        });
        setShowEditModal(true);
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
            if (showEditModal) {
                const { confirmPassword, id, ...userData } = formData;
                if (!userData.password) {
                    delete userData.password;
                }
                await userAPI.update(selectedUser.id, { ...userData, role: formData.role, status: formData.status });
                message.success('User updated successfully!');
            }
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

    if (showEditModal) {
        console.log('formData.role:', formData.role);
        console.log('roles:', roles);
    }

    return (
        <div className="page-wrapper">
            <div className="content me-4">
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

                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
                    <div className="d-flex align-items-center flex-wrap row-gap-3">
                        {/* Filter and Sort controls can be added here if needed */}
                    </div>
                    <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                        <div className="top-search me-2">
                            <div className="top-search-group">
                                <span className="input-icon">
                                    <i className="ti ti-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search" 
                                    value={search}
                                    onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="custom-datatable-filter table-responsive">
                    <table className="table datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>USER</th>
                                <th>PHONE</th>
                                <th>EMAIL</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <a href="#!" onClick={e => e.preventDefault()} className="avatar me-2 flex-shrink-0">
                                                <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="rounded-circle" alt="" />
                                            </a>
                                            <h6><a href="#!" onClick={e => e.preventDefault()} className="fs-14 fw-semibold">{user.fullName}</a></h6>
                                        </div>
                                    </td>
                                    <td><p className="text-gray-9">{user.phone}</p></td>
                                    <td><p className="text-gray-9">{user.email}</p></td>
                                    <td><p className="text-gray-9">{user.role}</p></td>
                                    <td>
                                        <span className={`badge ${user.status === 'ACTIVE' ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                                            <i className={`ti ti-point-filled ${user.status === 'ACTIVE' ? 'text-success' : 'text-danger'} me-1`}></i>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="dropdown">
                                            <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="ti ti-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end p-2">
                                                <li>
                                                    <button className="dropdown-item rounded-1" onClick={() => handleEditUser(user)}><i className="ti ti-edit me-1"></i>Edit</button>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer"></div>
            </div>

            {/* Modals */}
            {showEditModal && (
                 <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="mb-0">Edit User</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body pb-1">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                                <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Email <span className="text-danger">*</span></label>
                                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Phone Number</label>
                                                <input type="text" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
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
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Status <span className="text-danger">*</span></label>
                                                <select name="status" className="form-select" value={formData.status} onChange={handleChange} required>
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">New Password</label>
                                                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Confirm New Password</label>
                                                <input type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} />
                                            </div>
                                        </div>
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
            
            <div className="footer d-sm-flex align-items-center justify-content-between bg-white p-3">
                <p className="mb-0">
                    <a href="#!">Privacy Policy</a>
                    <a href="#!" className="ms-4">Terms of Use</a>
                </p>
                <p>&copy; 2025 Fix Tech, Made with <span className="text-danger">❤</span> by <a href="#!" className="text-secondary">Fix Tech Team</a></p>
            </div>
        </div>
    );
};

export default UserManagement; 