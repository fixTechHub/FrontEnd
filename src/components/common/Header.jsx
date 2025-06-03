function Header() {
    return (
        <>
            <header className="header font-14">
                <div className="container-fluid">
                    <nav className="navbar navbar-expand-lg header-nav">
                        <div className="navbar-header">
                            <a id="mobile_btn" href="javascript:void(0);">
                                <span className="bar-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </a>
                            <a href="index.html" className="navbar-brand logo">
                                <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                            </a>
                            <a href="index.html" className="navbar-brand logo-small">
                                <img src="/img/logo-small-2.png" className="img-fluid" alt="Logo" />
                            </a>
                        </div>
                        <div className="main-menu-wrapper">
                            <div className="menu-header">
                                <a href="index.html" className="menu-logo">
                                    <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                                </a>
                                <a id="menu_close" className="menu-close" href="javascript:void(0);"> <i className="fas fa-times"></i></a>
                            </div>
                            <ul className="main-nav">
                                <li className="has-submenu megamenu active">
                                    <a href="index.html">TRANG CHỦ </a>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">DANH MỤC <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Danh mục 1</a>
                                            <ul className="submenu">
                                                <li><a href="user-dashboard.html">Dịch vụ 1</a></li>
                                                <li><a href="user-bookings.html">Dịch vụ 2</a></li>
                                                <li><a href="user-reviews.html">Reviews</a></li>
                                                <li><a href="user-wishlist.html">Wishlist</a></li>
                                                <li><a href="user-messages.html">Messages</a></li>
                                                <li><a href="user-wallet.html">My Wallet</a></li>
                                                <li><a href="user-payment.html">Payments</a></li>
                                                <li><a href="user-settings.html">Settings</a></li>
                                            </ul>
                                        </li>
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Danh mục 2</a>
                                            <ul className="submenu">
                                                <li><a href="admin/index.html">Dịch vụ 1</a></li>
                                                <li><a href="admin/reservations.html">Dịch vụ 2</a></li>
                                                <li><a href="admin/customers.html">Manage</a></li>
                                                <li><a href="admin/cars.html">Rentals</a></li>
                                                <li><a href="admin/invoices.html">Finance & Accounts</a></li>
                                                <li><a href="admin/coupons.html">Others</a></li>
                                                <li><a href="admin/pages.html">CMS</a></li>
                                                <li><a href="admin/contact-messages.html">Support</a></li>
                                                <li><a href="admin/users.html">User Management</a></li>
                                                <li><a href="admin/earnings-report.html">Reports</a></li>
                                                <li><a href="admin/profile-setting.html">Settings & Configuration</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">DIỄN ĐÀN </a>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">HỖ TRỢ </a>
                                </li>

                                {/* <li className="has-submenu">
                                    <a href="#">GIỚI THIỆU <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><a href="listing-grid.html">Listing Grid</a></li>
                                        <li><a href="listing-list.html">Listing List</a></li>
                                        <li><a href="listing-map.html">Listing With Map</a></li>
                                        <li><a href="listing-details.html">Listing Details</a></li>
                                    </ul>
                                </li> */}
                                <li className="login-link">
                                    <a href="/register">ĐĂNG KÝ</a>
                                </li>
                                <li className="login-link">
                                    <a href="/login">ĐĂNG NHẬP</a>
                                </li>
                            </ul>
                        </div>
                        <ul className="nav header-navbar-rht">
                            <li className="nav-item">
                                <a className="nav-link header-login" href="/register"><span><i className="fa-regular fa-user"></i></span>Đăng Ký</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link header-reg" href="/login"><span><i className="fa-solid fa-lock"></i></span>Đăng Nhập</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header;
