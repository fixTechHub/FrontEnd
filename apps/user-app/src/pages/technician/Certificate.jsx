// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getCertificates } from '../../features/technicians/technicianSlice';
// import BreadcrumbBar from '../../components/common/BreadcrumbBar';
// import Header from '../../components/common/Header';
// import { useParams } from 'react-router-dom';
// import { Link } from 'react-router-dom';
// import UploadCertificateForm from './UploadCer';
// import { useState } from 'react';


// const CertificateList = () => {
//   const dispatch = useDispatch();
//   const { technician } = useSelector((state) => state.auth);
//   const technicianId = technician._id;
//   const { certificates, loading, error } = useSelector((state) => state.technician);
//   console.log("cer", certificates);
//   const [showUploadForm, setShowUploadForm] = useState(false);

//   useEffect(() => {
//     if (technicianId) {
//       dispatch(getCertificates(technicianId));
//     }
//   }, [technicianId]);

//   if (loading) return <p>Đang tải chứng chỉ...</p>;
//   if (error) return <p>Lỗi: {error}</p>;



//   const toggleUploadForm = () => {
//     setShowUploadForm(prev => !prev);
//   };
//   return (
//     <div className="main-wrapper">
//       <Header />

//       <BreadcrumbBar />

//       <div className="content">
//         <div className="container">


//           <div className="content-header content-settings-header">
//             <h4>Settings</h4>
//           </div>

//           <div className="row">
//             <div className="col-lg-3 theiaStickySidebar">
//               <div className="settings-widget">
//                 <div className="settings-menu">
//                   <ul>
//                     <li>
//                       <Link to={`/technician/profile/${technicianId}`}>
//                         <i className="feather-user"></i>
//                         <span>Profile</span>
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="active" to={`/technician/${technicianId}/certificte`}>
//                         <i className="feather-shield"></i>
//                         <span>Certificates</span>
//                       </Link>

//                     </li>
//                     <li>
//                       <a href="/user-preferences.html">
//                         <i className="feather-star"></i> Preferences
//                       </a>
//                     </li>
//                     <li>
//                       <a href="/user-notifications.html">
//                         <i className="feather-bell"></i> Notifications
//                       </a>
//                     </li>
//                     <li>
//                       <a href="/user-integration.html">
//                         <i className="feather-git-merge"></i> Integration
//                       </a>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//             <div className="col-lg-9">
//               <div className="settings-info">
//                 <div className="settings-sub-heading">
//                   <h4>Danh sách chứng chỉ:</h4>
//                   <button onClick={toggleUploadForm}>
//                     {showUploadForm ? 'Đóng' : 'Thêm chứng chỉ'}
//                   </button>
//                   {showUploadForm && <UploadCertificateForm />}
//                 </div>
//                 <div className="profile-info-grid">
//                   <div class="card-body">
//                     <div class="table-responsive dashboard-table">
//                       <table className="table datatable">
//                         <thead className="thead-light">
//                           <tr>
//                             <th>STT</th>
//                             <th>Hình ảnh</th>
//                             <th>Ngày tạo</th>
//                             <th>Trạng thái</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {certificates.map((cert, index) => (
//                             <tr key={cert._id}>
//                               <td>{index + 1}</td>
//                               <td className='blog-img'>
//                                 {cert.fileUrl ? (
//                                   cert.fileUrl.endsWith('.pdf') ? (
//                                     <span style={{ color: '#888', fontStyle: 'italic' }}>File PDF</span>
//                                   ) : (
//                                     <img
//                                       src={cert.fileUrl}
//                                       alt="Chứng chỉ"
//                                     />
//                                   )
//                                 ) : (
//                                   'Không có tệp'
//                                 )}
//                               </td>
//                               <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
//                               <td>
//                                 <span
//                                   className={
//                                     cert.status === 'APPROVED'
//                                       ? 'badge badge-light-success'
//                                       : cert.status === 'REJECTED'
//                                         ? 'badge badge-light-danger'
//                                         : 'badge badge-light-warning'
//                                   }
//                                 >{cert.status}</span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CertificateList;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCertificates } from '../../features/technicians/technicianSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import { useParams, Link } from 'react-router-dom';
import UploadCertificateForm from './UploadCer';

const CertificateList = () => {
  const dispatch = useDispatch();
  const { technician } = useSelector((state) => state.auth);
  const technicianId = technician?._id;
  const { certificates, loading, error } = useSelector((state) => state.technician);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (technicianId) {
      dispatch(getCertificates(technicianId));
    }
  }, [technicianId]);

  const toggleUploadForm = () => {
    setShowUploadForm((prev) => !prev);
  };

  if (loading) return <p>Đang tải chứng chỉ...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="main-wrapper">
      <Header />
      <BreadcrumbBar />

      <div className="content">
        <div className="container">
          <div className="content-header content-settings-header">
            <h4>Cài đặt</h4>
          </div>

          <div className="row">
            <div className="col-lg-3 theiaStickySidebar">
              <div className="settings-widget">
                <div className="settings-menu">
                  <ul>
                    <li>
                      <Link to={`/technician/profile/${technicianId}`}>
                        <i className="feather-user"></i>
                        <span>Hồ sơ</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="active" to={`/technician/${technicianId}/certificate`}>
                        <i className="feather-shield"></i>
                        <span>Chứng chỉ</span>
                      </Link>
                    </li>
                    <li>
                      <a href="/user-preferences.html">
                        <i className="feather-star"></i> Tùy chọn
                      </a>
                    </li>
                    <li>
                      <a href="/user-notifications.html">
                        <i className="feather-bell"></i> Thông báo
                      </a>
                    </li>
                    <li>
                      <a href="/user-integration.html">
                        <i className="feather-git-merge"></i> Tích hợp
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="settings-info">
                <div className="settings-sub-heading d-flex justify-content-between align-items-center mb-3">
                  <h4>Danh sách chứng chỉ:</h4>
                  <button
                    className={`btn ${showUploadForm ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={toggleUploadForm}
                  >
                    {showUploadForm ? 'Đóng' : 'Thêm chứng chỉ'}
                  </button>
                </div>

                {showUploadForm && <UploadCertificateForm />}

                <div className="profile-info-grid">
                  <div className="card-body">
                    <div className="table-responsive dashboard-table">
                      <table className="table table-bordered">
                        <thead className="thead-light">
                          <tr>
                            <th>STT</th>
                            <th>Hình ảnh</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certificates.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center text-muted">
                                Không có chứng chỉ nào.
                              </td>
                            </tr>
                          ) : (
                            certificates.map((cert, index) => (
                              <tr key={cert._id}>
                                <td>{index + 1}</td>
                                <td className="blog-img">
                                  {cert.fileUrl ? (
                                    cert.fileUrl.endsWith('.pdf') ? (
                                      <span className="text-muted fst-italic">File PDF</span>
                                    ) : (
                                      <img
                                        src={cert.fileUrl}
                                        alt="Chứng chỉ"
                                        style={{ width: '80px', height: 'auto', borderRadius: '5px' }}
                                      />
                                    )
                                  ) : (
                                    <span className="text-muted">Không có tệp</span>
                                  )}
                                </td>
                                <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <span
                                    className={
                                      cert.status === 'APPROVED'
                                        ? 'badge badge-light-success'
                                        : cert.status === 'REJECTED'
                                          ? 'badge badge-light-danger'
                                          : 'badge badge-light-warning'
                                    }
                                  >
                                    {cert.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* End content */}
    </div> // End main wrapper
  );
};

export default CertificateList;
