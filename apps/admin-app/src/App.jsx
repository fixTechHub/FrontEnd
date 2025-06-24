import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="main-wrapper">
        <div className="header">
          <div className="main-header">
            <div className="header-left">
              <a href="index.html" className="logo">
                <img src="/img/logo.svg" alt="Logo" />
              </a>
              <a href="index.html" className="dark-logo">
                <img src="/img/logo-white.svg" alt="Logo" />
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
                <div className="me-auto d-flex align-items-center" id="header-search">
                  <a id="toggle_btn" href="javascript:void(0);">
                    <i className="ti ti-menu-deep"></i>
                  </a>
                  <div className="add-dropdown">
                    <a href="add-reservation.html" className="btn btn-dark d-inline-flex align-items-center">
                      <i className="ti ti-plus me-1"></i>New Reservation
                    </a>
                  </div>
                </div>
                <div className="d-flex align-items-center header-icons">
                  {/* Flag */}
                  <div className="nav-item dropdown has-arrow flag-nav nav-item-box">
                    <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="javascript:void(0);" role="button">
                      <img src="/img/flags/gb.svg" alt="Language" className="img-fluid" />
                    </a>
                    <ul className="dropdown-menu p-2">
                      <li>
                        <a href="javascript:void(0);" className="dropdown-item">
                          <img src="/img/flags/gb.svg" alt="" height="16" />English
                        </a>
                      </li>
                      <li>
                        <a href="javascript:void(0);" className="dropdown-item">
                          <img src="/img/flags/sa.svg" alt="" height="16" />Arabic
                        </a>
                      </li>
                      <li>
                        <a href="javascript:void(0);" className="dropdown-item">
                          <img src="/img/flags/de.svg" alt="" height="16" />German
                        </a>
                      </li>
                    </ul>
                  </div>
                  {/* /Flag */}

                  <div className="theme-item">
                    <a href="javascript:void(0);" id="dark-mode-toggle" className="theme-toggle btn btn-menubar">
                      <i className="ti ti-moon"></i>
                    </a>
                    <a href="javascript:void(0);" id="light-mode-toggle" className="theme-toggle btn btn-menubar">
                      <i className="ti ti-sun-high"></i>
                    </a>
                  </div>

                  <div className="notification_item">
                    <a href="javascript:void(0);" className="btn btn-menubar position-relative" id="notification_popup" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-bell"></i>
                      <span className="badge bg-violet rounded-pill"></span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end notification-dropdown">
                      <div className="topnav-dropdown-header pb-0">
                        <h5 className="notification-title">Notifications</h5>
                        <ul className="nav nav-tabs nav-tabs-bottom">
                          <li className="nav-item"><a className="nav-link active" href="#active-notification" data-bs-toggle="tab">Active<span className="badge badge-xs rounded-pill bg-danger ms-2">5</span></a></li>
                          <li className="nav-item"><a className="nav-link" href="#unread-notification" data-bs-toggle="tab">Unread</a></li>
                          <li className="nav-item"><a className="nav-link" href="#archieve-notification" data-bs-toggle="tab">Archieve</a></li>
                        </ul>
                      </div>
                      <div className="noti-content">
                        <div className="tab-content">
                          <div className="tab-pane fade show active" id="active-notification">
                            <div className="notification-list">
                              <div className="d-flex align-items-center">
                                <a href="javascript:void(0);" className="avatar avatar-lg offline me-2 flex-shrink-0">
                                  <img src="/img/profiles/avatar-02.jpg" alt="Profile" className="rounded-circle" />
                                </a>
                                <div className="flex-grow-1">
                                  <p className="mb-1"><a href="javascript:void(0);"><span className="text-gray-9">Jerry Manas</span> Added New Task Creating <span className="text-gray-9">Login Pages</span></a></p>
                                  <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>4 Min Ago</span>
                                </div>
                              </div>
                            </div>
                            <div className="notification-list">
                              <div className="d-flex align-items-center">
                                <a href="javascript:void(0);" className="avatar avatar-lg offline me-2 flex-shrink-0">
                                  <img src="/img/profiles/avatar-05.jpg" alt="Profile" className="rounded-circle" />
                                </a>
                                <div className="flex-grow-1">
                                  <p className="mb-1"><a href="javascript:void(0);"><span className="text-gray-9">Robert Fox </span> Was Marked as Late Login <span className="text-danger">09:55 AM</span></a></p>
                                  <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>5 Min Ago</span>
                                </div>
                              </div>
                            </div>
                            <div className="notification-list">
                              <div className="d-flex align-items-center">
                                <a href="javascript:void(0);" className="avatar avatar-lg me-2 flex-shrink-0">
                                  <img src="/img/profiles/avatar-04.jpg" alt="Profile" className="rounded-circle" />
                                </a>
                                <div className="flex-grow-1">
                                  <p className="mb-1"><a href="javascript:void(0);"><span className="text-gray-9">Jenny Wilson </span> Completed <span className="text-gray-9">Created New Component</span></a></p>
                                  <div className="d-flex align-items-center">
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>15 Min Ago</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="notification-list">
                              <div className="d-flex align-items-center">
                                <a href="javascript:void(0);" className="avatar avatar-lg me-2 flex-shrink-0">
                                  <img src="/img/profiles/avatar-02.jpg" alt="Profile" className="rounded-circle" />
                                </a>
                                <div className="flex-grow-1">
                                  <p className="mb-1"><a href="javascript:void(0);"><span className="text-gray-9">Jacob Johnson </span> Added Manual Time <span className="text-gray-9">2 Hrs</span></a></p>
                                  <div className="d-flex align-items-center">
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>20 Min Ago</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="notification-list">
                              <div className="d-flex align-items-center">
                                <a href="javascript:void(0);" className="avatar avatar-lg me-2 flex-shrink-0">
                                  <img src="/img/profiles/avatar-01.jpg" alt="Profile" className="rounded-circle" />
                                </a>
                                <div className="flex-grow-1">
                                  <p className="mb-1"><a href="javascript:void(0);"><span className="text-gray-9">Annete Black </span> Completed <span className="text-gray-9">Improved Workflow React</span></a></p>
                                  <div className="d-flex align-items-center">
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>22 Min Ago</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="tab-pane fade" id="unread-notification">
                            <div className="notification-list">
                              <a href="javascript:void(0);">
                                <div className="d-flex align-items-center">
                                  <span className="avatar avatar-lg offline me-2 flex-shrink-0">
                                    <img src="/img/profiles/avatar-02.jpg" alt="Profile" className="rounded-circle" />
                                  </span>
                                  <div className="flex-grow-1">
                                    <p className="mb-1"><span className="text-gray-9">Jerry Manas</span> Added New Task Creating <span className="text-gray-9">Login Pages</span></p>
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>4 Min Ago</span>
                                  </div>
                                </div>
                              </a>
                            </div>
                            <div className="notification-list">
                              <a href="javascript:void(0);">
                                <div className="d-flex align-items-center">
                                  <span className="avatar avatar-lg offline me-2 flex-shrink-0">
                                    <img src="/img/profiles/avatar-05.jpg" alt="Profile" className="rounded-circle" />
                                  </span>
                                  <div className="flex-grow-1">
                                    <p className="mb-1"><span className="text-gray-9">Robert Fox </span> Was Marked as Late Login <span className="text-danger">09:55 AM</span></p>
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>5 Min Ago</span>
                                  </div>
                                </div>
                              </a>
                            </div>
                            <div className="notification-list">
                              <a href="javascript:void(0);">
                                <div className="d-flex align-items-center">
                                  <span className="avatar avatar-lg offline me-2 flex-shrink-0">
                                    <img src="/img/profiles/avatar-06.jpg" alt="Profile" className="rounded-circle" />
                                  </span>
                                  <div className="flex-grow-1">
                                    <p className="mb-1"><span className="text-gray-9">Robert Fox </span> Created New Component</p>
                                    <span className="fs-12 noti-time"><i className="ti ti-clock me-1"></i>5 Min Ago</span>
                                  </div>
                                </div>
                              </a>
                            </div>
                          </div>
                          <div className="tab-pane fade" id="archieve-notification">
                            <div className="d-flex justify-content-center align-items-center p-3">
                              <div className="text-center ">
                                <img src="/img/icons/nodata.svg" className="mb-2" alt="nodata" />
                                <p className="text-gray-5">No Data Available</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between topnav-dropdown-footer">
                        <div className="d-flex align-items-center">
                          <a href="javascript:void(0);" className="link-primary text-decoration-underline me-3">Mark all as Read</a>
                          <a href="javascript:void(0);" className="link-danger text-decoration-underline">Clear All</a>
                        </div>
                        <a href="javascript:void(0);" className="btn btn-primary btn-sm d-inline-flex align-items-center">View All Notifications<i className="ti ti-chevron-right ms-1"></i></a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <a href="income-report.html" className="btn btn-menubar">
                      <i className="ti ti-chart-bar"></i>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="javascript:void(0);" className="btn btn-menubar" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-grid-dots"></i>
                    </a>
                    <div className="dropdown-menu p-3">
                      <ul>
                        <li>
                          <a href="add-car.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-car me-2"></i>Car
                          </a>
                        </li>
                        <li>
                          <a href="add-quotations.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-file-symlink me-2"></i>Quotation
                          </a>
                        </li>
                        <li>
                          <a href="pricing.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-file-dollar me-2"></i>Seasonal Pricing
                          </a>
                        </li>
                        <li>
                          <a href="extra-services.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-script-plus me-2"></i>Extra Service
                          </a>
                        </li>
                        <li>
                          <a href="inspections.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-dice-6 me-2"></i>Inspection
                          </a>
                        </li>
                        <li>
                          <a href="maintenance.html" className="dropdown-item d-inline-flex align-items-center">
                            <i className="ti ti-color-filter me-2"></i>Maintenance
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="dropdown profile-dropdown">
                    <a href="javascript:void(0);" className="d-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <span className="avatar avatar-sm">
                        <img src="/img/profiles/avatar-05.jpg" alt="Img" className="img-fluid rounded-circle" />
                      </span>
                    </a>
                    <div className="dropdown-menu">
                      <div className="profileset d-flex align-items-center">
                        <span className="user-img me-2">
                          <img src="/img/profiles/avatar-05.jpg" alt="" />
                        </span>
                        <div>
                          <h6 className="fw-semibold mb-1">Andrew Simmonds</h6>
                          <p className="fs-13"><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="10717e74627567507568717d607c753e737f7d">[email&#160;protected]</a></p>
                        </div>
                      </div>
                      <a className="dropdown-item d-flex align-items-center" href="profile-setting.html">
                        <i className="ti ti-user-edit me-2"></i>Edit Profile
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="payments.html">
                        <i className="ti ti-credit-card me-2"></i>Payments
                      </a>
                      <div className="dropdown-divider my-2"></div>
                      <div className="dropdown-item">
                        <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between">
                          <label className="form-check-label" htmlFor="notify">
                            <i className="ti ti-bell me-2"></i>Notifications
                          </label>
                          <input className="form-check-input" type="checkbox" role="switch" id="notify" defaultChecked />
                        </div>
                      </div>
                      <a className="dropdown-item d-flex align-items-center" href="security-setting.html">
                        <i className="ti ti-exchange me-2"></i>Change Password
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="profile-setting.html">
                        <i className="ti ti-settings me-2"></i>Settings
                      </a>
                      <div className="dropdown-divider my-2"></div>
                      <a className="dropdown-item logout d-flex align-items-center justify-content-between" href="login.html">
                        <span><i className="ti ti-logout me-2"></i>Logout Account</span> <i className="ti ti-chevron-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Menu */}
            <div className="dropdown mobile-user-menu">
              <a href="javascript:void(0);" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fa fa-ellipsis-v"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end">
                <a className="dropdown-item" href="profile.html">My Profile</a>
                <a className="dropdown-item" href="profile-setting.html">Settings</a>
                <a className="dropdown-item" href="login.html">Logout</a>
              </div>
            </div>
            {/* /Mobile Menu */}
          </div>
        </div>
        <div className="sidebar" id="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <a href="index.html" className="logo logo-normal">
              <img src="assets/img/logo.svg" alt="Logo" />
            </a>
            <a href="index.html" className="logo-small">
              <img src="assets/img/logo-small.svg" alt="Logo" />
            </a>
            <a href="index.html" className="dark-logo">
              <img src="assets/img/logo-white.svg" alt="Logo" />
            </a>
          </div>
          {/* /Logo */}
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <div className="form-group">
                {/* Search */}
                <div className="input-group input-group-flat d-inline-flex">
                  <span className="input-icon-addon">
                    <i className="ti ti-search"></i>
                  </span>
                  <input type="text" className="form-control" placeholder="Search" />
                  <span className="group-text">
                    <i className="ti ti-command"></i>
                  </span>
                </div>
                {/* /Search */}
              </div>
              <ul>
                <li className="menu-title"><span>Main</span></li>
                <li>
                  <ul>
                    <li className="active">
                      <a href="index.html">
                        <i className="ti ti-layout-dashboard"></i><span>Dashboard</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>Bookings</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="reservations.html">
                        <i className="ti ti-files"></i><span>Reservations</span><span className="track-icon"></span>
                      </a>
                    </li>
                    <li>
                      <a href="calendar.html">
                        <i className="ti ti-calendar-bolt"></i><span>Calendar</span>
                      </a>
                    </li>
                    <li>
                      <a href="quotations.html">
                        <i className="ti ti-file-symlink"></i><span>Quotations</span>
                      </a>
                    </li>
                    <li>
                      <a href="enquiries.html">
                        <i className="ti ti-mail"></i><span>Enquiries</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>Manage</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="customers.html">
                        <i className="ti ti-users-group"></i><span>Customers</span>
                      </a>
                    </li>
                    <li>
                      <a href="drivers.html">
                        <i className="ti ti-user-bolt"></i><span>Drivers</span>
                      </a>
                    </li>
                    <li>
                      <a href="locations.html">
                        <i className="ti ti-map-pin"></i><span>Locations</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>RENTALS</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="cars.html">
                        <i className="ti ti-car"></i><span>Cars</span>
                      </a>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-device-camera-phone"></i><span>Car Attributes</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="brands.html">Brands</a></li>
                        <li><a href="types.html">Types</a></li>
                        <li><a href="models.html">Models</a></li>
                        <li><a href="transmissions.html">Transmissions</a></li>
                        <li><a href="fuel.html">Fuels</a></li>
                        <li><a href="color.html">Colors</a></li>
                        <li><a href="steering.html">Steering</a></li>
                        <li><a href="seats.html">Seats</a></li>
                        <li><a href="cylinders.html">Cylinders</a></li>
                        <li><a href="doors.html">Doors</a></li>
                        <li><a href="features.html">Features</a></li>
                        <li><a href="safety-features.html">Safty Features</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="extra-services.html">
                        <i className="ti ti-script-plus"></i><span>Extra Service</span>
                      </a>
                    </li>
                    <li>
                      <a href="pricing.html">
                        <i className="ti ti-file-dollar"></i><span>Seasonal Pricing</span>
                      </a>
                    </li>
                    <li>
                      <a href="inspections.html">
                        <i className="ti ti-dice-6"></i><span>Inspections</span>
                      </a>
                    </li>
                    <li>
                      <a href="tracking.html">
                        <i className="ti ti-map-pin-pin"></i><span>Tracking</span>
                      </a>
                    </li>
                    <li>
                      <a href="maintenance.html">
                        <i className="ti ti-color-filter"></i><span>Maintenance</span>
                      </a>
                    </li>
                    <li>
                      <a href="reviews.html">
                        <i className="ti ti-star"></i><span>Reviews</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="invoices.html">
                        <i className="ti ti-file-invoice"></i><span>Invoices</span>
                      </a>
                    </li>
                    <li>
                      <a href="payments.html">
                        <i className="ti ti-credit-card"></i><span>Payments</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>OTHERS</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="chat.html">
                        <i className="ti ti-message"></i><span>Messages</span><span className="count">5</span>
                      </a>
                    </li>
                    <li>
                      <a href="coupons.html">
                        <i className="ti ti-discount-2"></i><span>Coupons</span>
                      </a>
                    </li>
                    <li>
                      <a href="newsletters.html">
                        <i className="ti ti-file-horizontal"></i><span>Newsletters</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>CMS</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="pages.html">
                        <i className="ti ti-file-invoice"></i><span>Pages</span>
                      </a>
                    </li>
                    <li>
                      <a href="menu-management.html">
                        <i className="ti ti-menu-2"></i><span>Menu Management</span>
                      </a>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-device-desktop-analytics"></i><span>Blogs</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="blogs.html">All Blogs</a></li>
                        <li><a href="blog-categories.html">Categories</a></li>
                        <li><a href="blog-comments.html">Comments</a></li>
                        <li><a href="blog-tags.html">Blog Tags</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-map"></i><span>Locations</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="countries.html">Countries</a></li>
                        <li><a href="state.html">States</a></li>
                        <li><a href="city.html">Cities</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="testimonials.html">
                        <i className="ti ti-brand-hipchat"></i><span>Testimonials</span>
                      </a>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-question-mark"></i><span>FAQ’s</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="faq.html">FAQ's</a></li>
                        <li><a href="faq-category.html">FAQ Category</a></li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>SUPPORT</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="contact-messages.html">
                        <i className="ti ti-messages"></i><span>Contact Messages</span>
                      </a>
                    </li>
                    <li>
                      <a href="announcements.html">
                        <i className="ti ti-speakerphone"></i><span>Announcements</span>
                      </a>
                    </li>
                    <li>
                      <a href="tickets.html">
                        <i className="ti ti-ticket"></i><span>Tickets</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>USER MANAGEMENT</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="users.html">
                        <i className="ti ti-user-circle"></i><span>Users</span>
                      </a>
                    </li>
                    <li>
                      <a href="roles-permissions.html">
                        <i className="ti ti-user-shield"></i><span>Roles & Permissions</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>REPORTS</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="income-report.html">
                        <i className="ti ti-chart-histogram"></i><span>Income vs Expense</span>
                      </a>
                    </li>
                    <li>
                      <a href="earnings-report.html">
                        <i className="ti ti-chart-line"></i><span>Earnings</span>
                      </a>
                    </li>
                    <li>
                      <a href="rental-report.html">
                        <i className="ti ti-chart-infographic"></i><span>Rentals</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>AUTHENTICATION</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="login.html">
                        <i className="ti ti-login"></i><span>Login</span>
                      </a>
                    </li>
                    <li>
                      <a href="forgot-password.html">
                        <i className="ti ti-help-triangle"></i><span>Forgot Password</span>
                      </a>
                    </li>
                    <li>
                      <a href="otp.html">
                        <i className="ti ti-mail-exclamation"></i><span>Email Verification</span>
                      </a>
                    </li>
                    <li>
                      <a href="reset-password.html">
                        <i className="ti ti-restore"></i><span>Reset Password</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>SETTINGS & CONFIGURATION</span></li>
                <li>
                  <ul>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-user-cog"></i><span>Account Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="profile-setting.html">Profile</a>
                        </li>
                        <li>
                          <a href="security-setting.html">Security</a>
                        </li>
                        <li>
                          <a href="notifications-setting.html">Notifications</a>
                        </li>
                        <li>
                          <a href="integrations-settings.html">Integrations</a>
                        </li>
                        <li>
                          <a href="tracker-setting.html">Tracker</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-world-cog"></i><span>Website Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="company-setting.html">Company Settings</a>
                        </li>
                        <li>
                          <a href="localization-setting.html">Localization</a>
                        </li>
                        <li>
                          <a href="prefixes.html">Prefixes</a>
                        </li>
                        <li>
                          <a href="seo-setup.html">SEO Setup</a>
                        </li>
                        <li>
                          <a href="language-setting.html">Language</a>
                        </li>
                        <li>
                          <a href="maintenance-mode.html">Maintenance Mode</a>
                        </li>
                        <li>
                          <a href="login-setting.html">Login & Register</a>
                        </li>
                        <li>
                          <a href="ai-configuration.html">AI Configuration</a>
                        </li>
                        <li>
                          <a href="plugin-managers.html">Plugin Managers</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-clock-cog"></i><span>Rental Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="rental-setting.html">Rental</a>
                        </li>
                        <li>
                          <a href="insurance-setting.html">Insurance</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-device-mobile-cog"></i><span>App Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="invoice-setting.html">Invoice Settings</a>
                        </li>
                        <li>
                          <a href="invoice-template.html">Invoice Templates</a>
                        </li>
                        <li>
                          <a href="signatures-setting.html">Signatures</a>
                        </li>
                        <li>
                          <a href="custom-fields.html">Custom Fields</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-device-desktop-cog"></i><span>System Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="email-setting.html">Email Settings</a>
                        </li>
                        <li>
                          <a href="email-templates.html">Email Templates</a>
                        </li>
                        <li>
                          <a href="sms-gateways.html">SMS Gateways</a>
                        </li>
                        <li>
                          <a href="gdpr-cookies.html">GDPR Cookies</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-settings-dollar"></i><span>Finance Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="payment-methods.html">Payment Methods</a>
                        </li>
                        <li>
                          <a href="bank-accounts.html">Bank Accounts</a>
                        </li>
                        <li>
                          <a href="tax-rates.html">Tax Rates</a>
                        </li>
                        <li>
                          <a href="currencies.html">Currencies</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-settings-2"></i><span>Other Settings</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="sitemap.html">Sitemap</a>
                        </li>
                        <li>
                          <a href="clear-cache.html">Clear Cache</a>
                        </li>
                        <li>
                          <a href="storage.html">Storage</a>
                        </li>
                        <li>
                          <a href="cronjob.html">Cronjob</a>
                        </li>
                        <li>
                          <a href="system-backup.html">System Backup</a>
                        </li>
                        <li>
                          <a href="database-backup.html">Database Backup</a>
                        </li>
                        <li>
                          <a href="system-update.html">System Update</a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>UI Interface</span></li>
                <li>
                  <ul>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-hierarchy"></i><span>Base UI</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="ui-alerts.html">Alerts</a></li>
                        <li><a href="ui-accordion.html">Accordion</a></li>
                        <li><a href="ui-avatar.html">Avatar</a></li>
                        <li><a href="ui-badges.html">Badges</a></li>
                        <li><a href="ui-borders.html">Border</a></li>
                        <li><a href="ui-buttons.html">Buttons</a></li>
                        <li><a href="ui-buttons-group.html">Button Group</a></li>
                        <li><a href="ui-breadcrumb.html">Breadcrumb</a></li>
                        <li><a href="ui-cards.html">Card</a></li>
                        <li><a href="ui-carousel.html">Carousel</a></li>
                        <li><a href="ui-colors.html">Colors</a></li>
                        <li><a href="ui-dropdowns.html">Dropdowns</a></li>
                        <li><a href="ui-grid.html">Grid</a></li>
                        <li><a href="ui-images.html">Images</a></li>
                        <li><a href="ui-lightbox.html">Lightbox</a></li>
                        <li><a href="ui-media.html">Media</a></li>
                        <li><a href="ui-modals.html">Modals</a></li>
                        <li><a href="ui-offcanvas.html">Offcanvas</a></li>
                        <li><a href="ui-pagination.html">Pagination</a></li>
                        <li><a href="ui-popovers.html">Popovers</a></li>
                        <li><a href="ui-progress.html">Progress</a></li>
                        <li><a href="ui-placeholders.html">Placeholders</a></li>
                        <li><a href="ui-spinner.html">Spinner</a></li>
                        <li><a href="ui-sweetalerts.html">Sweet Alerts</a></li>
                        <li><a href="ui-nav-tabs.html">Tabs</a></li>
                        <li><a href="ui-toasts.html">Toasts</a></li>
                        <li><a href="ui-tooltips.html">Tooltips</a></li>
                        <li><a href="ui-typography.html">Typography</a></li>
                        <li><a href="ui-video.html">Video</a></li>
                        <li><a href="ui-sortable.html">Sortable</a></li>
                        <li><a href="ui-swiperjs.html">Swiperjs</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-whirl"></i><span>Advanced UI</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="ui-ribbon.html">Ribbon</a></li>
                        <li><a href="ui-clipboard.html">Clipboard</a></li>
                        <li><a href="ui-drag-drop.html">Drag & Drop</a></li>
                        <li><a href="ui-rangeslider.html">Range Slider</a></li>
                        <li><a href="ui-rating.html">Rating</a></li>
                        <li><a href="ui-text-editor.html">Text Editor</a></li>
                        <li><a href="ui-counter.html">Counter</a></li>
                        <li><a href="ui-scrollbar.html">Scrollbar</a></li>
                        <li><a href="ui-stickynote.html">Sticky Note</a></li>
                        <li><a href="ui-timeline.html">Timeline</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-forms"></i><span>Forms</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li className="submenu submenu-two">
                          <a href="javascript:void(0);">Form Elements<span className="menu-arrow inside-submenu"></span></a>
                          <ul>
                            <li><a href="form-basic-inputs.html">Basic Inputs</a></li>
                            <li><a href="form-checkbox-radios.html">Checkbox & Radios</a></li>
                            <li><a href="form-input-groups.html">Input Groups</a></li>
                            <li><a href="form-grid-gutters.html">Grid & Gutters</a></li>
                            <li><a href="form-select.html">Form Select</a></li>
                            <li><a href="form-mask.html">Input Masks</a></li>
                            <li><a href="form-fileupload.html">File Uploads</a></li>
                          </ul>
                        </li>
                        <li className="submenu submenu-two">
                          <a href="javascript:void(0);">Layouts<span className="menu-arrow inside-submenu"></span></a>
                          <ul>
                            <li><a href="form-horizontal.html">Horizontal Form</a></li>
                            <li><a href="form-vertical.html">Vertical Form</a></li>
                            <li><a href="form-floating-labels.html">Floating Labels</a></li>
                          </ul>
                        </li>
                        <li><a href="form-validation.html">Form Validation</a></li>
                        <li><a href="form-select2.html">Select2</a></li>
                        <li><a href="form-wizard.html">Form Wizard</a></li>
                        <li><a href="form-pickers.html">Form Picker</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-table"></i><span>Tables</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="tables-basic.html">Basic Tables </a></li>
                        <li><a href="data-tables.html">Data Table </a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-chart-pie-3"></i>
                        <span>Charts</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="chart-apex.html">Apex Charts</a></li>
                        <li><a href="chart-c3.html">Chart C3</a></li>
                        <li><a href="chart-js.html">Chart Js</a></li>
                        <li><a href="chart-morris.html">Morris Charts</a></li>
                        <li><a href="chart-flot.html">Flot Charts</a></li>
                        <li><a href="chart-peity.html">Peity Charts</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-icons"></i>
                        <span>Icons</span><span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="icon-fontawesome.html">Fontawesome Icons</a></li>
                        <li><a href="icon-tabler.html">Tabler Icons</a></li>
                        <li><a href="icon-bootstrap.html">Bootstrap Icons</a></li>
                        <li><a href="icon-remix.html">Remix Icons</a></li>
                        <li><a href="icon-feather.html">Feather Icons</a></li>
                        <li><a href="icon-ionic.html">Ionic Icons</a></li>
                        <li><a href="icon-material.html">Material Icons</a></li>
                        <li><a href="icon-pe7.html">Pe7 Icons</a></li>
                        <li><a href="icon-simpleline.html">Simpleline Icons</a></li>
                        <li><a href="icon-themify.html">Themify Icons</a></li>
                        <li><a href="icon-weather.html">Weather Icons</a></li>
                        <li><a href="icon-typicon.html">Typicon Icons</a></li>
                        <li><a href="icon-flag.html">Flag Icons</a></li>
                      </ul>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-map-2"></i>
                        <span>Maps</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="maps-vector.html">Vector</a>
                        </li>
                        <li>
                          <a href="maps-leaflet.html">Leaflet</a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li className="menu-title"><span>Extras</span></li>
                <li>
                  <ul>
                    <li>
                      <a href="javascript:void(0);"><i className="ti ti-file-shredder"></i><span>Documentation</span></a>
                    </li>
                    <li>
                      <a href="javascript:void(0);"><i className="ti ti-exchange"></i><span>Changelog</span></a>
                    </li>
                    <li className="submenu">
                      <a href="javascript:void(0);">
                        <i className="ti ti-menu-2"></i><span>Multi Level</span>
                        <span className="menu-arrow"></span>
                      </a>
                      <ul>
                        <li><a href="javascript:void(0);">Multilevel 1</a></li>
                        <li className="submenu submenu-two">
                          <a href="javascript:void(0);">Multilevel 2<span className="menu-arrow inside-submenu"></span></a>
                          <ul>
                            <li><a href="javascript:void(0);">Multilevel 2.1</a></li>
                            <li className="submenu submenu-two submenu-three">
                              <a href="javascript:void(0);">Multilevel 2.2<span className="menu-arrow inside-submenu inside-submenu-two"></span></a>
                              <ul>
                                <li><a href="javascript:void(0);">Multilevel 2.2.1</a></li>
                                <li><a href="javascript:void(0);">Multilevel 2.2.2</a></li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li><a href="javascript:void(0);">Multilevel 3</a></li>
                      </ul>
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
                      <a href="index.html">Home</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Admin Dashboard</li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                <div className="input-icon-start position-relative topdatepicker mb-2">
                  <span className="input-icon-addon">
                    <i className="ti ti-calendar"></i>
                  </span>
                  <input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
                </div>
              </div>
            </div>
            {/* /Breadcrumb */}

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
                            <p className="d-flex align-items-center mb-2"><span className="line-icon bg-violet me-2"></span><span className="fw-semibold text-gray-9 me-1">80</span>In Rental</p>
                            <p className="d-flex align-items-center"><span className="line-icon bg-orange me-2"></span><span className="fw-semibold text-gray-9 me-1">96</span> Upcoming</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <a href="reservations.html" className="btn btn-primary d-flex align-items-center"><i className="ti ti-eye me-1"></i>Reservations</a>
                          <a href="add-car.html" className="btn btn-dark d-flex align-items-center"><i className="ti ti-plus me-1"></i>Add New Car</a>
                        </div>
                      </div>
                      <div className="col-sm-5">
                        <img src="assets/img/icons/car.svg" alt="img" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Welcome Wrap */}

                <div className="row">
                  {/* Total Reservations */}
                  <div className="col-md-4 d-flex">
                    <div className="card flex-fill">
                      <div className="card-body pb-1">
                        <div className="border-bottom mb-0 pb-2">
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm bg-secondary-100 text-secondary me-2">
                              <i className="ti ti-calendar-time fs-14"></i>
                            </span>
                            <p>Total Reservations</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div className="py-2">
                            <h5 className="mb-1">68</h5>
                            <p><span className="text-success fw-semibold">+45%</span> Last Week</p>
                          </div>
                          <div id="reservation-chart"></div> {/* Placeholder for chart */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Total Reservations */}

                  {/* Total Earnings */}
                  <div className="col-md-4 d-flex">
                    <div className="card flex-fill">
                      <div className="card-body pb-1">
                        <div className="border-bottom mb-0 pb-2">
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm bg-orange-100 text-orange me-2">
                              <i className="ti ti-moneybag fs-14"></i>
                            </span>
                            <p>Total Earnings</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div className="py-2">
                            <h5 className="mb-1">$565545</h5>
                            <p><span className="text-success fw-semibold">+22%</span> Last Week</p>
                          </div>
                          <div id="earning-chart"></div> {/* Placeholder for chart */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Total Earnings */}

                  {/* Total Cars */}
                  <div className="col-md-4 d-flex">
                    <div className="card flex-fill">
                      <div className="card-body pb-1">
                        <div className="border-bottom mb-0 pb-2">
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm bg-violet-100 text-violet me-2">
                              <i className="ti ti-car fs-14"></i>
                            </span>
                            <p>Total Cars</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div className="py-2">
                            <h5 className="mb-1">658</h5>
                            <p><span className="text-danger fw-semibold">-42%</span> Last Week</p>
                          </div>
                          <div id="car-chart"></div> {/* Placeholder for chart */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Total Cars */}
                </div>
              </div>

              {/* Newly Added Cars */}
              <div className="col-xl-4 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <h5>Newly Added Cars</h5>
                      <a href="cars.html" className="text-decoration-underline fw-medium">View All</a>
                    </div>
                    <div className="mb-2">
                      <img src="assets/img/car/car.jpg" alt="img" className="rounded w-100" />
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                      <div>
                        <p className="fs-13 mb-1">Sedan</p>
                        <h6 className="fs-14 fw-semibold">1.5 Eco Sports ST-Line 115CV</h6>
                      </div>
                      <h6 className="fs-14 fw-semibold">$280 <span className="fw-normal text-gray-5">/day</span></h6>
                    </div>
                    <div className="row g-2 justify-content-center mb-3">
                      <div className="col-sm-4 col-6 d-flex">
                        <div className="bg-light border p-2 br-5 flex-fill text-center">
                          <h6 className="fs-14 fw-semibold">Fuel Type</h6>
                          <span className="fs-13">Petrol</span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-6 d-flex">
                        <div className="bg-light border p-2 br-5 flex-fill text-center">
                          <h6 className="fs-14 fw-semibold">Passengers</h6>
                          <span className="fs-13">03</span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-6 d-flex">
                        <div className="bg-light border p-2 br-5 flex-fill text-center">
                          <h6 className="fs-14 fw-semibold">Driving Type</h6>
                          <span className="fs-13">Self</span>
                        </div>
                      </div>
                    </div>
                    <a href="car-details.html" className="btn btn-white d-flex align-items-center justify-content-center">View Details<i className="ti ti-chevron-right ms-1"></i></a>
                  </div>
                </div>
              </div>
              {/* /Newly Added Cars */}
            </div>

            <div className="row">
              {/* Live Tracking */}
              <div className="col-xl-6 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
                      <h5 className="mb-1">Live Tracking</h5>
                      <div className="dropdown mb-1">
                        <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
                          <i className="ti ti-map-pin me-1"></i>Washington
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a href="javascript:void(0);" className="dropdown-item rounded-1">Washington</a>
                          </li>
                          <li>
                            <a href="javascript:void(0);" className="dropdown-item rounded-1">Chicago</a>
                          </li>
                          <li>
                            <a href="javascript:void(0);" className="dropdown-item rounded-1">Houston</a>
                          </li>
                          <li>
                            <a href="javascript:void(0);" className="dropdown-item rounded-1">Las Vegas</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="map-wrap position-relative">
                      <div id="map" className="tracking-map w-100 z-1"></div> {/* Placeholder for map */}
                      <div className="position-absolute top-0 start-0 w-100 z-2 p-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon">
                            <i className="ti ti-search"></i>
                          </span>
                          <input type="text" className="form-control" placeholder="Search by Car Name" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Live Tracking */}

              {/* Recent Reservations */}
              <div className="col-xl-6 d-flex">
                <div className="card flex-fill">
                  <div className="card-body pb-1">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                      <h5>Recent Reservations</h5>
                      <a href="reservations.html" className="text-decoration-underline fw-medium">View All</a>
                    </div>
                    <div className="table-responsive">
                      <table className="table custom-table1">
                        <tbody> {/* Added tbody for valid HTML table structure */}
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="car-details.html" className="avatar flex-shrink-0">
                                  <img src="assets/img/car/car-01.jpg" alt="img" />
                                </a>
                                <div className="flex-grow-1 ms-2">
                                  <p className="d-flex align-items-center fs-13 text-default mb-1">3 Days<i className="ti ti-circle-filled text-primary fs-5 mx-1"></i>Self</p>
                                  <h6 className="fs-14 fw-semibold mb-1"><a href="car-details.html">Ford Endeavour</a></h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <h6 className="fs-14 fw-semibold">Newyork</h6>
                                <span className="connect-line"></span>
                                <h6 className="fs-14 fw-semibold">Las Vegas</h6>
                              </div>
                              <p className="fs-13 text-default">15 Jan 2025, 01:00 PM</p>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <h6 className="fs-14 fw-semibold">$280 <span className="fw-normal text-default">/day</span></h6>
                                <a href="javascript:void(0);" className="avatar avatar-sm">
                                  <img src="assets/img/profiles/avatar-05.jpg" alt="img" className="rounded-circle" />
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="car-details.html" className="avatar flex-shrink-0">
                                  <img src="assets/img/car/car-02.jpg" alt="img" />
                                </a>
                                <div className="flex-grow-1 ms-2">
                                  <p className="d-flex align-items-center fs-13 text-default mb-1">4 Days<i className="ti ti-circle-filled text-primary fs-5 mx-1"></i>Self</p>
                                  <h6 className="fs-14 fw-semibold mb-1"><a href="car-details.html">Ferrari 458 MM</a></h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <h6 className="fs-14 fw-semibold">Chicago</h6>
                                <span className="connect-line"></span>
                                <h6 className="fs-14 fw-semibold">Houston</h6>
                              </div>
                              <p className="fs-13 text-default">07 Feb 2025, 10:25 AM</p>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <h6 className="fs-14 fw-semibold">$225 <span className="fw-normal text-default">/day</span></h6>
                                <a href="javascript:void(0);" className="avatar avatar-sm">
                                  <img src="assets/img/profiles/avatar-22.jpg" alt="img" className="rounded-circle" />
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="car-details.html" className="avatar flex-shrink-0">
                                  <img src="assets/img/car/car-03.jpg" alt="img" />
                                </a>
                                <div className="flex-grow-1 ms-2">
                                  <p className="d-flex align-items-center fs-13 text-default mb-1">5 Days<i className="ti ti-circle-filled text-primary fs-5 mx-1"></i>Self</p>
                                  <h6 className="fs-14 fw-semibold mb-1"><a href="car-details.html">Ford Mustang </a></h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <h6 className="fs-14 fw-semibold">Los Angeles </h6>
                                <span className="connect-line"></span>
                                <h6 className="fs-14 fw-semibold">New York</h6>
                              </div>
                              <p className="fs-13 text-default">14 Feb 2025, 04:40 PM</p>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <h6 className="fs-14 fw-semibold">$259 <span className="fw-normal text-default">/day</span></h6>
                                <a href="javascript:void(0);" className="avatar avatar-sm">
                                  <img src="assets/img/profiles/avatar-23.jpg" alt="img" className="rounded-circle" />
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="car-details.html" className="avatar flex-shrink-0">
                                  <img src="assets/img/car/car-04.jpg" alt="img" />
                                </a>
                                <div className="flex-grow-1 ms-2">
                                  <p className="d-flex align-items-center fs-13 text-default mb-1">6 Days<i className="ti ti-circle-filled text-primary fs-5 mx-1"></i>Self</p>
                                  <h6 className="fs-14 fw-semibold mb-1"><a href="car-details.html">Toyota Tacoma 4</a></h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <h6 className="fs-14 fw-semibold">Phoenix</h6>
                                <span className="connect-line"></span>
                                <h6 className="fs-14 fw-semibold">San Antonio</h6>
                              </div>
                              <p className="fs-13 text-default">08 Jan 2025, 09:25 AM</p>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <h6 className="fs-14 fw-semibold">$180 <span className="fw-normal text-default">/day</span></h6>
                                <a href="javascript:void(0);" className="avatar avatar-sm">
                                  <img src="assets/img/profiles/avatar-23.jpg" alt="img" className="rounded-circle" />
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <a href="car-details.html" className="avatar flex-shrink-0">
                                  <img src="assets/img/car/car-05.jpg" alt="img" />
                                </a>
                                <div className="flex-grow-1 ms-2">
                                  <p className="d-flex align-items-center fs-13 text-default mb-1">1 Week<i className="ti ti-circle-filled text-primary fs-5 mx-1"></i>Self</p>
                                  <h6 className="fs-14 fw-semibold mb-1"><a href="car-details.html">Chevrolet Truck</a></h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 mb-1">
                                <h6 className="fs-14 fw-semibold">Newyork </h6>
                                <span className="connect-line"></span>
                                <h6 className="fs-14 fw-semibold">Chicago</h6>
                              </div>
                              <p className="fs-13 text-default">17 Feb 2025, 11:45 AM</p>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <h6 className="fs-14 fw-semibold">$300 <span className="fw-normal text-default">/day</span></h6>
                                <a href="javascript:void(0);" className="avatar avatar-sm">
                                  <img src="assets/img/profiles/avatar-06.jpg" alt="img" className="rounded-circle" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Recent Reservations */}
            </div>
          </div>
        </div>

        <div className="page-wrapper">
          <div className="content me-4">
            {/* Breadcrumb */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
              <div className="my-auto mb-2">
                <h4 className="mb-1">All Reservations</h4>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <a href="index.html">Home</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">All Reservations</li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                <div className="mb-2 me-2">
                  <a href="javascript:void(0);" className="btn btn-white d-flex align-items-center"><i className="ti ti-printer me-2"></i>Print</a>
                </div>
                <div className="mb-2">
                  <div className="dropdown">
                    <a href="javascript:void(0);" className="btn btn-dark d-inline-flex align-items-center">
                      <i className="ti ti-upload me-1"></i>Export
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* /Breadcrumb */}

            {/* Table Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
                    <i className="ti ti-filter me-1"></i> Sort By : Latest
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end p-2">
                    <li>
                      <a href="javascript:void(0);" className="dropdown-item rounded-1">Latest</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" className="dropdown-item rounded-1">Ascending</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" className="dropdown-item rounded-1">Desending</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" className="dropdown-item rounded-1">Last Month</a>
                    </li>
                    <li>
                      <a href="javascript:void(0);" className="dropdown-item rounded-1">Last 7 Days</a>
                    </li>
                  </ul>
                </div>
                <div className="me-2">
                  <div className="input-icon-start position-relative topdatepicker">
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar"></i>
                    </span>
                    <input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#filtercollapse" className="filtercollapse coloumn d-inline-flex align-items-center" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="filtercollapse">
                    <i className="ti ti-filter me-1"></i> Filter <span className="badge badge-xs rounded-pill bg-danger ms-2">0</span>
                  </a>
                </div>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="top-search me-2">
                  <div className="top-search-group">
                    <span className="input-icon">
                      <i className="ti ti-search"></i>
                    </span>
                    <input type="text" className="form-control" placeholder="Search" />
                  </div>
                </div>
                <div className="dropdown">
                  <a href="javascript:void(0);" className="dropdown-toggle coloumn btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    <i className="ti ti-layout-board me-1"></i> Columns
                  </a>
                  <div className="dropdown-menu dropdown-menu-lg p-2">
                    <ul>
                      <li>
                        <div className="dropdown-item d-flex align-items-center justify-content-between rounded-1">
                          <span className="d-inline-flex align-items-center"><i className="ti ti-grip-vertical me-1"></i>CAR</span>
                          <div className="form-check form-check-sm form-switch mb-0">
                            <input className="form-check-input form-label" type="checkbox" role="switch" defaultChecked />
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-item d-flex align-items-center justify-content-between rounded-1">
                          <span><i className="ti ti-grip-vertical me-1"></i>CUSTOMER</span>
                          <div className="form-check form-check-sm form-switch mb-0">
                            <input className="form-check-input form-label" type="checkbox" role="switch" defaultChecked />
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-item d-flex align-items-center justify-content-between rounded-1">
                          <span><i className="ti ti-grip-vertical me-1"></i>PICK UP DETAILS</span>
                          <div className="form-check form-check-sm form-switch mb-0">
                            <input className="form-check-input form-label" type="checkbox" role="switch" defaultChecked />
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-item d-flex align-items-center justify-content-between rounded-1">
                          <span><i className="ti ti-grip-vertical me-1"></i>DROP OFF DETAILS</span>
                          <div className="form-check form-check-sm form-switch mb-0">
                            <input className="form-check-input form-label" type="checkbox" role="switch" defaultChecked />
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-item d-flex align-items-center justify-content-between rounded-1">
                          <span><i className="ti ti-grip-vertical me-1"></i>STATUS</span>
                          <div className="form-check form-check-sm form-switch mb-0">
                            <input className="form-check-input form-label" type="checkbox" role="switch" defaultChecked />
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* /Table Header */}

            <div className="collapse" id="filtercollapse">
              <div className="filterbox mb-3 d-flex align-items-center">
                <h6 className="me-3">Filters</h6>
                <div className="dropdown me-2">
                  <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    Pick Up Location
                  </a>
                  <ul className="dropdown-menu dropdown-menu-lg p-2">
                    <li>
                      <div className="top-search m-2">
                        <div className="top-search-group">
                          <span className="input-icon">
                            <i className="ti ti-search"></i>
                          </span>
                          <input type="text" className="form-control" placeholder="Search" />
                        </div>
                      </div>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Los Angles
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />New York City
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Houston
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Munich
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Montreal
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-2">
                  <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    Drop Off Location
                  </a>
                  <ul className="dropdown-menu dropdown-menu-lg p-2">
                    <li>
                      <div className="top-search m-2">
                        <div className="top-search-group">
                          <span className="input-icon">
                            <i className="ti ti-search"></i>
                          </span>
                          <input type="text" className="form-control" placeholder="Search" />
                        </div>
                      </div>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Los Angles
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />New York City
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Houston
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Munich
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Montreal
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    <i className="ti ti-badge me-1"></i>Status
                  </a>
                  <ul className="dropdown-menu dropdown-menu-lg p-2">
                    <li>
                      <div className="top-search m-2">
                        <div className="top-search-group">
                          <span className="input-icon">
                            <i className="ti ti-search"></i>
                          </span>
                          <input type="text" className="form-control" placeholder="Search" />
                        </div>
                      </div>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Completed
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Confirmed
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />In Rental
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />Rejected
                      </label>
                    </li>
                    <li>
                      <label className="dropdown-item d-flex align-items-center rounded-1">
                        <input className="form-check-input m-0 me-2" type="checkbox" />In Progress
                      </label>
                    </li>
                  </ul>
                </div>
                <a href="javascript:void(0);" className="me-2 text-purple links">Apply</a>
                <a href="javascript:void(0);" className="text-danger links">Clear All</a>
              </div>
            </div>

            {/* Custom Data Table */}
            <div className="custom-datatable-filter table-responsive">
              <table className="table datatable">
                <thead className="thead-light">
                  <tr>
                    <th className="no-sort">
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" id="select-all" />
                      </div>
                    </th>
                    <th>CAR</th>
                    <th>CUSTOMER</th>
                    <th>PICK UP DETAILS</th>
                    <th>DROP OFF DETAILS</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-01.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3466</a>
                          <h6 className="fs-14"><a href="car-details.html">Ford Endeavour</a></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="company-details.html" className="avatar avatar-rounded me-2 flex-shrink-0"><img src="assets/img/customer/customer-01.jpg" alt="" /></a>
                        <div>
                          <h6 className="mb-1 fs-14"><a href="company-details.html">Reuben Keen</a></h6>
                          <span className="badge bg-secondary-transparent rounded-pill">Client</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">12</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">13</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-transparent d-inline-flex align-items-center badge-sm">
                        <i className="ti ti-point-filled me-1"></i>Completed
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a className="dropdown-item rounded-1" href="reservation-details.html"><i className="ti ti-eye me-1"></i>View Details</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="edit-reservation.html"><i className="ti ti-edit me-1"></i>Edit</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-02.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3467</a>
                          <h6 className="fs-14"><a href="car-details.html">Ferrari 458 MM</a></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="company-details.html" className="avatar avatar-rounded me-2 flex-shrink-0"><img src="assets/img/customer/customer-02.jpg" alt="" /></a>
                        <div>
                          <h6 className="mb-1 fs-14"><a href="company-details.html">William Jones</a></h6>
                          <span className="badge bg-violet-transparent rounded-pill">Company</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">12</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">13</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-orange-transparent d-inline-flex align-items-center badge-sm">
                        <i className="ti ti-point-filled me-1"></i>Confirmed
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a className="dropdown-item rounded-1" href="reservation-details.html"><i className="ti ti-eye me-1"></i>View Details</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="edit-reservation.html"><i className="ti ti-edit me-1"></i>Edit</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-03.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3468</a>
                          <h6 className="fs-14"><a href="car-details.html">Ford Mustang </a></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="company-details.html" className="avatar avatar-rounded me-2 flex-shrink-0"><img src="assets/img/customer/customer-03.jpg" alt="" /></a>
                        <div>
                          <h6 className="mb-1 fs-14"><a href="company-details.html">Leonard Jandreau</a></h6>
                          <span className="badge bg-violet-transparent rounded-pill">Company</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">14</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Los Angeles</p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">15</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-violet-transparent d-inline-flex align-items-center badge-sm">
                        <i className="ti ti-point-filled me-1"></i>In Rental
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a className="dropdown-item rounded-1" href="reservation-details.html"><i className="ti ti-eye me-1"></i>View Details</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="edit-reservation.html"><i className="ti ti-edit me-1"></i>Edit</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-04.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3469</a>
                          <h6 className="fs-14"><a href="car-details.html">Toyota Tacoma 4</a></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="customer-details.html" className="avatar avatar-rounded me-2 flex-shrink-0"><img src="assets/img/customer/customer-04.jpg" alt="" /></a>
                        <div>
                          <h6 className="mb-1 fs-14"><a href="customer-details.html">Adam Bolden</a></h6>
                          <span className="badge bg-secondary-transparent rounded-pill">Client</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">14</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Houston</p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">14</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-orange-transparent d-inline-flex align-items-center badge-sm">
                        <i className="ti ti-point-filled me-1"></i>Confirmed
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a className="dropdown-item rounded-1" href="reservation-details.html"><i className="ti ti-eye me-1"></i>View Details</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="edit-reservation.html"><i className="ti ti-edit me-1"></i>Edit</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-05.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3470</a>
                          <h6 className="fs-14"><a href="car-details.html">Chevrolet Truck </a></h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="company-details.html" className="avatar avatar-rounded me-2 flex-shrink-0"><img src="assets/img/customer/customer-05.jpg" alt="" /></a>
                        <div>
                          <h6 className="mb-1 fs-14"><a href="company-details.html">Harvey Jimenez</a></h6>
                          <span className="badge bg-violet-transparent rounded-pill">Company</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">14</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Phoenix</p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="border rounded text-center flex-shrink-0 p-1 me-2">
                          <h5 className="mb-2 fs-16">15</h5>
                          <span className="fw-medium fs-12 bg-light p-1 rounded-1 d-inline-block text-gray-9">Feb, 2025</span>
                        </div>
                        <div>
                          <p className="text-gray-9 mb-0">Newyork </p>
                          <span className="fs-13">01:00 PM</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-danger-transparent d-inline-flex align-items-center badge-sm">
                        <i className="ti ti-point-filled me-1"></i>Rejected
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end p-2">
                          <li>
                            <a className="dropdown-item rounded-1" href="reservation-details.html"><i className="ti ti-eye me-1"></i>View Details</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="edit-reservation.html"><i className="ti ti-edit me-1"></i>Edit</a>
                          </li>
                          <li>
                            <a className="dropdown-item rounded-1" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-1"></i>Delete</a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <a href="car-details.html" className="avatar me-2 flex-shrink-0"><img src="assets/img/car/car-06.jpg" alt="" /></a>
                        <div>
                          <a href="reservation-details.html" className="text-info d-block mb-1">#BR3471</a>
                          <h6 className="fs-14"><a href="car-details.html">Etios Carmen </a></h6>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default App
