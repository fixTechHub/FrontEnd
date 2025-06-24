function Navbar() {
    return (
        <>
            <header className="header">
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
                                    <a href="index.html">Home <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu mega-submenu">
                                        <li>
                                            <div className="megamenu-wrapper">
                                                <div className="row">
                                                    <div className="col-lg-3">
                                                        <div className="single-demo">
                                                            <div className="demo-img">
                                                                <a href="index.html">
                                                                    <img src="/img/menu/home-01.svg" className="img-fluid" alt="img" />
                                                                </a>
                                                            </div>
                                                            <div className="demo-info">
                                                                <a href="index.html">Car Rental<span className="new">New</span> </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="single-demo">
                                                            <div className="demo-img">
                                                                <a href="index-2.html">
                                                                    <img src="/img/menu/home-02.svg" className="img-fluid" alt="img" />
                                                                </a>
                                                            </div>
                                                            <div className="demo-info">
                                                                <a href="index-2.html">Car Rental 1<span className="hot">Hot</span> </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="single-demo">
                                                            <div className="demo-img">
                                                                <a href="index-3.html">
                                                                    <img src="/img/menu/home-03.svg" className="img-fluid" alt="img" />
                                                                </a>
                                                            </div>
                                                            <div className="demo-info">
                                                                <a href="index-3.html">Bike Rental<span className="new">New</span> </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="single-demo">
                                                            <div className="demo-img">
                                                                <a href="index-4.html">
                                                                    <img src="/img/menu/home-04.svg" className="img-fluid" alt="img" />
                                                                </a>
                                                            </div>
                                                            <div className="demo-info">
                                                                <a href="index-4.html">Yacht Rental<span className="new">New</span> </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </li>
                                <li className="has-submenu">
                                    <a href="#">Listings <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><a href="listing-grid.html">Listing Grid</a></li>
                                        <li><a href="listing-list.html">Listing List</a></li>
                                        <li><a href="listing-map.html">Listing With Map</a></li>
                                        <li><a href="listing-details.html">Listing Details</a></li>
                                    </ul>
                                </li>
                                <li className="has-submenu">
                                    <a href="#">Pages <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><a href="about-us.html">About Us</a></li>
                                        <li><a href="contact-us.html">Contact</a></li>
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Authentication</a>
                                            <ul className="submenu">
                                                <li><a href="register.html">Sign Up</a></li>
                                                <li><a href="login.html">Sign In</a></li>
                                                <li><a href="forgot-password.html">Forgot Password</a></li>
                                                <li><a href="reset-password.html">Reset Password</a></li>
                                            </ul>
                                        </li>
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Booking</a>
                                            <ul className="submenu">
                                                <li><a href="booking-checkout.html">Booking Checkout</a></li>
                                                <li><a href="booking.html">Booking</a></li>
                                                <li><a href="invoice-details.html">Invoice Details</a></li>
                                            </ul>
                                        </li>
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Error Page</a>
                                            <ul className="submenu">
                                                <li><a href="error-404.html">404 Error</a></li>
                                                <li><a href="error-500.html">500 Error</a></li>
                                            </ul>
                                        </li>
                                        <li><a href="pricing.html">Pricing</a></li>
                                        <li><a href="faq.html">FAQ</a></li>
                                        <li><a href="gallery.html">Gallery</a></li>
                                        <li><a href="our-team.html">Our Team</a></li>
                                        <li><a href="testimonial.html">Testimonials</a></li>
                                        <li><a href="terms-condition.html">Terms & Conditions</a></li>
                                        <li><a href="privacy-policy.html">Privacy Policy</a></li>
                                        <li><a href="maintenance.html">Maintenance</a></li>
                                        <li><a href="coming-soon.html">Coming Soon</a></li>
                                    </ul>
                                </li>
                                <li className="has-submenu">
                                    <a href="#">Blog <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><a href="blog-list.html">Blog List</a></li>
                                        <li><a href="blog-grid.html">Blog Grid</a></li>
                                        <li><a href="blog-details.html">Blog Details</a></li>
                                    </ul>
                                </li>
                                <li className="has-submenu">
                                    <a href="#">Dashboard <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">User Dashboard</a>
                                            <ul className="submenu">
                                                <li><a href="user-dashboard.html">Dashboard</a></li>
                                                <li><a href="user-bookings.html">My Bookings</a></li>
                                                <li><a href="user-reviews.html">Reviews</a></li>
                                                <li><a href="user-wishlist.html">Wishlist</a></li>
                                                <li><a href="user-messages.html">Messages</a></li>
                                                <li><a href="user-wallet.html">My Wallet</a></li>
                                                <li><a href="user-payment.html">Payments</a></li>
                                                <li><a href="user-settings.html">Settings</a></li>
                                            </ul>
                                        </li>
                                        <li className="has-submenu">
                                            <a href="javascript:void(0);">Admin Dashboard</a>
                                            <ul className="submenu">
                                                <li><a href="admin/index.html">Dashboard</a></li>
                                                <li><a href="admin/reservations.html">Bookings</a></li>
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
                                <li className="login-link">
                                    <a href="register.html">Sign Up</a>
                                </li>
                                <li className="login-link">
                                    <a href="login.html">Sign In</a>
                                </li>
                            </ul>
                        </div>
                        <ul className="nav header-navbar-rht">
                            <li className="nav-item">
                                <a className="nav-link header-login" href="login.html"><span><i className="fa-regular fa-user"></i></span>Sign In</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link header-reg" href="register.html"><span><i className="fa-solid fa-lock"></i></span>Sign Up</a>
                            </li>
                        </ul>
                    </nav>
                </div>

                Categories if needed
                {/* owl carousel item */}
                <div className="listing-owl-item">
                    <div className="listing-owl-group">
                        <div className="listing-owl-img">
                            <img src="/img/cars/mp-vehicle-01.svg" className="img-fluid" alt="Popular Cartypes" />
                        </div>
                        <h6>Crossover</h6>
                        <p>35 Cars</p>
                    </div>
                </div>
                {/* /owl carousel item */}

                {/* owl carousel item */}
                <div className="listing-owl-item">
                    <div className="listing-owl-group">
                        <div className="listing-owl-img">
                            <img src="/img/cars/mp-vehicle-02.svg" className="img-fluid" alt="Popular Cartypes" />
                        </div>
                        <h6>Sports Coupe</h6>
                        <p>45 Cars</p>
                    </div>
                </div>
                {/* /owl carousel item */}

                {/* owl carousel item */}
                <div className="listing-owl-item">
                    <div className="listing-owl-group">
                        <div className="listing-owl-img">
                            <img src="/img/cars/mp-vehicle-03.svg" className="img-fluid" alt="Popular Cartypes" />
                        </div>
                        <h6>Sedan</h6>
                        <p>15 Cars</p>
                    </div>
                </div>
                {/* /owl carousel item */}

                {/* owl carousel item */}
                <div className="listing-owl-item">
                    <div className="listing-owl-group">
                        <div className="listing-owl-img">
                            <img src="/img/cars/mp-vehicle-04.svg" className="img-fluid" alt="Popular Cartypes" />
                        </div>
                        <h6>Pickup</h6>
                        <p>17 Cars</p>
                    </div>
                </div>
                {/* /owl carousel item */}

                {/* owl carousel item */}
                <div className="listing-owl-item">
                    <div className="listing-owl-group">
                        <div className="listing-owl-img">
                            <img src="/img/cars/mp-vehicle-05.svg" className="img-fluid" alt="Popular Cartypes" />
                        </div>
                        <h6>Family MPV</h6>
                        <p>24 Cars</p>
                    </div>
                </div>
                {/* /owl carousel item */}
            </header>
        </>
    )
}

export default Navbar;
