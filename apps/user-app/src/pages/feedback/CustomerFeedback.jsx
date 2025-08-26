// src/pages/technician/FeedbackList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchFeedbacksByFromUser,
  setFeedbackPage,
  updateFeedbackThunk,
} from '../../features/feedbacks/feedbackSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ====== Icons / tiny components ====== */
const Star = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className="me-1"
    xmlns="http://www.w3.org/2000/svg"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M12 17.27l6.18 3.73-1.64-7.03L21.9 9.24l-7.19-.61L12 2 9.29 8.63 2.1 9.24l5.36 4.73-1.64 7.03z" />
  </svg>
);

const RatingStars = ({ value = 0, max = 5 }) => {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;
  return (
    <div className="rating-stars d-flex align-items-center">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < Math.round(v)} />
      ))}
      <span className="ms-2 rating-value">({v.toFixed(1)})</span>
    </div>
  );
};

const FeedbackSkeleton = () => (
  <div className="card feedback-card shadow-sm mb-3">
    <div className="card-body">
      <div className="placeholder-glow mb-2">
        <span className="placeholder col-2 me-2"></span>
        <span className="placeholder col-1"></span>
      </div>
      <div className="placeholder-glow">
        <span className="placeholder col-9"></span>
        <span className="placeholder col-7"></span>
        <span className="placeholder col-5"></span>
      </div>
      <div className="mt-3 d-flex gap-2">
        <span className="placeholder col-2" style={{ height: 80 }}></span>
        <span className="placeholder col-2" style={{ height: 80 }}></span>
        <span className="placeholder col-2" style={{ height: 80 }}></span>
      </div>
    </div>
  </div>
);

