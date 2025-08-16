import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaCar,
  FaCalendarAlt,
  FaTicketAlt,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaTools,
  FaHome,
  FaClipboard,
  FaCogs,
  FaFileAlt,
  FaTag,
  FaTags,
  FaListAlt,
  FaCalendar,
  FaSearch,
  FaTimes,
  FaShieldAlt,
  FaDollarSign
} from "react-icons/fa";


import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';


const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchValue, setSearchValue] = useState("");


  // Custom CSS classes for elements that don't have direct Bootstrap equivalents
  const customStyles = {
    activeMenuItem: {
      background: 'rgba(255, 159, 67, 0.1)',
      color: '#ff9f43',
      borderLeft: '3px solid #ff9f43',
      fontWeight: 'bold',
      borderRadius: '0 24px 24px 0'
    },
    activeIcon: {
      color: '#ff9f43'
    },
    count: {
      backgroundColor: '#ff9f43',
      color: '#fff',
      borderRadius: '50px',
      fontSize: '11px',
      minWidth: '20px',
      height: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
      padding: '0 6px'
    }
  };


  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };


  const clearSearch = () => {
    setSearchValue("");
  };


  const managementRoutes = [
    { label: 'Dashboard', path: '/' },
    { label: 'User Management', path: '/admin/user-management' },
    { label: 'Technician Management', path: '/admin/technician-management' },
    { label: 'Booking Management', path: '/admin/booking-management' },
    { label: 'Warranty Management', path: '/admin/warranty-management' },
    { label: 'Service Management', path: '/admin/service-management' },
    { label: 'Category Management', path: '/admin/category-management' },
    { label: 'Coupon Management', path: '/admin/coupon-management' },
    { label: 'Coupon Usage Management', path: '/admin/coupon-usage-management' },
    { label: 'Booking Report', path: '/admin/report-management' },
    { label: 'System Report', path: '/admin/system-report-management' },
    { label: 'Financial Management', path: '/admin/financial-management' },
    { label: 'Commission Config Management', path: '/admin/commission-config-management' },
    { label: 'Technician Subscription Analytics', path: '/admin/technician-subscription-analytics' },
  ];
  const filteredRoutes = searchValue
    ? managementRoutes.filter(r =>
        r.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        r.path.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];


  return (
    <div className="position-fixed h-100 bg-white border-end shadow-sm" style={{width: '260px'}}>
      {/* Logo section - always visible */}
      <div className="position-sticky top-0 bg-white border-bottom z-3">
        <div className="p-4 text-center">
          <Link to="/" className="logo logo-normal">
            <img
              src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo.svg"
              alt="Logo"
              className="img-fluid"
              style={{maxWidth: '100%'}}
            />
          </Link>
        </div>
       
        {/* Search box - sticky too */}
        <div className="px-3 pb-3">
          <div className="d-flex align-items-center bg-light rounded-pill border px-3" style={{height: '40px'}}>
            <FaSearch className="text-secondary me-2" />
            <input
              type="text"
              placeholder="Search"
              className="border-0 bg-transparent w-100"
              style={{outline: 'none', fontSize: '14px'}}
              value={searchValue}
              onChange={handleSearchChange}
            />
            {searchValue && (
              <button className="bg-transparent border-0 text-secondary p-0" onClick={clearSearch}>
                <FaTimes />
              </button>
            )}
          </div>
          {/* Search results dropdown */}
          {searchValue && (
            <div className="bg-white border rounded shadow-sm mt-2 position-absolute w-100" style={{zIndex: 100, left: 0}}>
              <ul className="list-unstyled mb-0">
                {filteredRoutes.length === 0 ? (
                  <li className="px-3 py-2 text-muted">Không có kết quả</li>
                ) : (
                  filteredRoutes.map(route => (
                    <li key={route.path}>
                      <Link
                        to={route.path}
                        className="d-block px-3 py-2 text-decoration-none text-dark sidebar-search-result-item"
                        onClick={clearSearch}
                      >
                        {route.label}
                        <span className="text-muted ms-2" style={{fontSize: '12px'}}>{route.path}</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>


      {/* Scrollable menu */}
      <div className="overflow-auto" style={{height: 'calc(100% - 130px)'}}>
        <ul className="list-unstyled m-0 p-0">
          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Màn hình chính</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/" ? "" : "text-dark"}`}
                      style={currentPath === "/" ? customStyles.activeMenuItem : {}}>
                  <FaHome className="me-3" style={{width: '20px', ...(currentPath === "/" ? customStyles.activeIcon : {})}} />
                  <span>Bảng điều khiển</span>
                </Link>
              </li>
            </ul>
          </li>


          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Người dùng</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/user-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/user-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/user-management" ? customStyles.activeMenuItem : {}}>
                  <FaUser className="me-3" style={{width: '20px', ...(currentPath === "/admin/user-management" ? customStyles.activeIcon : {})}} />
                  <span>Khách hàng</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/technician-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/technician-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/technician-management" ? customStyles.activeMenuItem : {}}>
                  <FaTools className="me-3" style={{width: '20px', ...(currentPath === "/admin/technician-management" ? customStyles.activeIcon : {})}} />
                  <span>Kĩ thuật viên</span>
                </Link>
              </li>
            </ul>
          </li>


          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Báo cáo</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/report-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/report-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/report-management" ? customStyles.activeMenuItem : {}}>
                  <FaClipboard className="me-3" style={{width: '20px', ...(currentPath === "/admin/report-management" ? customStyles.activeIcon : {})}} />
                  <span>Báo cáo đơn </span>
                </Link>
              </li>
              <li>
                <Link to="/admin/system-report-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/system-report-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/system-report-management" ? customStyles.activeMenuItem : {}}>
                  <FaFileAlt className="me-3" style={{width: '20px', ...(currentPath === "/admin/system-report-management" ? customStyles.activeIcon : {})}} />
                  <span>Báo cáo hệ thống</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/financial-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/financial-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/financial-management" ? customStyles.activeMenuItem : {}}>
                  <FaDollarSign className="me-3" style={{width: '20px', ...(currentPath === "/admin/financial-management" ? customStyles.activeIcon : {})}} />
                  <span>Financial Report</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/technician-subscription-analytics" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/technician-subscription-analytics" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/technician-subscription-analytics" ? customStyles.activeMenuItem : {}}>
                  <FaChartBar className="me-3" style={{width: '20px', ...(currentPath === "/admin/technician-subscription-analytics" ? customStyles.activeIcon : {})}} />
                  <span>Doanh thu</span>
                </Link>
              </li>
            </ul>
          </li>


          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Quản lí</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/coupon-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/coupon-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/coupon-management" ? customStyles.activeMenuItem : {}}>
                  <FaTag className="me-3" style={{width: '20px', ...(currentPath === "/admin/coupon-management" ? customStyles.activeIcon : {})}} />
                  <span>Mã giảm giá</span>
                </Link>
              </li>
              
              <li>
                <Link to="/admin/category-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/category-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/category-management" ? customStyles.activeMenuItem : {}}>
                  <FaListAlt className="me-3" style={{width: '20px', ...(currentPath === "/admin/category-management" ? customStyles.activeIcon : {})}} />
                  <span>Danh mục</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/service-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/service-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/service-management" ? customStyles.activeMenuItem : {}}>
                  <FaTag className="me-3" style={{width: '20px', ...(currentPath === "/admin/service-management" ? customStyles.activeIcon : {})}} />
                  <span>Dịch vụ</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/commission-config-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/commission-config-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/commission-config-management" ? customStyles.activeMenuItem : {}}>
                  <FaCogs className="me-3" style={{width: '20px', ...(currentPath === "/admin/commission-config-management" ? customStyles.activeIcon : {})}} />
                  <span>Hoa Hồng</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/feedback" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/commission-config-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/feedback" ? customStyles.activeMenuItem : {}}>
                  <FaCogs className="me-3" style={{width: '20px', ...(currentPath === "/admin/feedback" ? customStyles.activeIcon : {})}} />
                  <span>Đánh giá</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/package" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/commission-config-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/package" ? customStyles.activeMenuItem : {}}>
                  <FaCogs className="me-3" style={{width: '20px', ...(currentPath === "/admin/package" ? customStyles.activeIcon : {})}} />
                  <span>Gói thành viên</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/certificate" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/commission-config-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/certificate" ? customStyles.activeMenuItem : {}}>
                  <FaCogs className="me-3" style={{width: '20px', ...(currentPath === "/admin/certificate" ? customStyles.activeIcon : {})}} />
                  <span>Chứng chỉ</span>
                </Link>
              </li>
            </ul>
          </li>


          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Quản lí đơn hàng</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/booking-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/booking-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/booking-management" ? customStyles.activeMenuItem : {}}>
                  <FaCalendar className="me-3" style={{width: '20px', ...(currentPath === "/admin/booking-management" ? customStyles.activeIcon : {})}} />
                  <span>Đơn hàng</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/coupon-usage-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/coupon-usage-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/coupon-usage-management" ? customStyles.activeMenuItem : {}}>
                  <FaTags className="me-3" style={{width: '20px', ...(currentPath === "/admin/coupon-usage-management" ? customStyles.activeIcon : {})}} />
                  <span>Sử dụng giảm giá</span>
                </Link>
              </li>
            </ul>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/warranty-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/warranty-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/warranty-management" ? customStyles.activeMenuItem : {}}>
                  <FaShieldAlt  className="me-3" style={{width: '20px', ...(currentPath === "/admin/warranty-management" ? customStyles.activeIcon : {})}} />
                  <span>Bảo hành</span>
                </Link>
              </li>
            </ul>
          </li>
          <li className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2" style={{fontSize: '12px', letterSpacing: '1px'}}>
            <span>Quản lí tài chính</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link to="/admin/withdraw" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/booking-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/withdraw" ? customStyles.activeMenuItem : {}}>
                  <FaCalendar className="me-3" style={{width: '20px', ...(currentPath === "/admin/withdraw" ? customStyles.activeIcon : {})}} />
                  <span>Tài chính</span>
                </Link>
              </li>

            </ul>
            
          </li>
         
         
          {/* Add more menu sections as needed */}
        </ul>
      </div>
    </div>
  );
};


export default Sidebar;






