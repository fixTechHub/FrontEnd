import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaChartBar,
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
  FaDollarSign,
  FaCrown,
  FaCommentDots,
  FaMoneyBillWave,
  FaCertificate,
  FaClipboardList,
} from "react-icons/fa";

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchValue, setSearchValue] = useState("");

  const customStyles = {
    activeMenuItem: {
      background: "rgba(255, 159, 67, 0.1)",
      color: "#ff9f43",
      borderLeft: "3px solid #ff9f43",
      fontWeight: "bold",
      borderRadius: "0 24px 24px 0",
    },
    activeIcon: {
      color: "#ff9f43",
    },
    count: {
      backgroundColor: "#ff9f43",
      color: "#fff",
      borderRadius: "50px",
      fontSize: "11px",
      minWidth: "20px",
      height: "20px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "auto",
      padding: "0 6px",
    },
  };

  const handleSearchChange = (e) => setSearchValue(e.target.value);
  const clearSearch = () => setSearchValue("");

  const managementRoutes = [
    { 
      label: "Dashboard", 
      vietnameseLabel: "Bảng điều khiển",
      path: "/" 
    },
    { 
      label: "User Management", 
      vietnameseLabel: "Khách hàng",
      path: "/admin/user-management" 
    },
    { 
      label: "Technician Management", 
      vietnameseLabel: "Kĩ thuật viên",
      path: "/admin/technician-management" 
    },
    { 
      label: "Booking Management", 
      vietnameseLabel: "Đơn hàng",
      path: "/admin/booking-management" 
    },
    { 
      label: "Warranty Management", 
      vietnameseLabel: "Bảo hành",
      path: "/admin/warranty-management" 
    },
    { 
      label: "Service Management", 
      vietnameseLabel: "Dịch vụ",
      path: "/admin/service-management" 
    },
    { 
      label: "Category Management", 
      vietnameseLabel: "Danh mục",
      path: "/admin/category-management" 
    },
    { 
      label: "Coupon Management", 
      vietnameseLabel: "Mã giảm giá",
      path: "/admin/coupon-management" 
    },
    { 
      label: "Coupon Usage Management", 
      vietnameseLabel: "Sử dụng giảm giá",
      path: "/admin/coupon-usage-management" 
    },
    { 
      label: "Booking Report", 
      vietnameseLabel: "Báo cáo đơn",
      path: "/admin/report-management" 
    },
    { 
      label: "System Report", 
      vietnameseLabel: "Báo cáo hệ thống",
      path: "/admin/system-report-management" 
    },
    { 
      label: "Financial Management", 
      vietnameseLabel: "Lịch sử giao dịch",
      path: "/admin/financial-management" 
    },
    { 
      label: "Commission Config Management", 
      vietnameseLabel: "Hoa Hồng",
      path: "/admin/commission-config-management" 
    },
    { 
      label: "Technician Subscription Analytics", 
      vietnameseLabel: "Doanh thu",
      path: "/admin/technician-subscription-analytics" 
    },
    { 
      label: "Booking Status Logs", 
      vietnameseLabel: "Lịch sử trạng thái",
      path: "/admin/booking-status-log-management" 
    },
  ];

  const filteredRoutes = searchValue
    ? managementRoutes.filter(
        (r) =>
          r.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          r.vietnameseLabel.toLowerCase().includes(searchValue.toLowerCase()) ||
          r.path.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  const activeStyle = (path) => (currentPath === path ? customStyles.activeMenuItem : {});
  const activeIcon = (path) => (currentPath === path ? customStyles.activeIcon : {});

  return (
    <div className="position-fixed h-100 bg-white border-end shadow-sm" style={{ width: "260px" }}>
      {/* Logo + Search (sticky) */}
      <div className="position-sticky top-0 bg-white border-bottom z-3">
        <div className="p-4 text-center">
          <Link to="/" className="logo logo-normal">
            <img
              src="/img/logo.png"
              alt="Logo"
              className="img-fluid"
              style={{ 
                maxWidth: "180px", 
                height: "auto",
                objectFit: "contain"
              }}
            />
          </Link>
        </div>

        {/* Search box */}
        <div className="px-3 pb-3 position-relative">{/* <-- để dropdown định vị đúng */}
          <div
            className="d-flex align-items-center bg-light rounded-pill border px-3"
            style={{ height: "40px" }}
          >
            <FaSearch className="text-secondary me-2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border-0 bg-transparent w-100"
              style={{ outline: "none", fontSize: "14px" }}
              value={searchValue}
              onChange={handleSearchChange}
            />
            {searchValue && (
              <button
                className="bg-transparent border-0 text-secondary p-0"
                onClick={clearSearch}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchValue && (
            <div
              className="bg-white border rounded shadow-sm mt-2 position-absolute w-100"
              style={{ zIndex: 100, left: 0 }}
            >
              <ul className="list-unstyled mb-0">
                {filteredRoutes.length === 0 ? (
                  <li className="px-3 py-2 text-muted">Không có kết quả</li>
                ) : (
                  filteredRoutes.map((route) => (
                    <li key={route.path}>
                      <Link
                        to={route.path}
                        className="d-block px-3 py-2 text-decoration-none text-dark sidebar-search-result-item"
                        onClick={clearSearch}
                      >
                        <div>
                          <div className="fw-medium">{route.vietnameseLabel}</div>
                          <div className="text-muted" style={{ fontSize: "12px" }}>
                            {route.label}
                          </div>
                        </div>
                        <span className="text-muted ms-2" style={{ fontSize: "12px" }}>
                          {route.path}
                        </span>
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
      <div className="overflow-auto" style={{ height: "calc(100% - 130px)" }}>
        <ul className="list-unstyled m-0 p-0">
          {/* Màn hình chính */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Màn hình chính</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/")}
                >
                  <FaHome className="me-3" style={{ width: "20px", ...activeIcon("/") }} />
                  <span>Bảng điều khiển</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Người dùng */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Người dùng</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/user-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/user-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/user-management")}
                >
                  <FaUser
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/user-management") }}
                  />
                  <span>Khách hàng</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/technician-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/technician-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/technician-management")}
                >
                  <FaTools
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/technician-management") }}
                  />
                  <span>Kĩ thuật viên</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Báo cáo */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Báo cáo</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/report-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/report-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/report-management")}
                >
                  <FaClipboard
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/report-management") }}
                  />
                  <span>Báo cáo đơn hàng</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/system-report-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/system-report-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/system-report-management")}
                >
                  <FaFileAlt
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/system-report-management") }}
                  />
                  <span>Báo cáo hệ thống</span>
                </Link>
              </li>
              
              <li>
                <Link
                  to="/admin/technician-subscription-analytics"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/technician-subscription-analytics" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/technician-subscription-analytics")}
                >
                  <FaChartBar
                    className="me-3"
                    style={{
                      width: "20px",
                      ...activeIcon("/admin/technician-subscription-analytics"),
                    }}
                  />
                  <span>Doanh thu</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Quản lí */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Quản lí</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/coupon-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/coupon-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/coupon-management")}
                >
                  <FaTag
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/coupon-management") }}
                  />
                  <span>Mã giảm giá</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/category-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/category-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/category-management")}
                >
                  <FaListAlt
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/category-management") }}
                  />
                  <span>Danh mục</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/service-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/service-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/service-management")}
                >
                  <FaTag
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/service-management") }}
                  />
                  <span>Dịch vụ</span>
                </Link>
              </li>
              {/* <li>
                <Link to="/admin/commission-config-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/commission-config-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/commission-config-management" ? customStyles.activeMenuItem : {}}>
                  <FaCogs className="me-3" style={{width: '20px', ...(currentPath === "/admin/commission-config-management" ? customStyles.activeIcon : {})}} />
                  <span>Hoa Hồng</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/admin/feedback"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/feedback" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/feedback")}
                >
                  <FaCommentDots
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/feedback") }}
                  />
                  <span>Đánh giá</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/package"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/package" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/package")}
                >
                  <FaCrown
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/package") }}
                  />
                  <span>Gói thành viên</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/certificate"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/certificate" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/certificate")}
                >
                  <FaCertificate
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/certificate") }}
                  />
                  <span>Chứng chỉ</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Quản lí đơn hàng */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Quản lí đơn hàng</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/booking-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/booking-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/booking-management")}
                >
                  <FaCalendar
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/booking-management") }}
                  />
                  <span>Đơn hàng</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/coupon-usage-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/coupon-usage-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/coupon-usage-management")}
                >
                  <FaTags
                    className="me-3"
                    style={{
                      width: "20px",
                      ...activeIcon("/admin/coupon-usage-management"),
                    }}
                  />
                  <span>Sử dụng giảm giá</span>
                </Link>
              </li>
            </ul>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/warranty-management"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/warranty-management" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/warranty-management")}
                >
                  <FaShieldAlt
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/warranty-management") }}
                  />
                  <span>Bảo hành</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Quản lí tài chính */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Quản lí tài chính</span>
          </li>
          <li>
            <ul className="list-unstyled m-0 p-0">
              <li>
                <Link
                  to="/admin/withdraw"
                  className={`d-flex align-items-center text-decoration-none py-3 px-4 ${
                    currentPath === "/admin/withdraw" ? "" : "text-dark"
                  }`}
                  style={activeStyle("/admin/withdraw")}
                >
                  <FaMoneyBillWave
                    className="me-3"
                    style={{ width: "20px", ...activeIcon("/admin/withdraw") }}
                  />
                  <span>Tài chính</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Quản lí lịch sử */}
          <li
            className="text-uppercase text-muted px-4 pt-3 pb-2 mt-2"
            style={{ fontSize: "12px", letterSpacing: "1px" }}
          >
            <span>Quản lí lịch sử</span>
          </li>
          <li>
                 <Link to="/admin/booking-status-log-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/booking-status-log-management" ? "" : "text-dark"}`}
                       style={currentPath === "/admin/booking-status-log-management" ? customStyles.activeMenuItem : {}}>
                   <FaClipboardList className="me-3" style={{width: '20px', ...(currentPath === "/admin/booking-status-log-management" ? customStyles.activeIcon : {})}} />
                   <span>Lịch sử trạng thái</span>
                 </Link>
               </li>
               <li>
                <Link to="/admin/financial-management" className={`d-flex align-items-center text-decoration-none py-3 px-4 ${currentPath === "/admin/financial-management" ? "" : "text-dark"}`}
                      style={currentPath === "/admin/financial-management" ? customStyles.activeMenuItem : {}}>
                  <FaDollarSign className="me-3" style={{width: '20px', ...(currentPath === "/admin/financial-management" ? customStyles.activeIcon : {})}} />
                  <span>Lịch sử giao dịch</span>
                </Link>
              </li>
          {/* Add more menu sections as needed */}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
