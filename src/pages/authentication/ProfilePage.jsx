import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfileThunk, updateProfileThunk, updateAvatarThunk, changePasswordThunk } from '../../features/auth/authSlice';
import Header from '../../components/common/Header';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaEdit, FaCamera, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import { BsPersonCircle } from 'react-icons/bs';
import { toast } from 'react-toastify';
import '../../styles/profile.css';

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-success';
        case 'PENDING':
            return 'bg-warning';
        case 'INACTIVE':
            return 'bg-secondary';
        case 'BLOCKED':
            return 'bg-danger';
        default:
            return 'bg-info';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'ACTIVE':
            return 'Hoạt động';
        case 'PENDING':
            return 'Đang xác thực';
        case 'INACTIVE':
            return 'Không hoạt động';
        case 'BLOCKED':
            return 'Đã khóa';
        default:
            return status;
    }
};

function ProfilePage() {
    const dispatch = useDispatch();
    const { profile, profileLoading, profileError, user, updateLoading } = useSelector(state => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        street: '',
        district: '',
        city: ''
    });
    const fileInputRef = useRef(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    console.log(user.fullName);

    useEffect(() => {
        dispatch(fetchUserProfileThunk());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            console.log('--- USER ---', user);
            
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                district: user.address?.district || '',
                city: user.address?.city || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Chỉ lấy những trường có giá trị để cập nhật
        const updateData = {};
        
        if (formData.fullName.trim()) {
            updateData.fullName = formData.fullName.trim();
        }
        
        if (formData.phone.trim()) {
            updateData.phone = formData.phone.trim();
        }

        // Chỉ cập nhật địa chỉ nếu có ít nhất một trường được nhập
        if (formData.street.trim() || formData.district.trim() || formData.city.trim()) {
            updateData.address = {
                street: formData.street.trim(),
                district: formData.district.trim(),
                city: formData.city.trim()
            };
        }

        try {
            await dispatch(updateProfileThunk(updateData)).unwrap();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            await dispatch(updateAvatarThunk(formData));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        // Kiểm tra độ dài mật khẩu mới
        if (passwordData.newPassword.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        try {
            await dispatch(changePasswordThunk({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })).unwrap();

            // Reset form và chuyển về tab profile
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setActiveTab('profile');
        } catch (error) {
            // Lỗi đã được xử lý trong thunk
            console.error('Error changing password:', error);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (profileLoading) return (
        <div className="content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (profileError) return (
        <div className="content">
            <div className="container-fluid">   
                <div className="alert alert-danger">
                    {profileError}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="breadcrumb-bar">
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-md-12 col-12">
                            <h2 className="breadcrumb-title">Thông tin cá nhân</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content">
                <div className="container">
                    <div className="row">
                        {/* Profile Sidebar */}
                        <div className="col-md-4 col-lg-3 col-xl-3 theiaStickySidebar">
                            <div className="profile-sidebar">
                                <div className="widget-profile pro-widget-content">
                                    <div className="profile-info-widget">
                                        <div className="profile-img">
                                            {user?.avatar ? (
                                                <img 
                                                    src={user.avatar} 
                                                    alt="User Avatar"
                                                    className="img-fluid"
                                                />
                                            ) : (
                                                <div className="default-avatar">
                                                    <BsPersonCircle />
                                                </div>
                                            )}
                                            <div className="avatar-edit" onClick={handleAvatarClick}>
                                                <FaCamera />
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleAvatarChange}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-det-info">
                                            <h3>{user?.fullName}</h3>
                                            <div className="user-type mb-3">
                                                <span className={`badge ${user?.role?.name === 'CUSTOMER' ? 'bg-success' : user?.role?.name === 'TECHNICIAN' ? 'bg-primary' : 'bg-warning'}`}>
                                                    {user?.role?.name === 'CUSTOMER' ? 'Khách hàng' : 
                                                     user?.role?.name === 'TECHNICIAN' ? 'Kỹ thuật viên' : 
                                                     user?.role?.name === 'ADMIN' ? 'Quản trị viên' :
                                                     user?.role?.name === 'PENDING' ? 'Chưa xác thực' : 
                                                     user?.role?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="dashboard-widget">
                                    <nav className="dashboard-menu">
                                        <ul>
                                            <li className={activeTab === 'profile' ? 'active' : ''}>
                                                <a onClick={() => {
                                                    setActiveTab('profile');
                                                    setIsEditing(false);
                                                }} style={{ cursor: 'pointer' }}>
                                                    <FaUser className="me-2" />
                                                    <span>Thông tin cá nhân</span>
                                                </a>
                                            </li>
                                            <li className={activeTab === 'password' ? 'active' : ''}>
                                                <a onClick={() => {
                                                    setActiveTab('password');
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }} style={{ cursor: 'pointer' }}>
                                                    <FaLock className="me-2" />
                                                    <span>Đổi mật khẩu</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-md-8 col-lg-9 col-xl-9">
                            {/* Profile Information Card */}
                            {activeTab === 'profile' && (
                            <div className="card">
                                <div className="card-body">
                                    <div className="profile-header">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="card-title">Thông tin chi tiết</h4>
                                            <button 
                                                className="btn btn-sm btn-primary"
                                                onClick={() => setIsEditing(!isEditing)}
                                                disabled={updateLoading}
                                            >
                                                <FaEdit className="me-1" />
                                                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                            </button>
                                        </div>
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleSubmit}>
                                                <div className="info-list">
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaUser className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Họ và tên</span>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaEnvelope className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Email</span>
                                                            <div className="d-flex align-items-center">
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    value={user?.email || ''}
                                                                    disabled
                                                                />
                                                                {user?.emailVerified && (
                                                                    <FaCheckCircle className="text-success ms-2" title="Đã xác thực" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaPhone className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Số điện thoại</span>
                                                            <div className="d-flex align-items-center">
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                    />
                                                                {user?.phoneVerified && (
                                                                    <FaCheckCircle className="text-success ms-2" title="Đã xác thực" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaMapMarkerAlt className="text-primary" />
                                                </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Địa chỉ</span>
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        name="street"
                                                        placeholder="Số nhà, tên đường"
                                                        value={formData.street}
                                                        onChange={handleInputChange}
                                                    />
                                                            <div className="row">
                                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="district"
                                                        placeholder="Quận/Huyện"
                                                        value={formData.district}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="city"
                                                        placeholder="Tỉnh/Thành phố"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <MdVerifiedUser className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Trạng thái</span>
                                                            <span className={`badge ${getStatusBadgeClass(user?.status)}`}>
                                                                {getStatusText(user?.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="info-item mt-3">
                                                        <div className="info-content">
                                                    <button 
                                                        type="submit" 
                                                        className="btn btn-primary me-2"
                                                        disabled={updateLoading}
                                                    >
                                                        {updateLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-secondary"
                                                                onClick={() => {
                                                                    setIsEditing(false);
                                                                    setFormData({
                                                                        fullName: user?.fullName || '',
                                                                        phone: user?.phone || '',
                                                                        street: user?.address?.street || '',
                                                                        district: user?.address?.district || '',
                                                                        city: user?.address?.city || ''
                                                                    });
                                                                }}
                                                        disabled={updateLoading}
                                                    >
                                                        Hủy
                                                    </button>
                                                        </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                            <div className="profile-information">
                                                <div className="info-list">
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaUser className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Họ và tên</span>
                                                            <span className="info-text">{user?.fullName || user?.data.fullName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaEnvelope className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Email</span>
                                                            <div className="d-flex align-items-center">
                                                                <span className="info-text me-2">{user?.email || 'Chưa cập nhật'}</span>
                                                                {user?.emailVerified ? (
                                                                    <FaCheckCircle className="text-success" title="Đã xác thực" />
                                                                ) : (
                                                                    <FaExclamationCircle className="text-warning" title="Chưa xác thực" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <FaPhone className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Số điện thoại</span>
                                                            <div className="d-flex align-items-center">
                                                                <span className="info-text me-2">{user?.phone || 'Chưa cập nhật'}</span>
                                                                {user?.phoneVerified ? (
                                                                    <FaCheckCircle className="text-success" title="Đã xác thực" />
                                                                ) : (
                                                                    <FaExclamationCircle className="text-warning" title="Chưa xác thực" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {user?.address && (
                                                        <div className="info-item">
                                                            <div className="info-icon">
                                                                <FaMapMarkerAlt className="text-primary" />
                                                            </div>
                                                            <div className="info-content">
                                                                <span className="info-label">Địa chỉ</span>
                                                                <span className="info-text">
                                                                    {`${user.address.street || ''}, ${user.address.district || ''}, ${user.address.city || ''}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="info-item">
                                                        <div className="info-icon">
                                                            <MdVerifiedUser className="text-primary" />
                                                        </div>
                                                        <div className="info-content">
                                                            <span className="info-label">Trạng thái</span>
                                                            <span className={`badge ${getStatusBadgeClass(user?.status)}`}>
                                                                {getStatusText(user?.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Password Change Section */}
                            {activeTab === 'password' && (
                                <div className="card">
                                    <div className="card-body">
                                        <div className="profile-header">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="card-title">Đổi mật khẩu</h4>
                                            </div>
                                        </div>

                                        <form onSubmit={handleChangePassword}>
                                            <div className="row">
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Mật khẩu hiện tại</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword.currentPassword ? "text" : "password"}
                                                            className="form-control"
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordChange}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
                                                            onClick={() => togglePasswordVisibility('currentPassword')}
                                                        >
                                                            {showPassword.currentPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Mật khẩu mới</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword.newPassword ? "text" : "password"}
                                                            className="form-control"
                                                            name="newPassword"
                                                            value={passwordData.newPassword}
                                                            onChange={handlePasswordChange}
                                                            minLength={8}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
                                                            onClick={() => togglePasswordVisibility('newPassword')}
                                                        >
                                                            {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Xác nhận mật khẩu mới</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword.confirmPassword ? "text" : "password"}
                                                            className="form-control"
                                                            name="confirmPassword"
                                                            value={passwordData.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
                                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                                        >
                                                            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <button 
                                                        type="submit" 
                                                        className="btn btn-primary me-2"
                                                        disabled={updateLoading}
                                                    >
                                                        {updateLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-secondary"
                                                        onClick={() => setActiveTab('profile')}
                                                        disabled={updateLoading}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage; 