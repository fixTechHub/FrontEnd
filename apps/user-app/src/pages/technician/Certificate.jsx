// CertificateList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCertificates, deleteCertificate } from '../../features/technicians/technicianSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import { Link } from 'react-router-dom';
import UploadCertificateForm from './UploadCer';

const CertificateList = () => {
  const dispatch = useDispatch();
  const { technician } = useSelector((state) => state.auth);
  const technicianId = technician?._id;
  const { certificates, loading, error, certificateUpload } = useSelector((state) => state.technician);

  const [openUpload, setOpenUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (technicianId) dispatch(getCertificates(technicianId));
  }, [technicianId, dispatch]);

  // Tự đóng modal khi upload xong + refresh list
  useEffect(() => {
    if (openUpload && certificateUpload?.fileUrl && !certificateUpload?.loading) {
      setOpenUpload(false);
      // if (technicianId)
         dispatch(getCertificates(technicianId));
    }
  }, [openUpload, certificateUpload?.fileUrl, certificateUpload?.loading, technicianId, dispatch]);

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!technicianId || !selectedId) return;
    try {
      setDeletingId(selectedId);
      const action = await dispatch(deleteCertificate({ technicianId, certificateId: selectedId }));
      if (!action?.error) {
        await dispatch(getCertificates(technicianId));
        setShowModal(false);
        setSelectedId(null);
      } else {
        console.error('Delete failed:', action?.payload || action?.error);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Đang tải chứng chỉ...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="main-wrapper">
      <Header />
      <BreadcrumbBar />

      <div className="dashboard-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="dashboard-menu">
                                    <ul>
                                        <li>
                                            <Link to={`/technician`} >
                                                <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Bảng điểu khiển</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} >
                                                <img src="/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>Đơn hàng</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/feedback">
                                                <img src="/img/icons/review-icon.svg" alt="Icon" />
                                                <span>Đánh giá</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/${technicianId}/certificate`} className="active">
                                                <img style={{ height: '28px' }} src="/img/cer.png" alt="Icon" />
                                                <span>Chứng chỉ</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/schedule">
                                                <img src="/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>Lịch trình</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/deposit" >
                                                <img src="/img/icons/wallet-icon.svg" alt="Icon" />
                                                <span>Ví của tôi</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/earning`} >
                                                <img src="/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>Thu nhập</span>
                                            </Link>
                                        </li>
                                        {/* <li>
                                            <Link to={`/profile`}>
                                                <img src="/img/icons/settings-icon.svg" alt="Icon" />
                                                <span>Cái đặt</span>
                                            </Link>
                                        </li> */}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

      <div className="content">
        <div className="container">

          <div >
            

            <div className="col-lg-9">
              <div className="settings-info">
                <div className="settings-sub-heading d-flex justify-content-between align-items-center mb-6">
                  <h4>Danh sách chứng chỉ:</h4>
                  <button className="btn btn-primary" onClick={() => setOpenUpload(true)}>+ Thêm chứng chỉ</button>
                </div>

                <div className="profile-info-grid">
                  <div className="card-body">
                    <div className="table-responsive dashboard-table">
                      <table className="table table-bordered align-middle">
                        <thead className="thead-light">
                          <tr>
                            <th style={{ width: 70 }}>STT</th>
                            <th>Hình ảnh</th>
                            <th style={{ width: 150 }}>Ngày tạo</th>
                            <th style={{ width: 140 }}>Trạng thái</th>
                            <th style={{ width: 120 }}>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!certificates || certificates.length === 0) ? (
                            <tr>
                              <td colSpan="5" className="text-center text-muted">Không có chứng chỉ nào.</td>
                            </tr>
                          ) : (
                            certificates.map((cert, index) => (
                              <tr key={cert._id}>
                                <td>{index + 1}</td>
                                <td className="blog-img">
                                  {cert.fileUrl ? (
                                    cert.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-muted fst-italic">
                                        Xem file PDF
                                      </a>
                                    ) : (
                                      <img src={cert.fileUrl} alt="Chứng chỉ" style={{ width: 80, height: 'auto', borderRadius: 5 }} />
                                    )
                                  ) : <span className="text-muted">Không có tệp</span>}
                                </td>
                                <td>{new Date(cert.createdAt).toLocaleDateString('vi-VN')}</td>
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
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => { setSelectedId(cert._id); setShowModal(true); }}
                                    disabled={deletingId === cert._id}
                                  >
                                    {deletingId === cert._id ? 'Đang xóa...' : 'Xóa'}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Modal XÓA */}
                    {showModal && (
                      <div className="modal fade show" style={{ display: 'block' }} onClick={() => setShowModal(false)}>
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Xác nhận xóa</h5>
                              <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <div className="modal-body">
                              <p>Bạn có chắc muốn xóa chứng chỉ này không?</p>
                            </div>
                            <div className="modal-footer">
                              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                              <button className="btn btn-danger" onClick={confirmDelete}>Xóa</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modal UPLOAD */}
                    {openUpload && (
                      <div className="acm-backdrop" onClick={() => setOpenUpload(false)}>
                        <div className="acm-modal" onClick={(e) => e.stopPropagation()}>
                          <div className="acm-head">
                            <h5 className="acm-title">Tải lên chứng chỉ</h5>
                            <button type="button" className="acm-close" onClick={() => setOpenUpload(false)} title="Đóng">✕</button>
                          </div>
                          <div className="acm-body">
                            <UploadCertificateForm technicianId={technicianId} />
                          </div>
                        </div>
                      </div>
                    )}


                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
  .acm-backdrop{
    position: fixed; inset: 0;
    background: rgba(15,23,42,.55);
    backdrop-filter: blur(2px);
    display:flex; align-items:center; justify-content:center;
    z-index: 2000;
  }
  .acm-modal{
    width: 100%; max-width: 640px;
    background:#fff; border:1px solid #e6eaf2; border-radius:16px;
    box-shadow:0 30px 80px rgba(2,6,23,.25); overflow:hidden;
  }
  .acm-head{
    background: linear-gradient(180deg,#fff,#f9fbff);
    border-bottom:1px solid #edf0f6;
    padding:14px 16px; display:flex; align-items:center; justify-content:space-between;
  }
  .acm-title{ margin:0; font-weight:800; letter-spacing:.2px; color:#0f172a; }
  .acm-close{
    width:36px; height:36px; border-radius:8px;
    border:1px solid #e5e7eb; background:#fff; display:inline-flex; align-items:center; justify-content:center;
  }
  .acm-body{ padding:16px; max-height:70vh; overflow:auto; background:#fff; }

  /* Styles cho form upload (đang dùng trong UploadCer.jsx) */
  .ucf-drop{ position:relative; border:1px dashed #cfd8e3; border-radius:12px; background:#fafbff; padding:16px; text-align:center; }
  .ucf-help{ margin:6px 0 0; color:#64748b; font-size:13px; }
  .ucf-preview{ margin-top:14px; display:flex; gap:16px; align-items:center; flex-wrap:wrap; background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:12px; }
  .ucf-thumb{ position:relative; width:160px; height:110px; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb; background:#f1f5f9; flex:0 0 160px; }
  .ucf-thumb img{ width:100%; height:100%; object-fit:cover; }
  .ucf-remove{ position:absolute; top:6px; right:6px; border:0; border-radius:8px; background:rgba(0,0,0,.55); color:#fff; padding:4px 8px; font-size:12px; cursor:pointer; }
  .ucf-meta{ font-size:13px; color:#334155; }
  .ucf-actions{ display:flex; gap:10px; margin-top:12px; }
`}</style>
    </div>
  );
};

export default CertificateList;
