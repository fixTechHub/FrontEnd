function AdminDashboard() {
    return (
        <>
            <Header />
            <div class="sidebar-inner slimscroll">
                <div id="sidebar-menu" class="sidebar-menu">

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
                        <li class="menu-title"><span>Main</span></li>
                        <li>
                            <ul>
                                <li className="active">
                                    <a href="">
                                        <i className="ti ti-layout-dashboard"></i>
                                        <span>Dashboard</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="menu-title"><span>Bookings</span></li>
                        <li>
                            <ul>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-files"></i><span>Reservations</span><span classname="track-icon"></span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-calendar-bolt"></i><span>Calendar</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-file-symlink"></i><span>Quotations</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-mail"></i><span>Enquiries</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i class="ti ti-star"></i><span>Reviews</span>
                                    </a>
                                </li>
                            </ul>
                        </li>


                        <li classname="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                        <li>
                            <ul>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-file-invoice"></i><span>Invoices</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-credit-card"></i><span>Payments</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li classname="menu-title"><span>OTHERS</span></li>
                        <li>
                            <ul>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-message"></i><span>Messages</span><span class="count">5</span>
                                    </a>
                                </li>

                            </ul>
                        </li>
                        <li classname="menu-title"><span>SUPPORT</span></li>
                        <li>
                            <ul>
                                <li>
                                    <a href="" >
                                        <i classname="ti ti-messages"></i><span>Contact Messages</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-speakerphone"></i><span>Announcements</span>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <li classname="menu-title"><span>REPORTS</span></li>
                        <li>
                            <ul>
                                <li>
                                    <a href="" >
                                        <i classname="ti ti-chart-histogram"></i><span>Income vs Expense</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-chart-line"></i><span>Earnings</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-chart-infographic"></i><span>Rentals</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li classname="menu-title"><span>AUTHENTICATION</span></li>
                        <li>
                            <ul>

                                <li>
                                    <a href="">
                                        <i classname="ti ti-mail-exclamation"></i><span>Email Verification</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i classname="ti ti-restore"></i><span>Reset Password</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li classname="menu-title"><span>SETTINGS & CONFIGURATION</span></li>
                        <li>
                            <ul>
                                <li classname="submenu">
                                    <a href="javascript:void(0);">
                                        <i classname="ti ti-user-cog"></i><span>Account Settings</span>
                                        <span classname="menu-arrow"></span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="">Profile</a>
                                        </li>
                                        <li>
                                            <a href="">Security</a>
                                        </li>
                                        <li>
                                            <a href="">Notifications</a>
                                        </li>
                                        <li>
                                            <a href="">Integrations</a>
                                        </li>

                                    </ul>
                                </li>




                                <li classname="submenu">
                                    <a href="javascript:void(0);">
                                        <i classname="ti ti-settings-dollar"></i><span>Finance Settings</span>
                                        <span classname="menu-arrow"></span>
                                    </a>
                                    <ul>
                                        <li>
                                            <a href="">Payment Methods</a>
                                        </li>
                                        <li>
                                            <a href="">Bank Accounts</a>
                                        </li>
                                        <li>
                                            <a href="">Tax Rates</a>
                                        </li>
                                        <li>
                                            <a href="">Currencies</a>
                                        </li>
                                    </ul>
                                </li>

                            </ul>
                        </li>


                    </ul>
                </div>
            </div>
        </>
    )
}