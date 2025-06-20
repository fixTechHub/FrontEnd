import "../../../public/css/style.css";
function Sidebar() {
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
            </div>
            
        </>
    )
}
export default Sidebar;