function HomePage() {
    return (
        <>
            <div className="main-wrapper">
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
                                    <img src="/img/logo.svg" className="img-fluid" alt="Logo" />
                                </a>
                                <a href="index.html" className="navbar-brand logo-small">
                                    <img src="/img/logo-small.png" className="img-fluid" alt="Logo" />
                                </a>
                            </div>
                            <div className="main-menu-wrapper">
                                <div className="menu-header">
                                    <a href="index.html" className="menu-logo">
                                        <img src="/img/logo.svg" className="img-fluid" alt="Logo" />
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
                </header>

                <section className="banner-section banner-slider">
                    <div className="container">
                        <div className="home-banner">
                            <div className="row align-items-center">
                                <div className="col-lg-6" data-aos="fade-down">
                                    <p className="explore-text">
                                        <span>
                                            <i className="fa-solid fa-thumbs-up me-2"></i>
                                        </span>
                                        100% Trusted car rental platform in the World
                                    </p>
                                    <h1>
                                        <span>Find Your Best</span> <br />
                                        Dream Car for Rental
                                    </h1>
                                    <p>
                                        Experience the ultimate in comfort, performance, and
                                        sophistication with our luxury car rentals. From sleek sedans
                                        and stylish coupes to spacious SUVs and elegant convertibles, we
                                        offer a range of premium vehicles to suit your preferences and
                                        lifestyle.
                                    </p>
                                    <div className="view-all">
                                        <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
                                            View all Cars{" "}
                                            <span>
                                                <i className="feather-arrow-right ms-2"></i>
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-6" >
                                    <div className="banner-imgs" data-aos="fade-down">
                                        <img src="/img/car-right.png" className="img-fluid aos" alt="bannerimage" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="section-search">
                    <div className="container">
                        <div className="search-box-banner">
                            <form action="https://dreamsrent.dreamstechnologies.com/html/template/listing-grid.html">
                                <ul className="align-items-center">
                                    <li className="column-group-main">
                                        <div className="input-block">
                                            <label>Pickup Location</label>
                                            <div className="group-img">
                                                <input type="text" className="form-control" placeholder="Enter City, Airport, or Address" />
                                                <span>
                                                    <i className="feather-map-pin"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="column-group-main">
                                        <div className="input-block">
                                            <label>Pickup Date</label>
                                        </div>
                                        <div className="input-block-wrapp">
                                            <div className="input-block date-widget">
                                                <div className="group-img">
                                                    <input type="text" className="form-control datetimepicker" placeholder="04/11/2023" />
                                                    <span>
                                                        <i className="feather-calendar"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="input-block time-widge">
                                                <div className="group-img">
                                                    <input type="text" className="form-control timepicker" placeholder="11:00 AM" />
                                                    <span>
                                                        <i className="feather-clock"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="column-group-main">
                                        <div className="input-block">
                                            <label>Return Date</label>
                                        </div>
                                        <div className="input-block-wrapp">
                                            <div className="input-block date-widge">
                                                <div className="group-img">
                                                    <input type="text" className="form-control datetimepicker" placeholder="04/11/2023" />
                                                    <span>
                                                        <i className="feather-calendar"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="input-block time-widge">
                                                <div className="group-img">
                                                    <input type="text" className="form-control timepicker" placeholder="11:00 AM" />
                                                    <span>
                                                        <i className="feather-clock"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="column-group-last">
                                        <div className="input-block">
                                            <div className="search-btn">
                                                <button className="btn search-button" type="submit">
                                                    <i className="fa fa-search" aria-hidden="true"></i>Search
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </form>
                        </div>
                    </div>
                </div>

                <section className="section services">
                    <div className="service-right">
                        <img src="/img/bg/service-right.svg" className="img-fluid" alt="services right" />
                    </div>
                    <div className="container">
                        {/* Heading title */}
                        <div className="section-heading" data-aos="fade-down">
                            <h2>How It Works</h2>
                            <p>Booking a car rental is a straightforward process that typically involves the following steps</p>
                        </div>
                        {/* /Heading title */}
                        <div className="services-work">
                            <div className="row">
                                <div className="col-lg-4 col-md-4 col-12 d-flex" data-aos="fade-down">
                                    <div className="services-group service-date flex-fill">
                                        <div className="services-icon border-secondary">
                                            <img className="icon-img bg-secondary" src="/img/icons/services-icon-01.svg" alt="Choose Locations" />
                                        </div>
                                        <div className="services-content">
                                            <h3>1. Choose Date & Locations</h3>
                                            <p>
                                                Determine the date & location for your car rental. Consider factors such as your travel itinerary,
                                                pickup/drop-off locations (e.g., airport, city center), and duration of rental.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-12 d-flex" data-aos="fade-down">
                                    <div className="services-group service-loc flex-fill">
                                        <div className="services-icon border-warning">
                                            <img className="icon-img bg-warning" src="/img/icons/services-icon-02.svg" alt="Choose Locations" />
                                        </div>
                                        <div className="services-content">
                                            <h3>2. Pick-Up Locations</h3>
                                            <p>
                                                Check the availability of your desired vehicle type for your chosen dates and location. Ensure that the
                                                rental rates, taxes, fees, and any additional charges.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-12 d-flex" data-aos="fade-down">
                                    <div className="services-group service-book flex-fill">
                                        <div className="services-icon border-dark">
                                            <img className="icon-img bg-dark" src="/img/icons/services-icon-03.svg" alt="Choose Locations" />
                                        </div>
                                        <div className="services-content">
                                            <h3>3. Book your Car</h3>
                                            <p>
                                                Once you've found a car rental option, proceed to make a reservation. Provide the required information,
                                                including your details, driver's license, contact info, and payment details.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section popular-car-type">
                    <div className="container">
                        {/* Heading title */}
                        <div className="section-heading" data-aos="fade-down">
                            <h2>Most Popular Cartypes</h2>
                            <p>Most popular worldwide Car Category due to their reliability, affordability, and features.</p>
                        </div>
                        {/* /Heading title */}
                        <div className="row">
                            <div className="popular-slider-group">
                                <div className="owl-carousel popular-cartype-slider owl-theme">
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
                                </div>
                            </div>
                        </div>
                        {/* View More */}
                        <div className="view-all text-center" data-aos="fade-down" data-aos-anchor-placement="top-bottom">
                            <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
                                View all Cars
                                <span>
                                    <i className="feather-arrow-right ms-2"></i>
                                </span>
                            </a>
                        </div>
                        {/* View More */}
                    </div>
                </section>

                <section className="section facts-number">
                    <div className="facts-left">
                        <img src="/img/bg/facts-left.png" className="img-fluid" alt="facts left" />
                    </div>
                    <div className="facts-right">
                        <img src="/img/bg/facts-right.png" className="img-fluid" alt="facts right" />
                    </div>
                    <div className="container">
                        {/* Heading title */}
                        <div className="section-heading" data-aos="fade-down">
                            <h2 className="title text-white">Facts By The Numbers</h2>
                            <p className="description">Here are some dreamsrent interesting facts presented by the numbers</p>
                        </div>
                        {/* /Heading title */}
                        <div className="counter-group">
                            <div className="row">
                                <div className="col-lg-3 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="count-group flex-fill">
                                        <div className="customer-count d-flex align-items-center">
                                            <div className="count-img">
                                                <img src="/img/icons/bx-heart.svg" alt="Icon" />
                                            </div>
                                            <div className="count-content">
                                                <h4>
                                                    <span className="counterUp">16</span>K+
                                                </h4>
                                                <p>Happy Customers</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="count-group flex-fill">
                                        <div className="customer-count d-flex align-items-center">
                                            <div className="count-img">
                                                <img src="/img/icons/bx-car.svg" alt="Icon" />
                                            </div>
                                            <div className="count-content">
                                                <h4>
                                                    <span className="counterUp">2547</span>+
                                                </h4>
                                                <p>Count of Cars</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="count-group flex-fill">
                                        <div className="customer-count d-flex align-items-center">
                                            <div className="count-img">
                                                <img src="/img/icons/bx-headphone.svg" alt="Icon" />
                                            </div>
                                            <div className="count-content">
                                                <h4>
                                                    <span className="counterUp">625</span>+
                                                </h4>
                                                <p>Car Center Solutions</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="count-group flex-fill">
                                        <div className="customer-count d-flex align-items-center">
                                            <div className="count-img">
                                                <img src="/img/icons/bx-history.svg" alt="Icon" />
                                            </div>
                                            <div className="count-content">
                                                <h4>
                                                    <span className="counterUp">15000</span>+
                                                </h4>
                                                <p>Total Kilometer</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section why-choose popular-explore">
                    <div className="choose-left">
                        <img src="/img/bg/choose-left.png" className="img-fluid" alt="Why Choose Us" />
                    </div>
                    <div className="container">
                        {/* Heading title */}
                        <div className="row">
                            <div className="col-lg-4 mx-auto">
                                <div className="section-heading" data-aos="fade-down">
                                    <h2>Why Choose Us</h2>
                                    <p>We are innovative and passionate about the work we do.</p>
                                </div>
                            </div>
                        </div>
                        {/* /Heading title */}
                        <div className="why-choose-group">
                            <div className="row">
                                <div className="col-lg-4 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="choose-img choose-black">
                                                <img src="/img/icons/bx-selection.svg" alt="Icon" />
                                            </div>
                                            <div className="choose-content">
                                                <h4>Easy & Fast Booking</h4>
                                                <p>
                                                    Completely carinate e-business testing process whereas fully researched customer service. Globally
                                                    extensive content with quality.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="choose-img choose-secondary">
                                                <img src="/img/icons/bx-crown.svg" alt="Icon" />
                                            </div>
                                            <div className="choose-content">
                                                <h4>Many Pickup Location</h4>
                                                <p>
                                                    Enthusiastically magnetic initiatives with cross-platform sources. Dynamically target testing
                                                    procedures through effective.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-12 d-flex" data-aos="fade-down">
                                    <div className="card flex-fill">
                                        <div className="card-body">
                                            <div className="choose-img choose-primary">
                                                <img src="/img/icons/bx-user-check.svg" alt="Icon" />
                                            </div>
                                            <div className="choose-content">
                                                <h4>Customer Satisfaction</h4>
                                                <p>Globally user-centric method interactive. Seamlessly revolutionize unique portals corporate collaboration.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="footer">
                    {/* Footer Top */}
                    <div className="footer-top aos" data-aos="fade-down">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-7">
                                    <div className="row">
                                        <div className="col-lg-4 col-md-6">
                                            {/* Footer Widget */}
                                            <div className="footer-widget footer-menu">
                                                <h5 className="footer-title">About Company</h5>
                                                <ul>
                                                    <li>
                                                        <a href="about.html">Our Company</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Shop Toyota</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Dreamsrentals USA</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Dreamsrentals Worldwide</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Dreamsrental Category</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            {/* /Footer Widget */}
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            {/* Footer Widget */}
                                            <div className="footer-widget footer-menu">
                                                <h5 className="footer-title">Vehicles Type</h5>
                                                <ul>
                                                    <li>
                                                        <a href="javascript:void(0)">All Vehicles</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">SUVs</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Trucks</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Cars</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Crossovers</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            {/* /Footer Widget */}
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            {/* Footer Widget */}
                                            <div className="footer-widget footer-menu">
                                                <h5 className="footer-title">Quick links</h5>
                                                <ul>
                                                    <li>
                                                        <a href="javascript:void(0)">My Account</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Champaigns</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Dreamsrental Dealers</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Deals and Incentive</a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">Financial Services</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            {/* /Footer Widget */}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="footer-contact footer-widget">
                                        <h5 className="footer-title">Contact Info</h5>
                                        <div className="footer-contact-info">
                                            <div className="footer-address">
                                                <span>
                                                    <i className="feather-phone-call"></i>
                                                </span>
                                                <div className="addr-info">
                                                    <a href="tel:+1(888)7601940">+ 1 (888) 760 1940</a>
                                                </div>
                                            </div>
                                            <div className="footer-address">
                                                <span>
                                                    <i className="feather-mail"></i>
                                                </span>
                                                <div className="addr-info">
                                                    <a href="mailto:info@example.com">[email&#160;protected]</a>
                                                </div>
                                            </div>
                                            <div className="update-form">
                                                <form action="#">
                                                    <span>
                                                        <i className="feather-mail"></i>
                                                    </span>
                                                    <input type="email" className="form-control" placeholder="Enter Your Email Here" />
                                                    <button type="submit" className="btn btn-subscribe">
                                                        <span>
                                                            <i className="feather-send"></i>
                                                        </span>
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="footer-social-widget">
                                            <ul className="nav-social">
                                                <li>
                                                    <a href="javascript:void(0)">
                                                        <i className="fa-brands fa-facebook-f fa-facebook fi-icon"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0)">
                                                        <i className="fab fa-instagram fi-icon"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0)">
                                                        <i className="fab fa-behance fi-icon"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0)">
                                                        <i className="fab fa-twitter fi-icon"></i>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="javascript:void(0)">
                                                        <i className="fab fa-linkedin fi-icon"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* /Footer Top */}

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="container">
                            {/* Copyright */}
                            <div className="copyright">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="copyright-text">
                                            <p>© 2024 Dreams Rent. All Rights Reserved.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        {/* Copyright Menu */}
                                        <div className="copyright-menu">
                                            <div className="vistors-details">
                                                <ul className="d-flex">
                                                    <li>
                                                        <a href="javascript:void(0)">
                                                            <img className="img-fluid" src="/img/icons/paypal.svg" alt="Paypal" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">
                                                            <img className="img-fluid" src="/img/icons/visa.svg" alt="Visa" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">
                                                            <img className="img-fluid" src="/img/icons/master.svg" alt="Master" />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0)">
                                                            <img className="img-fluid" src="/img/icons/applegpay.svg" alt="applegpay" />
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        {/* /Copyright Menu */}
                                    </div>
                                </div>
                            </div>
                            {/* /Copyright */}
                        </div>
                    </div>
                    {/* /Footer Bottom */}
                </footer>

            </div>
        </>
    );
}

export default HomePage;
