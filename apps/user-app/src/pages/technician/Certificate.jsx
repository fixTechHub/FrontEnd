// CertificateList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCertificates, deleteCertificate } from '../../features/technicians/technicianSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import { Link } from 'react-router-dom';
import UploadCertificateForm from './UploadCer';

const PAGE_SIZE = 5; // ✅ đổi số dòng mỗi trang ở đây

const CertificateList = () => {
  const dispatch = useDispatch();
  const { technician } = useSelector((state) => state.auth);
  const technicianId = technician?._id;
  const { certificates, loading, error, certificateUpload } = useSelector((state) => state.technician);

  const [openUpload, setOpenUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ✅ State cho image preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]);   // danh sách URL ảnh (lọc bỏ PDF)
  const [previewIndex, setPreviewIndex] = useState(0);  // vị trí đang xem

  // ✅ Phân trang
  const [page, setPage] = useState(1);
  const totalItems = certificates?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // khi danh sách thay đổi, đảm bảo page không vượt quá tổng trang
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedCertificates = useMemo(() => {
    if (!Array.isArray(certificates)) return [];
    const start = (page - 1) * PAGE_SIZE;
    return certificates.slice(start, start + PAGE_SIZE);
  }, [certificates, page]);

  useEffect(() => {
    if (technicianId) dispatch(getCertificates(technicianId));
  }, [technicianId, dispatch]);

  // Tự đóng modal khi upload xong + refresh list
  useEffect(() => {
    if (openUpload && certificateUpload?.fileUrl && !certificateUpload?.loading) {
      setOpenUpload(false);
      dispatch(getCertificates(technicianId));
    }
  }, [openUpload, certificateUpload?.fileUrl, certificateUpload?.loading, technicianId, dispatch]);

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Bị từ chối";
      default:
        return status;
    }
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

  // =========================
  // ✅ Image Preview helpers
  // =========================
  const getImageGallery = () => {
    if (!Array.isArray(certificates)) return [];
    return certificates
      .map(c => c?.fileUrl)
      .filter(Boolean)
      .filter(url => !url.toLowerCase().endsWith('.pdf'));
  };

  const openImagePreview = (startUrl) => {
    const gallery = getImageGallery();
    if (!gallery.length) return;
    const startIndex = Math.max(0, gallery.indexOf(startUrl));
    setPreviewList(gallery);
    setPreviewIndex(startIndex);
    setPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewList([]);
    setPreviewIndex(0);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setPreviewIndex(i => (i - 1 + previewList.length) % previewList.length);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setPreviewIndex(i => (i + 1) % previewList.length);
  };

  // Đóng viewer bằng phím ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeImagePreview(); };
    if (previewOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen]);

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

          <div>

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
                          {(!pagedCertificates || pagedCertificates.length === 0) ? (
                            <tr>
                              <td colSpan="5" className="text-center text-muted">Không có chứng chỉ nào.</td>
                            </tr>
                          ) : (
                            pagedCertificates.map((cert, index) => (
                              <tr key={cert._id}>
                                <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                                <td className="blog-img">
                                  {cert.fileUrl ? (
                                    cert.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-muted fst-italic" title="Mở PDF trong tab mới">
                                        Xem file PDF
                                      </a>
                                    ) : (
                                      <img
                                        src={cert.fileUrl}
                                        alt="Chứng chỉ"
                                        style={{ width: 80, height: 'auto', borderRadius: 5, cursor: 'zoom-in' }}
                                        onClick={() => openImagePreview(cert.fileUrl)}
                                      />
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
                                    {translateStatus(cert.status)}
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

                    {/* ✅ Pagination controls */}
                    <div className="cert-paging">
                      <button
                        className="btn btn-light"
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                      >
                        ‹ Trước
                      </button>

                      <div className="cert-pages">
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const p = i + 1;
                          return (
                            <button
                              key={p}
                              className={`cert-page ${p === page ? 'active' : ''}`}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        className="btn btn-light"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      >
                        Sau ›
                      </button>


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

                    {/* ✅ IMAGE PREVIEW MODAL */}
                    {previewOpen && (
                      <div className="imgviewer-backdrop" onClick={closeImagePreview}>
                        <div className="imgviewer" onClick={(e) => e.stopPropagation()}>
                          <img src={previewList[previewIndex]} alt="preview" />
                          {previewList.length > 1 && (
                            <>
                              <button className="imgviewer-nav imgviewer-prev" onClick={prevImage} aria-label="Prev">‹</button>
                              <button className="imgviewer-nav imgviewer-next" onClick={nextImage} aria-label="Next">›</button>
                            </>
                          )}
                        </div>
                        <button className="imgviewer-close" onClick={closeImagePreview} aria-label="Close">✕</button>
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

  /* ✅ Image Preview Modal (viewer) */
  .imgviewer-backdrop{
    position: fixed; inset: 0; z-index: 3000;
    background: rgba(0,0,0,.75);
    display: flex; align-items: center; justify-content: center;
  }
  .imgviewer{
    position: relative; max-width: 90vw; max-height: 90vh;
    background: transparent; border-radius: 12px; overflow: hidden;
  }
  .imgviewer img{
    max-width: 90vw; max-height: 90vh; display: block;
    object-fit: contain; background: #000;
  }
  .imgviewer-close{
    position: fixed; top: 18px; right: 18px;
    width: 40px; height: 40px; border-radius: 50%;
    border: 1px solid #ffffff33; color: #fff; background: #00000055;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .imgviewer-nav{
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid #ffffff33; color: #fff; background: #00000055;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .imgviewer-prev{ left: 10px; }
  .imgviewer-next{ right: 10px; }

  /* ✅ Căn cột & khoảng cách */
  .dashboard-table table { table-layout: fixed; width: 100%; }
  .dashboard-table th, .dashboard-table td {
    padding: 12px 16px;
    text-align: center;
    vertical-align: middle;
  }
  .dashboard-table th:nth-child(1), .dashboard-table td:nth-child(1) { width: 70px; }
  .dashboard-table th:nth-child(2), .dashboard-table td:nth-child(2) { width: 180px; min-width: 160px; }
  .dashboard-table th:nth-child(3), .dashboard-table td:nth-child(3) { width: 150px; }
  .dashboard-table th:nth-child(4), .dashboard-table td:nth-child(4) { width: 140px; }
  .dashboard-table th:nth-child(5), .dashboard-table td:nth-child(5) { width: 120px; }
  .dashboard-table td.blog-img { text-align: center !important; vertical-align: middle !important; }
  .dashboard-table td.blog-img img { display: block; margin-left: auto; margin-right: auto; }

  /* ✅ Pagination styles */
  .cert-paging{
  display:flex;
  align-items:center;
  justify-content:center;  /* căn giữa */
  gap:10px;
  margin-top: 12px;
  width: 100%;
}

.cert-pages{
  display:flex;
  gap:6px;
}

.cert-page{
  min-width:36px; height:36px; padding:0 10px;
  border:1px solid #e5e7eb; border-radius:8px; background:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
}

.cert-page.active{
  background:#1554d1; color:#fff; border-color:#1554d1;
}
`}</style>
    </div>
  );
};

export default CertificateList;
