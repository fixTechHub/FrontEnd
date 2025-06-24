import { Link } from 'react-router-dom';
import TechnicianStatus from '../../pages/technician-dashboard/TechnicianStatus';
import { useParams } from 'react-router-dom';

function TechnicianDashboard() {
    const { technicianId } = useParams();
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
                                            <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html">
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
                                                <i className="ti ti-calendar-bolt"></i><span>Calendar</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-file-symlink"></i><span>Quotations</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-mail"></i><span>Enquiries</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Manage</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-users-group"></i><span>Customers</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-file-invoice"></i><span>Invoices</span>
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
                                        <li>
                                            <a href="">
                                                <i className="ti ti-ban"></i><span>Error Page</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>UI Interface</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-pocket"></i><span>Components</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-database"></i><span>Forms</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-layout-navbar-expand"></i><span>Tables</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-layout-grid"></i><span>Icons</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="page-wrapper">
                    <div className="content pb-0">
                        {/* Breadcrumb */}
                        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                            <div className="my-auto mb-2">
                                <h4 className="mb-1">Dashboard</h4>
                                <nav>
                                    <ol className="breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <a href="">Home</a>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">Technician Dashboard</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="my-auto mb-2">
                                <h4 className="mb-1">Technician Status: </h4>
                                <TechnicianStatus technicianId={technicianId} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xl-8 d-flex flex-column">
                                {/* Welcome Wrap */}
                                <div className="card flex-fill">
                                    <div className="card-body">
                                        <div className="row align-items-center row-gap-3">
                                            <div className="col-sm-7">
                                                <h4 className="mb-1">Welcome, Andrew </h4>
                                                <p>400+ Budget Friendly Cars Available for the rents </p>
                                                <div className="d-flex align-items-center flex-wrap gap-4 mb-3">
                                                    <div>
                                                        <p className="mb-1">Total No of Cars</p>
                                                        <h3>564</h3>
                                                    </div>
                                                    <div>
                                                        <p className="d-flex align-items-center mb-2">
                                                            <span className="line-icon bg-violet me-2"></span>
                                                            <span className="fw-semibold text-gray-9 me-1">80</span>In Rental
                                                        </p>
                                                        <p className="d-flex align-items-center">
                                                            <span className="line-icon bg-orange me-2"></span>
                                                            <span className="fw-semibold text-gray-9 me-1">96</span> Upcoming
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                                    <a
                                                        href="https://dreamsrent.dreamstechnologies.com/html/template/admin/reservations.html"
                                                        className="btn btn-primary d-flex align-items-center"
                                                    >
                                                        <i className="ti ti-eye me-1"></i>Reservations
                                                    </a>
                                                    <a
                                                        href="https://dreamsrent.dreamstechnologies.com/html/template/admin/add-car.html"
                                                        className="btn btn-dark d-flex align-items-center"
                                                    >
                                                        <i className="ti ti-plus me-1"></i>Add New Car
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="col-sm-5">
                                                <img
                                                    src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/icons/car.svg"
                                                    alt="img"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Welcome Wrap */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>



        </>
    );
}

export default TechnicianDashboard;
