// import "../../../public/css/style.css";
// import TechnicianStatus from '../../pages/technician-dashboard/TechnicianStatus';
// import { useParams } from 'react-router-dom';

// function Header() {
//     const { technicianId } = useParams();
//     return (
//         <div className="header">
//             <div className="main-header">


//                 <div className="header-user">
//                     <div className="nav user-menu nav-list">
//                         <div className="me-auto d-flex align-items-center" id="header-search">
//                             <a id="toggle_btn" href="#">
//                                 <i className="ti ti-menu-deep"></i>
//                             </a>
//                             <div className="row d-flex flex-fill">
                                
//                                     <div>
//                                         <h6 className="mb-1">Status: </h6>
//                                     </div>
//                                     <div>
//                                         <TechnicianStatus technicianId={technicianId} />
//                                     </div>
                                
//                             </div>
//                         </div>

//                         <div className="notification_item">
//                             <a href="#" className="btn btn-menubar position-relative" id="notification_popup" data-bs-toggle="dropdown" data-bs-auto-close="outside">
//                                 <i className="ti ti-bell"></i>
//                                 <span className="badge bg-violet rounded-pill"></span>
//                             </a>
//                             <div className="dropdown-menu dropdown-menu-end notification-dropdown">
//                                 <div className="topnav-dropdown-header pb-0">
//                                     <h5 className="notification-title">Notifications</h5>
//                                     <ul className="nav nav-tabs nav-tabs-bottom">
//                                         <li className="nav-item">
//                                             <a className="nav-link active" href="#active-notification" data-bs-toggle="tab">
//                                                 Active <span className="badge badge-xs rounded-pill bg-danger ms-2">5</span>
//                                             </a>
//                                         </li>
//                                         <li className="nav-item">
//                                             <a className="nav-link" href="#unread-notification" data-bs-toggle="tab">
//                                                 Unread
//                                             </a>
//                                         </li>
//                                         <li className="nav-item">
//                                             <a className="nav-link" href="#archieve-notification" data-bs-toggle="tab">
//                                                 Archieve
//                                             </a>
//                                         </li>
//                                     </ul>
//                                 </div>

//                                 <div className="noti-content">
//                                     <div className="tab-content">
//                                         <div className="tab-pane fade show active" id="active-notification">
//                                             {/* Active notifications go here */}
//                                         </div>
//                                         <div className="tab-pane fade" id="unread-notification">
//                                             {/* Unread notifications go here */}
//                                         </div>
//                                         <div className="tab-pane fade" id="archieve-notification">
//                                             <div className="d-flex justify-content-center align-items-center p-3">
//                                                 <div className="text-center">
//                                                     <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/icons/nodata.svg" className="mb-2" alt="No data" />
//                                                     <p className="text-gray-5">No Data Available</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="d-flex align-items-center justify-content-between topnav-dropdown-footer">
//                                     <div className="d-flex align-items-center">
//                                         <a href="#" className="link-primary text-decoration-underline me-3">Mark all as Read</a>
//                                         <a href="#" className="link-danger text-decoration-underline">Clear All</a>
//                                     </div>
//                                     <a href="#" className="btn btn-primary btn-sm d-inline-flex align-items-center">
//                                         View All Notifications <i className="ti ti-chevron-right ms-1"></i>
//                                     </a>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="dropdown profile-dropdown">
//                             <a href="#" className="d-flex align-items-center" data-bs-toggle="dropdown" data-bs-auto-close="outside">
//                                 <span className="avatar avatar-sm">
//                                     <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-05.jpg" alt="User Avatar" className="img-fluid rounded-circle" />
//                                 </span>
//                             </a>
//                             <div className="dropdown-menu">
//                                 <div className="profileset d-flex align-items-center">
//                                     <span className="user-img me-2">
//                                         <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/profiles/avatar-05.jpg" alt="User" />
//                                     </span>
//                                     <div>
//                                         <h6 className="fw-semibold mb-1">Andrew Simmonds</h6>
//                                         <p className="fs-13">
//                                             <a href="mailto:[email protected]">[email protected]</a>
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <a className="dropdown-item d-flex align-items-center" href="/admin/profile-setting.html">
//                                     <i className="ti ti-user-edit me-2"></i>Edit Profile
//                                 </a>
//                                 <a className="dropdown-item d-flex align-items-center" href="/admin/payments.html">
//                                     <i className="ti ti-credit-card me-2"></i>Payments
//                                 </a>
//                                 <div className="dropdown-divider my-2"></div>
//                                 <div className="dropdown-item">
//                                     <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between">
//                                         <label className="form-check-label" htmlFor="notify">
//                                             <i className="ti ti-bell me-2"></i>Notifications
//                                         </label>
//                                         <input className="form-check-input" type="checkbox" role="switch" id="notify" defaultChecked />
//                                     </div>
//                                 </div>
//                                 <a className="dropdown-item d-flex align-items-center" href="#">
//                                     <i className="ti ti-logout me-2"></i>Logout
//                                 </a>
//                             </div>
//                         </div>

//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default Header;
