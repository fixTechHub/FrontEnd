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
