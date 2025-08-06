import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { useParams } from 'react-router-dom';
import Rating from 'react-rating';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import { Link } from 'react-router-dom';

function ViewTechnicianProfile() {
    const dispatch = useDispatch();
    const { profile, loading, error } = useSelector(state => state.technician);
    const technician  = useSelector((state) => state.auth);
    const  technicianId = technician.technician?._id ;
    
    useEffect(() => {
        if (technicianId) {
            console.log("Dispatching technicianId:", technicianId);
            dispatch(fetchTechnicianProfile(technicianId))
            .then((result) => {
                    console.log("=== PROFILE DEBUG ===");
                    console.log("Full result:", result);
                    console.log("Result payload:", result.payload);
                    console.log("Profile data:", profile);
                })
                .catch((err) => {
                    console.error("Error fetching profile:", err);
                });
        }
    }, [dispatch, technicianId]);
    console.log(technicianId);
    console.log("tech", technician);
    
    

    const certificates = Array.isArray(profile[1])
  ? profile[1].filter(item => item.status === 'APPROVED')
  : [];

    console.log("profile", profile);
    
    const user = technician?.user ?? {};
    
    
    const specialties = profile[0]?.specialtiesCategories ?? [];
    console.log(specialties);
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!profile) return <p>No profile data.</p>;

    return (
        <>
            <div class="main-wrapper">
                <Header />

                <BreadcrumbBar />

                <div className="dashboard-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="dashboard-menu">
                                    <ul>
                                        <li>
                                            <Link to={`/technician`}>
                                                <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} >
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>My Bookings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/techincian/feedback">
                                                <img src="/public/img/icons/review-icon.svg" alt="Icon" />
                                                <span>Reviews</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/user-wishlist">
                                                <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
                                                <span>Wishlist</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/user-messages">
                                                <img src="/public/img/icons/message-icon.svg" alt="Icon" />
                                                <span>Messages</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/deposit">
                                                <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                                                <span>My Wallet</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/earning`} >
                                                <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>My Earnings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/profile/${technicianId}`} className="active">
                                                <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
                                                <span>Settings</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container">

                        {/* Content Header */}
                        <div className="content-header content-settings-header">
                            <h4>Settings</h4>
                        </div>
                        {/* /Content Header */}

                        <div className="row">

                            {/* Settings Menu */}
                            <div className="col-lg-3 theiaStickySidebar">
                                <div className="settings-widget">
                                    <div className="settings-menu">
                                        <ul>
                                            <li>
                                                <a href="/user-settings.html" className="active">
                                                    <i className="feather-user"></i> Profile
                                                </a>
                                            </li>
                                            <li>
                                                <Link to={`/technician/${technicianId}/certificate`}>
                                                    <i className="feather-shield"></i>
                                                    <span>Certificates</span>
                                                </Link>
                                            </li>
                                            <li>
                                                <a href="/user-preferences.html">
                                                    <i className="feather-star"></i> Preferences
                                                </a>
                                            </li>
                                            <li>
                                                <a href="/user-notifications.html">
                                                    <i className="feather-bell"></i> Notifications
                                                </a>
                                            </li>
                                            <li>
                                                <a href="/user-integration.html">
                                                    <i className="feather-git-merge"></i> Integration
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* /Settings Menu */}

                            {/* Settings Details */}
                            <div className="col-lg-9">
                                <div className="settings-info">
                                    <div className="settings-sub-heading">
                                        <h4>Profile</h4>
                                    </div>
                                    <form>

                                        {/* Basic Info */}
                                        <div className="profile-info-grid">
                                            <div className="profile-info-header">
                                                <h5>Basic Information</h5>
                                                <p>Information about user</p>
                                            </div>
                                            <div className="profile-inner">
                                                <div className="profile-info-pic">
                                                    <div className="profile-info-img">
                                                        <img src={user?.avatar} alt="Profile" />
                                                        <div className="profile-edit-info">
                                                            <a href="/#">
                                                                <i className="feather-edit"></i>
                                                            </a>
                                                            <a href="/#">
                                                                <i className="feather-trash-2"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="profile-info-content">
                                                        <h6>Profile picture</h6>
                                                        <p>PNG, JPEG under 15 MB</p>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="profile-form-group">
                                                            <label>Full Name: {user?.fullName}</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="profile-form-group">
                                                            <label>Phone Number: {user?.phone}</label>

                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="profile-form-group">
                                                            <label>Email: {user?.email}</label>

                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Address: {user?.address?.street}, {user?.address?.district}, {user?.address?.city}</label>

                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                        {/* /Basic Info */}

                                        {/* Address Info */}
                                        <div className="profile-info-grid">
                                            <div className="profile-info-header">
                                                <h5>Job Information</h5>
                                                <p>Information about address of user</p>
                                            </div>
                                            <div className="profile-inner">
                                                <div className="row">

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Chuyên môn:
                                                                <ul>
                                                                    {specialties.map((spec) => (
                                                                        <li key={spec._id}>{spec.categoryName}</li>
                                                                    ))}
                                                                </ul></label>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Kinh nghiệm:  {technician?.experienceYears} năm</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Số job hoàn thành: {technician?.jobCompleted || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group " style={{ display: 'flex' }}>
                                                            <div>
                                                                <label>Đánh giá:</label>
                                                            </div>

                                                            <div className="review-rating">
                                                                <Rating
                                                                    initialRating={technician?.technician?.ratingAverage}
                                                                    readonly
                                                                    fullSymbol={<i className="fas fa-star filled"></i>}
                                                                    emptySymbol={<i className="far fa-star"></i>}
                                                                />
                                                                <span>({technician?.technician?.ratingAverage})</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Trạng thái: {technician?.status}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Khả dụng: {technician?.availability}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Số dư: {technician?.balance || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Tổng thu nhập: {technician?.totalEarning || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Tổng hoa hồng đã trả: {technician?.totalCommissionPaid || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Tổng giữ lại: {technician?.totalHoldingAmount || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Tổng đã rút: {technician?.totalWithdrawn || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Phí kiểm tra: {technician?.inspectionFee || 0}</label>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label>Ngày cập nhật giá: {technician?.pricesLastUpdatedAt ? new Date(technician.pricesLastUpdatedAt).toLocaleDateString() : 'Chưa cập nhật'}</label>
                                                        </div>
                                                    </div>

                                                    {technician?.note && (
                                                        <div className="col-md-12">
                                                            <div className="profile-form-group">
                                                                <label>Ghi chú: {technician.note}</label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-md-12">
                                                        <div className="profile-form-group">
                                                            <label>Chứng chỉ:</label>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                                                {certificates.map((cert) => (
                                                                    <div key={cert._id} style={{ textAlign: 'center' }}>
                                                                        <img
                                                                            src={cert.fileUrl}
                                                                            alt="certificate"
                                                                            style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 10, border: '1px solid #ccc' }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* /Address Info */}

                                    </form>
                                </div>
                            </div>
                            {/* /Settings Details */}

                        </div>
                    </div>
                </div>
            </div>
        </>

    )
};

export default ViewTechnicianProfile;
