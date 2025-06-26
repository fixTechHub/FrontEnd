import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTechnicianProfile } from '../../features/technician/technicianSlice';
import { useParams } from 'react-router-dom';
import Rating from 'react-rating';

function ViewTechnicianProfile() {
    const dispatch = useDispatch();
    const { technicianId } = useParams();

    const { profile, loading, error } = useSelector(state => state.technician);
    console.log("Profile:", profile, "Loading:", loading);

    useEffect(() => {
        if (technicianId) {
            console.log("Dispatching technicianId:", technicianId);
            dispatch(fetchTechnicianProfile(technicianId));
        } else {
            console.log("No technicianId available");
        }
    }, [dispatch, technicianId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!profile) return <p>No profile data.</p>;

    const technician = profile.technician;
    const certificates = profile.certificates;

    const user = technician.userId ?? {};  // fallback nếu userId chưa có
    const specialties = technician.specialtiesCategories ?? [];

    return (
        <>
            <div className="main-wrapper">
                <div className="header">
                    <div className="main-header">

                        <div className="header-left">
                            <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="logo">
                                <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo.svg" alt="Logo" />
                            </a>
                            <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="dark-logo">
                                <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-white.svg" alt="Logo" />
                            </a>
                        </div>

                        <a id="mobile_btn" className="mobile_btn" href="#sidebar">
                            <span className="bar-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </a>

                        <div className="header-user">
                            <div className="nav user-menu nav-list">

                                <div className="d-flex align-items-center header-icons">
                                    <div className="notification_item">
                                        <a href="javascript:void(0);" className="btn btn-menubar position-relative" id="notification_popup" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                            <i className="ti ti-bell"></i>
                                            <span className="badge bg-violet rounded-pill"></span>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end notification-dropdown">
                                            <div className="topnav-dropdown-header pb-0">
                                                <h5 className="notification-title">Notifications</h5>
                                                <ul className="nav nav-tabs nav-tabs-bottom">
                                                    <li className="nav-item">
                                                        <a className="nav-link active" href="#active-notification" data-bs-toggle="tab">
                                                            Active<span className="badge badge-xs rounded-pill bg-danger ms-2">5</span>
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" href="#unread-notification" data-bs-toggle="tab">Unread</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" href="#archieve-notification" data-bs-toggle="tab">Archieve</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="noti-content">
                                                <div className="tab-content">
                                                    <div className="tab-pane fade show active" id="active-notification">
                                                        <div className="notification-list">
                                                            <div className="d-flex align-items-center">
                                                                <a href="javascript:void(0);" className="avatar avatar-lg offline me-2 flex-shrink-0">
                                                                    <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-02.jpg" alt="Profile" className="rounded-circle" />
                                                                </a>
                                                                <div className="flex-grow-1">
                                                                    <p className="mb-1">
                                                                        <a href="javascript:void(0);">
                                                                            <span className="text-gray-9">Jerry Manas</span> Added New Task Creating <span className="text-gray-9">Login Pages</span>
                                                                        </a>
                                                                    </p>
                                                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>4 Min Ago</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Các phần tử notification-list tiếp theo giữ nguyên */}
                                                    </div>
                                                    <div className="tab-pane fade" id="unread-notification">
                                                        <div className="notification-list">
                                                            <a href="javascript:void(0);">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="avatar avatar-lg offline me-2 flex-shrink-0">
                                                                        <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-02.jpg" alt="Profile" className="rounded-circle" />
                                                                    </span>
                                                                    <div className="flex-grow-1">
                                                                        <p className="mb-1">
                                                                            <span className="text-gray-9">Jerry Manas</span> Added New Task Creating <span className="text-gray-9">Login Pages</span>
                                                                        </p>
                                                                        <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>4 Min Ago</span>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        </div>
                                                        {/* Các phần tử notification-list tiếp theo giữ nguyên */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between topnav-dropdown-footer">
                                                <div className="d-flex align-items-center">
                                                    <a href="javascript:void(0);" className="link-primary text-decoration-underline me-3">Mark all as Read</a>
                                                    <a href="javascript:void(0);" className="link-danger text-decoration-underline">Clear All</a>
                                                </div>
                                                <a href="javascript:void(0);" className="btn btn-primary btn-sm d-inline-flex align-items-center">
                                                    View All Notifications<i className="ti ti-chevron-right ms-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dropdown profile-dropdown">
                                        <a href="javascript:void(0);" className="d-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                            <span className="avatar avatar-sm">
                                                <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-05.jpg" alt="Img" className="img-fluid rounded-circle" />
                                            </span>
                                        </a>
                                        <div className="dropdown-menu">
                                            <div className="profileset d-flex align-items-center">
                                                <span className="user-img me-2">
                                                    <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-05.jpg" alt="Profile" />
                                                </span>
                                                <div>
                                                    <h6 className="fw-semibold mb-1">Andrew Simmonds</h6>
                                                    <p className="fs-13">
                                                        <a href="https://dreamsrent.dreamstechnologies.com/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="0869666c7a6d7f486d70696578646d266b6765">[email&#160;protected]</a>
                                                    </p>
                                                </div>
                                            </div>
                                            <a className="dropdown-item d-flex align-items-center" href="https://dreamsrent.dreamstechnologies.com/html/template/admin/profile-setting.html">
                                                <i className="ti ti-user-edit me-2"></i>Edit Profile
                                            </a>
                                            <a className="dropdown-item d-flex align-items-center" href="https://dreamsrent.dreamstechnologies.com/html/template/admin/payments.html">
                                                <i className="ti ti-credit-card me-2"></i>Payments
                                            </a>
                                            <div className="dropdown-divider my-2"></div>
                                            <div className="dropdown-item">
                                                <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between">
                                                    <label className="form-check-label" htmlFor="notify">
                                                        <i className="ti ti-bell me-2"></i>Notificaions
                                                    </label>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="notify" defaultChecked />
                                                </div>
                                            </div>
                                            <a className="dropdown-item d-flex align-items-center" href="https://dreamsrent.dreamstechnologies.com/html/template/admin/security-setting.html">
                                                <i className="ti ti-exchange me-2"></i>Change Password
                                            </a>
                                            <a className="dropdown-item d-flex align-items-center" href="https://dreamsrent.dreamstechnologies.com/html/template/admin/profile-setting.html">
                                                <i className="ti ti-settings me-2"></i>Settings
                                            </a>
                                            <div className="dropdown-divider my-2"></div>
                                            <a className="dropdown-item logout d-flex align-items-center justify-content-between" href="https://dreamsrent.dreamstechnologies.com/html/template/admin/login.html">
                                                <span><i className="ti ti-logout me-2"></i>Logout Account</span>
                                                <i className="ti ti-chevron-right"></i>
                                            </a>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                <div className="sidebar" id="sidebar">
                    <div className="sidebar-logo">
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="logo logo-normal">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo.svg" alt="Logo" />
                        </a>
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="logo-small">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-small.svg" alt="Logo" />
                        </a>
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="dark-logo">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-white.svg" alt="Logo" />
                        </a>
                    </div>

                    <div className="sidebar-inner slimscroll overflow-auto" style={{ maxHeight: '100vh' }}>
                        <div id="sidebar-menu" className="sidebar-menu">
                            <div className="form-group">
                                <div className="input-group input-group-flat d-inline-flex">
                                    <span className="input-icon-addon">
                                        <i className="ti ti-search"></i>
                                    </span>
                                    <input type="text" className="form-control" placeholder="Search" />
                                    <span className="group-text">
                                        <i className="ti ti-command"></i>
                                    </span>
                                </div>
                            </div>
                            <ul>
                                <li className="menu-title"><span>Main</span></li>
                                <li>
                                    <ul>
                                        <li className="active">
                                            <a href="">
                                                <i className="ti ti-layout-dashboard"></i><span>Dashboard</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Bookings</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-files"></i><span>Reservations</span><span className="track-icon"></span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-calendar-bolt"></i><span>Work</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Manage</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-users-group"></i><span>Account</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-star"></i><span>Reviews</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                                <li>
                                    <ul>
                                        <li >
                                            <a href={`/technician/${technicianId}/earning`}>
                                                <i className="ti ti-file-invoice"></i><span>Earnings</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-credit-card"></i><span>Payments</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>OTHERS</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/chat.html">
                                                <i className="ti ti-message"></i><span>Messages</span><span className="count">5</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-bell"></i><span>Notifications</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-flag"></i><span>Reports</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-settings"></i><span>Settings</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Pages</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-lock"></i><span>Login</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-user"></i><span>Register</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-circle-check"></i><span>Forgot Password</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-file-invoice"></i><span>Verification</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="page-wrapper">
                    <div class="content me-0 pb-0">
                        <div class="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="border-bottom mb-3 pb-3">
                                            <h5>Basic Details</h5>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-lg me-3">
                                                    <img src="assets/img/customer/customer-01.jpg" alt="img" />
                                                </span>
                                                <div>
                                                    <h6 className="mb-1"> {user?.fullName}</h6>
                                                    <div className="d-flex align-items-center">
                                                        <p className="mb-0 me-2">Added On : 15 May 2025</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap gap-3">
                                                <span className="badge badge-md bg-info-transparent">
                                                    License Number : ABC123456
                                                </span>
                                                <span className="badge badge-md bg-orange-transparent">
                                                    Valid Till : 20 Feb 2027
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-4 mb-xl-0">
                                    <div className="card-header py-0">
                                        <ul className="nav nav-tabs nav-tabs-bottom tab-dark">
                                            <li className="nav-item">
                                                <a className="nav-link active" href="#car-info" data-bs-toggle="tab">
                                                    Overview
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="#car-price" data-bs-toggle="tab">
                                                    Recent Rents
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="#car-service" data-bs-toggle="tab">
                                                    History
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body">
                                        <div className="tab-content">

                                            {/* Overview */}
                                            <div className="tab-pane fade active show" id="car-info">
                                                <div className="border-bottom mb-3 pb-3">
                                                    <div className="row">
                                                        <div className="col-md-4 col-sm-6">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Date of Birth</h6>
                                                                <p className="fs-13">22 Jan 2020</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 col-sm-6">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Gender</h6>
                                                                <p className="fs-13">Male</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 col-sm-6">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Chuyên môn:</h6>
                                                                <label>
                                                                    <ul>
                                                                        {specialties.map((spec) => (
                                                                            <li key={spec._id}>{spec.categoryName}</li>
                                                                        ))}
                                                                    </ul></label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 col-sm-6">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Phone Number</h6>
                                                                <label className="fs-13">{user?.phone}</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 col-sm-6">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Email</h6>
                                                                <label className='fs-13'> {user?.email}</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                            <div className="mb-3">
                                                                <h6 className="fs-14 fw-semibold mb-1">Address</h6>
                                                                <label> {user?.address?.street}, {user?.address?.district}, {user?.address?.city}</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <a href="#" className="link-violet text-decoration-underline fw-medium" data-bs-toggle="modal" data-bs-target="#edit_client">Edit</a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                                        <h6>Documents</h6>
                                                        <a href="#" className="link-default"><i className="ti ti-edit"></i></a>
                                                    </div>
                                                    <div className="d-flex align-items-center flex-wrap gap-4">
                                                        <div className="d-flex align-items-center">
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
                                    <div className="tab-pane fade" id="car-service">
                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">24</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Return Day</h6>
                                                    <span className="fs-13">12:45 PM</span>
                                                </div>
                                                <span className="fs-13">Return of keys and completion of the return process.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">24</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Return Day</h6>
                                                    <span className="fs-13">12:30 PM</span>
                                                </div>
                                                <span className="fs-13">Fuel check and final inspection.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">24</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Return Day</h6>
                                                    <span className="fs-13">12:15 PM</span>
                                                </div>
                                                <span className="fs-13">Vehicle inspection for any damages or missing items.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">24</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Return Day</h6>
                                                    <span className="fs-13">12:00 PM</span>
                                                </div>
                                                <span className="fs-13">Customer arrives at Cityville Airport, 567 Airport Rd, Cityville for car return.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">23</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Pick-Up Day</h6>
                                                    <span className="fs-13">9:45 AM</span>
                                                </div>
                                                <span className="fs-13">Departure from rental location.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">23</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Pick-Up Day</h6>
                                                    <span className="fs-13">9:30 AM</span>
                                                </div>
                                                <span className="fs-13">Customer receives the keys for a Toyota Corolla, completes payment for the rental.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-2 pb-2 border-bottom">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">23</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Pick-Up Day</h6>
                                                    <span className="fs-13">9:15 AM</span>
                                                </div>
                                                <span className="fs-13">Vehicle inspection and contract signing.</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center flex-wrap row-gap-3">
                                            <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                                                <h5 className="mb-2">23</h5>
                                                <span className="fw-medium fs-12 bg-primary-transparent p-1 d-inline-block rounded-1 text-gray-9">Feb, 2025</span>
                                            </div>
                                            <div className="flex-fill">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="fs-14 fw-semibold">Pick-Up Day</h6>
                                                    <span className="fs-13">9:00 AM</span>
                                                </div>
                                                <span className="fs-13">Customer arrives at Downtown Rental Center, 123 Main St, Cityville.</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewTechnicianProfile;
