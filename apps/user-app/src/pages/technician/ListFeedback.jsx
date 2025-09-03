// src/pages/technician/ListFeedback.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import { Link } from 'react-router-dom';

// ⚠️ dùng slice FEEDBACK mới (singular: feedback)
import {
  fetchFeedbacksByTechnician,
  submitFeedbackReplyThunk,
  clearMessages,
  setFeedbackPage,
} from '../../features/feedbacks/feedbackSlice';

const ListFeedback = () => {
  const dispatch = useDispatch();

  // Auth: technicianId để gọi API
  const { technician } = useSelector((s) => s.auth);
  const technicianId = technician?._id || null;

  // State từ slice feedback
  const {
    items: feedbacks,
    loading,
    successMessage,
    errorMessage,
    page,
    totalPages,
    limit,
  } = useSelector((s) => s.feedback);

  // UI state cho modal trả lời
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ✅ UI state cho Image Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]);   // mảng URL ảnh của feedback đang xem
  const [previewIndex, setPreviewIndex] = useState(0);  // vị trí đang xem

  // Load list lần đầu & khi page đổi
  useEffect(() => {
    if (technicianId) {
      dispatch(fetchFeedbacksByTechnician({ technicianId, page, limit }));
    }
  }, [dispatch, technicianId, page, limit]);

  // Clear message khi unmount
  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const openReply = (fb) => {
    dispatch(clearMessages());
    setSelectedFeedback(fb);
    setReplyText(fb?.reply?.content || ''); // nếu có reply cũ thì nạp vào để sửa
    setIsOpen(true);
  };

  const closeReply = () => {
    setIsOpen(false);
    setSelectedFeedback(null);
    setReplyText('');
  };

  const submitReply = async () => {
    const feedbackId = selectedFeedback?._id;
    const content = replyText.trim();
    if (!feedbackId || !content) return;

    const action = await dispatch(
      submitFeedbackReplyThunk({ feedbackId, reply: content })
    );

    if (submitFeedbackReplyThunk.fulfilled.match(action)) {
      // refresh danh sách để cập nhật reply
      dispatch(fetchFeedbacksByTechnician({ technicianId, page, limit }));
      closeReply();
    }
    // nếu fail -> errorMessage hiển thị, modal vẫn mở để sửa
  };

  const goPrev = () => {
    if (page > 1) dispatch(setFeedbackPage(page - 1));
  };
  const goNext = () => {
    if (page < totalPages) dispatch(setFeedbackPage(page + 1));
  };

  // =======================
  // ✅ Image Preview helpers
  // =======================
  const openImagePreview = (urls = [], index = 0) => {
    if (!Array.isArray(urls) || urls.length === 0) return;
    setPreviewList(urls);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };
  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewList([]);
    setPreviewIndex(0);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((i) => (i - 1 + previewList.length) % previewList.length);
  };
  const nextImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((i) => (i + 1) % previewList.length);
  };

  // Đóng viewer bằng phím ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeImagePreview(); };
    if (previewOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  return (
    <>
      {/* CSS trong trang */}
      <style>{`
        :root { --border:#e8eef5; --text:#0f172a; --muted:#667085; --soft:#f7f9fc; }
        .lf-wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
        .lf-card { background:#fff; border:1px solid var(--border); border-radius:14px; box-shadow:0 8px 24px rgba(16,24,40,.06); overflow:hidden; }
        .lf-head { padding:18px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .lf-title { margin:0; font-size:20px; font-weight:700; color:var(--text); }
        .lf-actions { display:flex; gap:8px; }
        .lf-iconbtn { width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--border); border-radius:10px; background:var(--soft); color:#344054; }

        .lf-table-wrap{ padding:16px 20px 0; }
        .lf-table{ width:100%; border-collapse:separate; border-spacing:0; }
        .lf-table thead th{ text-align:left; font-size:13px; color:#475467; font-weight:700; background:var(--soft); padding:12px 14px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
        .lf-table tbody td{ padding:14px; border-bottom:1px solid var(--border); vertical-align:top; color:#101828; }
        .lf-row:hover td{ background:#fbfdff; }
        .lf-user{ display:flex; align-items:center; gap:10px; }
        .lf-user__avatar{ width:34px; height:34px; border-radius:50%; background:#eef2f7; flex:0 0 34px; overflow:hidden; }
        .lf-user__avatar img{ width:100%; height:100%; object-fit:cover; }
        .lf-user__name{ font-weight:600; }
        .lf-content{ color:#344054; max-width:520px; }
        .lf-content small{ display:block; color:var(--muted); margin-top:4px; }
        .lf-rating{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:#fff7e6; color:#9a6a03; border:1px solid #ffe2ad; font-weight:700; font-size:12px; }
        .lf-imgs{ display:flex; gap:8px; flex-wrap:wrap; }
        .lf-imgThumb{ width:72px; height:72px; object-fit:cover; border-radius:10px; border:1px solid var(--border); cursor: zoom-in; }
        .lf-empty{ padding:26px; text-align:center; color:var(--muted); }

        .lf-btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; font-weight:600; border-radius:10px; border:1px solid var(--border); background:#ffffff; color:#1d2939; cursor:pointer; transition:.15s; }
        .lf-btn:hover{ background:#f3f6fb; }
        .lf-btn--primary{ background:#1554d1; border-color:#1554d1; color:#fff; }
        .lf-btn--primary[disabled]{ opacity:.6; cursor:not-allowed; }

        .alert{ margin:12px 20px 0; padding:10px 12px; border-radius:10px; font-weight:600; }
        .alert--success{ background:#eaf8f0; color:#1e7d4e; border:1px solid #cdebd8; }
        .alert--error{ background:#ffeef0; color:#b42318; border:1px solid #ffd1d6; }

        .modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:50; }
        .modal{ width:100%; max-width:560px; background:#fff; border-radius:14px; border:1px solid var(--border); box-shadow:0 20px 60px rgba(0,0,0,.2); overflow:hidden; }
        .modal__head{ padding:16px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
        .modal__title{ margin:0; font-size:18px; font-weight:700; color:#0f172a; }
        .modal__body{ padding:18px; }
        .modal__foot{ padding:14px 18px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; }
        .textarea{ width:100%; min-height:120px; resize:vertical; border:1px solid var(--border); border-radius:10px; padding:10px 12px; font-size:14px; outline:none; }
        .textarea:focus{ border-color:#c1d4ff; box-shadow:0 0 0 3px #eef4ff; }
        .charcount{ margin-top:6px; font-size:12px; color:#667085; text-align:right; }

        .lf-foot{ padding:14px 20px 18px; display:flex; align-items:center; justify-content:space-between; }

        /* ✅ ép 2 nút Phản hồi / Sửa phản hồi bằng nhau */
        .lf-btn--equal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 140px;                /* cố định chiều rộng */
          height: 38px;                /* cố định chiều cao */
          border: 1px solid var(--border) !important;
          border-radius: 10px !important;
          font-weight: 600;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .lf-btn--equal i { line-height: 1; }

        /* ✅ Image Preview Modal */
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
      `}</style>

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
                      <Link to={`/technician`}>
                        <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                        <span>Bảng điểu khiển</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/technician/booking`}>
                        <img src="/img/icons/booking-icon.svg" alt="Icon" />
                        <span>Đơn hàng</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/technician/feedback" className="active">
                        <img src="/img/icons/review-icon.svg" alt="Icon" />
                        <span>Đánh giá</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/technician/${technicianId}/certificate`}>
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
                      <Link to="/technician/deposit">
                        <img src="/img/icons/wallet-icon.svg" alt="Icon" />
                        <span>Ví của tôi</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/technician/earning`}>
                        <img src="/img/icons/payment-icon.svg" alt="Icon" />
                        <span>Thu nhập</span>
                      </Link>
                    </li>
                     <li><Link to={`/technician/warranty`}><img style={{ height: '28px' }} src="/img/icons/service-07.svg" alt="Icon" /><span>Bảo hành</span></Link></li>
                    {/* <li>
                      <Link to={`/profile`}>
                        <img src="/img/icons/settings-icon.svg" alt="Icon" />
                        <span>Cài đặt</span>
                      </Link>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lf-wrap">
          <div className="lf-card">
            <div className="lf-head">
              <h4 className="lf-title">Đánh giá của tôi</h4>
              <div className="lf-actions">
                <button className="lf-iconbtn" title="Danh sách"><i className="fa-solid fa-list" /></button>
                <button className="lf-iconbtn" title="Lịch"><i className="fa-solid fa-calendar-days" /></button>
              </div>
            </div>

            {/* Thông báo */}
            {successMessage && <div className="alert alert--success">{successMessage}</div>}
            {errorMessage && <div className="alert alert--error">{errorMessage}</div>}

            <div className="lf-table-wrap">
              <div className="table-responsive dashboard-table">
                <table className="lf-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Nội dung</th>
                      <th>Đánh giá</th>
                      <th>Hình ảnh</th>
                      <th>Phản hồi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan="5" className="lf-empty">Đang tải...</td></tr>
                    )}

                    {!loading && Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                      feedbacks.map((item, idx) => (
                        <tr className="lf-row" key={item?._id || idx}>
                          <td>
                            <div className="lf-user">
                              <span className="lf-user__avatar">
                                {item?.fromUser?.avatar && <img src={item.fromUser.avatar} alt="avatar" />}
                              </span>
                              <div>
                                <div className="lf-user__name">
                                  {item?.fromUser?.fullName || item?.fromUser?.name || 'Ẩn danh'}
                                </div>
                                <div className="lf-badge">{item?.fromUser?.email || '—'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="lf-content">
                            {item?.content || '—'}
                            {item?.createdAt && (
                              <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
                            )}
                            {/* Hiện reply nếu có */}
                            {item?.reply?.content && (
                              <small style={{ display: 'block', marginTop: 6, color: '#1554d1' }}>
                                <strong>Phản hồi của kỹ thuật viên:</strong> {item.reply.content}
                              </small>
                            )}
                          </td>

                          <td>
                            <span className="lf-rating">
                              {item?.rating ?? 0} <i className="fas fa-star"></i>
                            </span>
                          </td>

                          <td>
                            {Array.isArray(item?.images) && item.images.length > 0 ? (
                              <div className="lf-imgs">
                                {item.images.slice(0, 3).map((url, i) => (
                                  <img
                                    className="lf-imgThumb"
                                    src={url}
                                    alt={`feedback-${i}`}
                                    key={i}
                                    onClick={() => openImagePreview(item.images, i)}  // ✅ mở preview
                                  />
                                ))}
                                {item.images.length > 3 && (
                                  <button
                                    className="lf-btn"
                                    style={{ padding: '6px 10px' }}
                                    onClick={() => openImagePreview(item.images, 3)}
                                  >
                                    +{item.images.length - 3} ảnh
                                  </button>
                                )}
                              </div>
                            ) : (
                              'Không có hình ảnh'
                            )}
                          </td>

                          <td>
                            <button className="lf-btn lf-btn--equal" onClick={() => openReply(item)}>
                              <i className="fa-regular fa-comments" /> {item?.reply?.content ? 'Sửa phản hồi' : 'Phản hồi'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      !loading && (
                        <tr>
                          <td colSpan="5" className="lf-empty">Không có dữ liệu đánh giá</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="lf-foot">
              <div className="text-muted small">
                Trang {page}/{totalPages || 1}
              </div>
              <div className="btn-group">
                <button className="lf-btn" disabled={page <= 1 || loading} onClick={goPrev}>
                  ‹ Trước
                </button>
                <button className="lf-btn" disabled={page >= (totalPages || 1) || loading} onClick={goNext}>
                  Sau ›
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL REPLY */}
      {isOpen && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }} onClick={closeReply}>
          <div
            className="modal"
            style={{ display: 'block', zIndex: 2001 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__head">
              <h5 className="modal__title">Phản hồi đánh giá</h5>
              <button className="lf-iconbtn" onClick={closeReply} title="Đóng">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="modal__body">
              <div style={{ marginBottom: 10, color: '#475467' }}>
                Đến: <strong>{selectedFeedback?.fromUser?.fullName || selectedFeedback?.fromUser?.name || 'Khách hàng'}</strong>
              </div>
              <textarea
                className="textarea"
                placeholder="Nhập nội dung phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={1000}
              />
              <div className="charcount">{replyText.length}/1000</div>
            </div>
            <div className="modal__foot">
              <button className="lf-btn" onClick={closeReply}>Huỷ</button>
              <button
                className="lf-btn lf-btn--primary"
                onClick={submitReply}
                disabled={!replyText.trim() || loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
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
    </>
  );
};

export default ListFeedback;
