// FeedbackList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeedbacksByFromUser,
  setFeedbackPage,
} from '../../features/feedbacks/feedbackSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import dayjs from 'dayjs';

// ⭐️ Sao dạng SVG, không phụ thuộc icon pack
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
  >
    <path d="M12 17.27l6.18 3.73-1.64-7.03L21.9 9.24l-7.19-.61L12 2 9.29 8.63 2.1 9.24l5.36 4.73-1.64 7.03z" />
  </svg>
);

const RatingStars = ({ value = 0, max = 5 }) => {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;
  return (
    <div className="d-flex align-items-center text-warning">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < Math.round(v)} />
      ))}
      <span className="ms-1 small text-muted">({v.toFixed(1)})</span>
    </div>
  );
};

// Skeleton card khi loading
const FeedbackSkeleton = () => (
  <div className="card shadow-sm mb-3 border-0">
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

const EmptyState = ({ title = 'Chưa có đánh giá', desc = 'Khi có đánh giá, chúng sẽ xuất hiện tại đây.' }) => (
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
    <p className="text-muted mb-0">{desc}</p>
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

const FeedbackCard = ({ fb, onImageClick }) => {
  const created = fb?.createdAt ? dayjs(fb.createdAt).format('DD/MM/YYYY HH:mm') : null;
  const content = fb?.content ?? '';
  const trimmed =
    content.length > 220 ? content.slice(0, 220).trimEnd() + '…' : content;

  return (
    <div className="card shadow-sm mb-3 border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex flex-column">
            <RatingStars value={fb?.rating} />
            {fb?.title && <h6 className="mt-2 mb-0">{fb.title}</h6>}
          </div>
          {created && (
            <span className="badge bg-light text-muted fw-normal">
              {created}
            </span>
          )}
        </div>

        {trimmed && <p className="mb-3 text-body">{trimmed}</p>}

        {Array.isArray(fb?.images) && fb.images.length > 0 && (
          <div className="row g-2">
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
      </div>
    </div>
  );
};

const FeedbackList = () => {
  const dispatch = useDispatch();
  const { items, page, limit, totalPages, loading, errorMessage } = useSelector(
    (s) => s.feedback
  );
  console.log("📦 feedback state:", { items, page, limit, totalPages, loading, errorMessage }); 
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;

  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchFeedbacksByFromUser({ userId, page, limit }));
    }
  }, [userId, page, limit, dispatch]);

  const hasData = Array.isArray(items) && items.length > 0;

  // Với layout hiện tại không cần chunk thật sự
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
              <div className="text-muted">
                {hasData ? (
                  <>Có <strong>{items.length}</strong> mục trong trang này</>
                ) : (
                  'Không có mục nào để hiển thị'
                )}
              </div>
            </div>

            {/* (Tuỳ chọn) selector page size — dùng toggle thay vì comment lồng nhau */}
            {false && (
              <div>
                <select
                  className="form-select"
                  style={{ width: 120 }}
                  value={limit}
                  onChange={() => {
                    // Gợi ý: bạn nên có action setFeedbackLimit rồi reset page = 1
                    // dispatch(setFeedbackLimit(Number(e.target.value)));
                    // dispatch(setFeedbackPage(1));
                  }}
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                </select>
              </div>
            )}
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
                {listToRender.map((fb) => (
                  <FeedbackCard
                    key={fb._id}
                    fb={fb}
                    onImageClick={(src) => setPreviewSrc(src)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Phân trang */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
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

      {/* Modal xem ảnh lớn */}
      <ImageModal show={!!previewSrc} src={previewSrc} onClose={() => setPreviewSrc(null)} />

      {/* CSS nhỏ để đẹp hơn */}
      <style>{`
        .placeholder {
          display: inline-block;
          background-color: var(--bs-secondary-bg);
          border-radius: .25rem;
          min-height: 1em;
        }
        .placeholder.col-2 { width: 16.6667%; }
        .placeholder.col-5 { width: 41.6667%; }
        .placeholder.col-7 { width: 58.3333%; }
        .placeholder.col-9 { width: 75%; }
      `}</style>
    </div>
  );
};

export default FeedbackList;
