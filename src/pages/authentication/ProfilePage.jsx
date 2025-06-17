import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfileThunk, updateProfileThunk, updateAvatarThunk } from '../../features/auth/authSlice';
import Header from '../../components/common/Header';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaEdit, FaCamera } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import { BsPersonCircle } from 'react-icons/bs';
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
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        street: '',
        district: '',
        city: ''
    });
    const fileInputRef = useRef(null);
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
        const userData = {
            fullName: formData.fullName,
            phone: formData.phone,
            address: {
                street: formData.street,
                district: formData.district,
                city: formData.city
            }
        };

        const result = await dispatch(updateProfileThunk(userData));
        if (updateProfileThunk.fulfilled.match(result)) {
            // Sửa lại để update thông tin
            const fetchResult = await dispatch(fetchUserProfileThunk());    
            if (!fetchResult.error) {
            // formData sẽ tự động được cập nhật từ useEffect([user])
            setIsEditing(false);
        }
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
                                            <li className="active">
                                                <a href="#">
                                                    <FaUser className="me-2" />
                                                    <span>Thông tin cá nhân</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        {/* Profile Content */}
                        <div className="col-md-8 col-lg-9 col-xl-9">
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
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Họ và tên</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Số điện thoại</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">Địa chỉ</label>
                                                        <input
                                                            type="text"
                                                            className="form-control mb-2"
                                                            name="street"
                                                            placeholder="Số nhà, tên đường"
                                                            value={formData.street}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="district"
                                                            placeholder="Quận/Huyện"
                                                            value={formData.district}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="city"
                                                            placeholder="Tỉnh/Thành phố"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="col-12">
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
                                                            onClick={() => setIsEditing(false)}
                                                            disabled={updateLoading}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            </form> 
                                        ) : (
                                            <div className="row">
                                                <div className="col-md-12">
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
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage; 