const EmptyState = ({
  title = 'Chưa có đánh giá',
  desc = 'Khi có đánh giá, chúng sẽ xuất hiện tại đây.',
}) => (
  <div className="text-center py-5">
    <div
      className="mx-auto mb-3"
      style={{
        width: 72,
        height: 72,
        borderRadius: 16,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bs-light)',
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 17.27l6.18 3.73-1.64-7.03L21.9 9.24l-7.19-.61L12 2 9.29 8.63 2.1 9.24l5.36 4.73-1.64 7.03z" />
      </svg>
    </div>
    <h5 className="mb-1">{title}</h5>
    <p className="text-secondary mb-0">{desc}</p>
  </div>
);

const ImageModal = ({ show, onClose, src }) => (
  <div
    className={`modal fade ${show ? 'show d-block' : ''}`}
    tabIndex="-1"
    aria-hidden={!show}
    role="dialog"
    onClick={onClose}
    style={{ background: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}
  >
    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <div className="modal-body p-0">
          {src ? (
            <img src={src} alt="feedback-zoom" className="img-fluid w-100" />
          ) : (
            <div className="p-5 text-center text-muted">Không có ảnh</div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ====== Edit Modal ====== */
const EditFeedbackModal = ({ show, onClose, feedback }) => {
  const dispatch = useDispatch();
  const { updateLoading } = useSelector((s) => s.feedback);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [imagesText, setImagesText] = useState(''); // mỗi URL 1 dòng
  const [err, setErr] = useState(null);

  // Prefill khi mở modal
  useEffect(() => {
    if (show && feedback) {
      setRating(Math.min(5, Math.max(1, Number(feedback?.rating || 5))));
      setContent(feedback?.content || '');
      setImagesText(Array.isArray(feedback?.images) ? feedback.images.join('\n') : '');
      setErr(null);
    }
  }, [show, feedback]);

  const validate = () => {
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return 'Điểm đánh giá phải từ 1 đến 5.';
    }
    if (!content || !content.trim()) {
      return 'Vui lòng nhập nội dung đánh giá.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback?._id) {
      setErr('Thiếu ID feedback. Vui lòng tải lại trang.');
      return;
    }

    const errMsg = validate();
    if (errMsg) {
      setErr(errMsg);
      return;
    }

    const images = (imagesText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // 🟦 LOG: xem dữ liệu trước khi gửi
    console.group('🟦 EditFeedback submit');
    console.log('feedbackId:', feedback._id);
    console.log('raw form =>', {
      rating,
      contentLength: (content || '').length,
      imagesText,
    });
    console.log('payload =>', {
      id: feedback._id,
      rating: Number(rating),
      content: (content || '').trim(),
      images,
    });
    console.groupEnd();

    try {
      await dispatch(
        updateFeedbackThunk({
          id: feedback._id,
          rating: Number(rating),
          content: (content || '').trim(),
          images,
        })
      ).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật đánh giá thành công',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'bottom-right',
        pauseOnHover: true,
        allowOutsideClick: true,
        toast: true,
        
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error?.message || 'Cập nhật thất bại',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'bottom-right',
        pauseOnHover: true,
        allowOutsideClick: true,
        toast: true,
        
      });
    }
  };


  return (
    <div
      className={`modal fade ${show ? 'show d-block' : ''}`}
      tabIndex="-1"
      aria-hidden={!show}
      role="dialog"
      onClick={onClose}
      style={{ background: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Sửa đánh giá</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {err && (
                <div className="alert alert-danger py-2 mb-3">
                  {err}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Điểm đánh giá (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  className="form-control"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nội dung</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn…"
                />
              </div>

              <div className="mb-0">
                <label className="form-label">
                  Ảnh (mỗi dòng 1 URL)
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://.../image1.jpg
https://.../image2.jpg"
                />
                <div className="form-text">
                  Nếu không có ảnh, để trống.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={updateLoading}>
                {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Đảm bảo modal hiển thị đẹp khi dùng show d-block */
        .modal.show.d-block { overflow-y: auto; }
      `}</style>
    </div>
  );
};

/* ====== Card ====== */
const FeedbackCard = ({ fb, canEdit, onEdit, onImageClick }) => {
  const created = fb?.createdAt ? dayjs(fb.createdAt).format('DD/MM/YYYY HH:mm') : null;

  return (
    <div className="card feedback-card shadow-sm mb-3">
      <div className="card-body">
        {/* Header: rating + date + (edit) */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex flex-column">
            <RatingStars value={fb?.rating} />
          </div>

          <div className="d-flex align-items-center gap-2">
            {canEdit && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={onEdit}
                title="Sửa đánh giá"
              >
                Sửa
              </button>
            )}
            {created && <span className="badge feedback-date">{created}</span>}
          </div>
        </div>

        {/* Content */}
        {fb?.content && <p className="feedback-text mb-3">{fb.content}</p>}

        {/* Images */}
        {Array.isArray(fb?.images) && fb.images.length > 0 && (
          <div className="row g-2 mb-3">
            {fb.images.map((img, idx) => (
              <div className="col-4 col-sm-3 col-md-2" key={idx}>
                <button
                  type="button"
                  className="btn p-0 border-0"
                  onClick={() => onImageClick(img)}
                  aria-label="Xem ảnh lớn"
                  title="Xem ảnh lớn"
                >
                  <img
                    src={img}
                    alt={`feedback-${idx + 1}`}
                    className="img-fluid rounded"
                    style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reply box */}
        {fb?.reply?.content ? (
          <div className="reply-box">
            <div className="reply-title">Phản hồi của thợ</div>
            <div className="reply-content">{fb.reply.content}</div>
            {fb.reply.createdAt && (
              <div className="reply-date">
                {dayjs(fb.reply.createdAt).format('DD/MM/YYYY HH:mm')}
              </div>
            )}
          </div>
        ) : (
          <div className="no-reply small text-secondary">Chưa có phản hồi</div>
        )}
      </div>
    </div>
  );
};

/* ====== Page ====== */
const FeedbackList = () => {
  const dispatch = useDispatch();

  const { items, page, limit, totalPages, loading, errorMessage } = useSelector(
    (s) => s.feedback
  );
  const { user } = useSelector((s) => s.auth);
  const userId = user?._id;

  const [previewSrc, setPreviewSrc] = useState(null);

  // state cho Edit Modal
  const [editing, setEditing] = useState(null); // feedback đang chỉnh sửa (object) hoặc null

  useEffect(() => {
    if (userId) {
      dispatch(fetchFeedbacksByFromUser({ userId, page, limit }));
    }
  }, [userId, page, limit, dispatch]);

  const hasData = Array.isArray(items) && items.length > 0;
  const listToRender = useMemo(() => (hasData ? items : []), [hasData, items]);

  return (
    <div className="main-wrapper">
      <Header />
      <BreadcrumbBar />

      <div className="content">
        <div className="container py-3 py-md-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 className="h4 fw-bold mb-1">Danh sách đánh giá</h2>
              <div className="text-secondary">
                {hasData ? (
                  <>Có <strong>{items.length}</strong> mục trong trang này</>
                ) : (
                  'Không có mục nào để hiển thị'
                )}
              </div>
            </div>
          </div>

          {loading && (
            <>
              <FeedbackSkeleton />
              <FeedbackSkeleton />
              <FeedbackSkeleton />
            </>
          )}

          {!loading && errorMessage && (
            <div className="alert alert-danger" role="alert">
              Lỗi: {errorMessage}
            </div>
          )}

          {!loading && !errorMessage && !hasData && <EmptyState />}

          {!loading && !errorMessage && hasData && (
            <div className="row">
              <div className="col-12 col-md-10 col-lg-9 col-xl-8">
                {listToRender.map((fb) => {
                  // chủ feedback (từ log có thể là fromUser.id hoặc _id)
                  const fromId = (() => {
                    const fu = fb?.fromUser;
                    if (!fu) return '';
                    if (typeof fu === 'string') return fu;                 // trường hợp BE trả string
                    if (typeof fu === 'object') {                          // {_id} | {id} | ObjectId
                      const raw = fu._id ?? fu.id ?? '';
                      return (raw && typeof raw === 'object' && raw.toString)
                        ? raw.toString()
                        : String(raw);
                    }
                    return '';
                  })();

                  const isOwner = String(userId || '') === String(fromId || '');
                  // chỉ được sửa khi chưa có phản hồi
                  const canEdit = isOwner && !fb?.reply?.content;

                  return (
                    <FeedbackCard
                      key={fb._id}
                      fb={fb}
                      canEdit={!!canEdit}
                      onEdit={() => setEditing(fb)}          // mở modal
                      onImageClick={(src) => setPreviewSrc(src)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-secondary small">
              Trang <strong>{page}</strong> / {totalPages || 1}
            </div>
            <nav aria-label="Feedback pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => dispatch(setFeedbackPage(page - 1))}
                    disabled={page <= 1}
                  >
                    Trước
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    {page} / {totalPages || 1}
                  </span>
                </li>
                <li className={`page-item ${page >= (totalPages || 1) ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => dispatch(setFeedbackPage(page + 1))}
                    disabled={page >= (totalPages || 1)}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImageModal show={!!previewSrc} src={previewSrc} onClose={() => setPreviewSrc(null)} />

      {/* Edit Feedback Modal */}
      <EditFeedbackModal
        show={!!editing}
        feedback={editing}
        onClose={() => setEditing(null)}
      />

      {/* ====== Styles (độ tương phản cao, dễ đọc) ====== */}
      <style>{`
        .feedback-card{
          border:1px solid #e5e7eb;        /* slate-200 */
          border-radius:12px;
          background:#ffffff;
        }
        .rating-stars{ color:#f59e0b; }     /* amber-500 */
        .rating-value{ color:#1f2937; }     /* gray-800 */

        .feedback-text{
          color:#111827;                    /* gray-900 */
          font-size:15px;
          line-height:1.6;
          margin:0;
        }
        .feedback-date{
          background:#f1f5f9;               /* slate-100 */
          color:#334155;                    /* slate-700 */
          font-weight:600;
          padding:6px 10px;
          border-radius:8px;
        }

        .reply-box{
          background:#f8fafc;               /* slate-50 */
          border:1px solid #e2e8f0;         /* slate-200 */
          border-radius:10px;
          padding:12px 14px;
        }
        .reply-title{
          font-weight:700;
          color:#0f172a;                    /* slate-900 */
          margin-bottom:4px;
        }
        .reply-content{
          color:#1f2937;                    /* gray-800 */
        }
        .reply-date{
          color:#64748b;                    /* slate-500 */
          font-size:12px;
          margin-top:6px;
        }
        .no-reply{ margin-top:6px; }

        .placeholder { display:inline-block;background-color:#e9ecef;border-radius:.25rem;min-height:1em; }
        .placeholder.col-2 { width: 16.6667%; }
        .placeholder.col-5 { width: 41.6667%; }
        .placeholder.col-7 { width: 58.3333%; }
        .placeholder.col-9 { width: 75%; }

        .pagination .page-link{ color:#374151; }         /* gray-700 */
        .pagination .page-item.disabled .page-link{ color:#9ca3af; } /* gray-400 */
      `}</style>
    </div>
  );
};

export default FeedbackList;
