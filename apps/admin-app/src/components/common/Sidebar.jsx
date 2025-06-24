import "../../../public/css/style.css";
function Sidebar() {
    return (
        <>
            <div className="main-wrapper">
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
                                        <li>
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
                                        <li className="active">
                                            <a href="">
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
            </div>

        </>
    )
}
export default Sidebar;