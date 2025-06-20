import { Link } from 'react-router-dom';
import TechnicianStatus from './TechnicianStatus';
import { useParams } from 'react-router-dom';

function TechnicianDashboard() {
    const { technicianId } = useParams();
    return (
        <>



            <div className="main-wrapper">
                <div className="sidebar" id="sidebar">
                    <div className="sidebar-inner slimscroll">
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
