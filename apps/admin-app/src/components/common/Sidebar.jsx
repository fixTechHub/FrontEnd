import { Link } from 'react-router-dom';
import { FaUser, FaCar, FaCalendarAlt, FaTicketAlt, FaClipboardList, FaChartBar, FaUsers, FaTools } from 'react-icons/fa';

import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link to="/" className="logo logo-normal">
          <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo.svg" alt="Logo" />
        </Link>
        <Link to="/" className="logo-small">
          <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-small.svg" alt="Logo Small" />
        </Link>
        <Link to="/" className="dark-logo">
          <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-white.svg" alt="Dark Logo" />
        </Link>
      </div>

      {/* Sidebar Content */}
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
                  <Link to="/">
                    <i className="ti ti-layout-dashboard"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="menu-title"><span>Users</span></li>
            <li>
              <ul>
                <li><Link to="/admin/user-management"><i className="ti ti-files"></i><span>User</span></Link></li>
                <li><Link to="/admin/technician-management"><i className="ti ti-calendar-bolt"></i><span>Technician</span></Link></li>                
              </ul>
            </li>

            <li className="menu-title"><span>Reports</span></li>
            <li>
              <ul>
                <li><Link to="/admin/report-management"><i className="ti ti-users-group"></i><span>Booking Report</span></Link></li>
                <li><Link to="/admin/system-report-management"><i className="ti ti-user-bolt"></i><span>System Report</span></Link></li>
              </ul>
            </li>

            <li className="menu-title"><span>Management</span></li>
            <li>
              <ul>
                <li><Link to="/admin/coupon-management"><i className="ti ti-message"></i><span>Coupon</span><span className="count">5</span></Link></li>
                <li><Link to="/admin/coupon-usage-management"><i className="ti ti-discount-2"></i><span>Coupon Usage</span></Link></li>
                <li><Link to="/admin/category-management"><i className="ti ti-discount-2"></i><span>Category</span></Link></li>
              </ul>
            </li>

            <li className="menu-title"><span>Booking Management</span></li>
            <li>
              <ul>
                <li><Link to="/admin/booking-management"><i className="ti ti-user-circle"></i><span>Booking</span></Link></li>
              </ul>
            </li>

            

            

            {/* Add more menu sections as needed */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
