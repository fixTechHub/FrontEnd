// src/pages/technician/WarrantyList.jsx
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getWarrantiesOfTechThunk } from '../../features/booking-warranty/warrantySlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';

const styles = {
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '10px',
  },
  paginationBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#6c757d',
    padding: '8px 15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#e9ecef',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#6c757d',
    margin: 0,
  },
  statusChip: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '120px',
    height: '28px',
    padding: '0 10px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
  },
};

export default function WarrantyList() {
  const dispatch = useDispatch();

  const warrantyState = useSelector((s) => s.warranty) || {};
  const loading = Boolean(warrantyState.loading);
  const error = warrantyState.error || null;
  const items = Array.isArray(warrantyState.items) ? warrantyState.items : [];
  const page = Number(warrantyState.page) || 1;
  const totalPages = Number(warrantyState.totalPages) || 1;
  const limit = Number(warrantyState.limit) || 10;
  const total = Number(warrantyState.total) || 0;

  const { technician } = useSelector((s) => s.auth);
  const technicianId = technician?._id;

  // Pretty status
  const STATUS_LABEL = {
    PENDING: 'Đang xử lý',
    CONFIRMED: 'Đã xác nhận',
    DENIED: 'Đã từ chối',
    RESOLVED: 'Đã xử lý',
    DONE: 'Hoàn tất',
  };
  const prettyStatus = (raw = '') => {
    const key = String(raw).toUpperCase().trim();
    return STATUS_LABEL[key] || key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const statusClass = (raw = '') => {
    const k = String(raw).toUpperCase();
    if (k.includes('CANCEL') || k.includes('REJECT')) return 'badge-light-danger';
    if (k.includes('DONE') || k.includes('RESOLVED') || k.includes('ACCEPT')) return 'badge-light-success';
    return 'badge-light-warning';
  };

  useEffect(() => {
    // Nếu bạn chưa có route /me thì guard technicianId để tránh gọi sớm
    if (!technicianId) return;
    dispatch(getWarrantiesOfTechThunk({ technicianId, page: 1, limit: 10 }));
  }, [dispatch, technicianId]);

  const goPrev = useCallback(() => {
    if (page > 1 && !loading) {
      dispatch(getWarrantiesOfTechThunk({ technicianId, page: page - 1, limit }));
    }
  }, [dispatch, page, limit, loading, technicianId]);

  const goNext = useCallback(() => {
    if (page < totalPages && !loading) {
      dispatch(getWarrantiesOfTechThunk({ technicianId, page: page + 1, limit }));
    }
  }, [dispatch, page, limit, totalPages, loading, technicianId]);

  if (loading && items.length === 0) return <div>Đang tải…</div>;
  if (error)
    return (
      <div className="text-danger">
        {typeof error === 'string' ? error : error?.message || JSON.stringify(error)}
      </div>
    );

  return (
    <div className="main-wrapper">
      <Header />
      <BreadcrumbBar />

      {/* DASHBOARD MENU */}
      <div className="dashboard-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-menu">
                <ul>
                  <li>
                    <Link to={`/technician`}>
                      <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                      <span>Bảng điều khiển</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/booking`}>
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
                  <li>
                    <Link to={`/technician/warranty`} className="active">
                      <img src="/img/icons/booking-icon.svg" alt="Icon" />
                      <span>Bảo hành</span>
                    </Link>
                  </li>
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

      {/* CONTENT */}
      <div className="content">
        <div className="container">
          <div className="content-header d-flex align-items-center justify-content-between">
            <h4>Bảo hành của tôi</h4>
            <ul className="booking-nav">
              <li>
                <button className="active" style={{ background: 'transparent', border: 0 }}>
                  <i className="fa-solid fa-list"></i>
                </button>
              </li>
            </ul>
          </div>

          {/* Meta dòng trên */}
          <div className="row mb-3">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <p style={styles.pageInfo}>
                Trang {page}/{totalPages} • Tổng {total || items.length}
              </p>
              {/* Nếu sau này cần filter trạng thái lịch, đặt tại đây */}
            </div>
          </div>

          {/* Bảng danh sách bảo hành */}
          <div className="card-body">
            <div className="table-responsive dashboard-table">
              <table className="table datatable table-modern">
                <thead className="thead-light">
                  <tr>
                    <th>Mã bảo hành</th>
                    <th>Mã booking</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((w) => {
                      const id = w?._id || `${w?.bookingId?._id}-${Math.random()}`;
                      const reqDate = w?.requestDate
                        ? new Date(w.requestDate)
                        : w?.createdAt
                        ? new Date(w.createdAt)
                        : null;

                      return (
                        <tr key={id}>
                          <td className="mono">{w?._id || '—'}</td>
                          <td className="mono">{w?.bookingId?._id || '—'}</td>
                          <td className="mono">
                            {reqDate
                              ? `${reqDate.toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} ${reqDate.toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}`
                              : '—'}
                          </td>
                          <td>
                            <span
                              className={`badge ${statusClass(w?.status)}`}
                              style={styles.statusChip}
                            >
                              {prettyStatus(w?.status)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <div
                              style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                              className="dropdown dropdown-action"
                            >
                              <button className="dropdown-toggle" data-bs-toggle="dropdown" style={{ background: 'transparent', border: 0 }}>
                                <i className="fas fa-ellipsis-vertical"></i>
                              </button>
                              <div className="dropdown-menu dropdown-menu-end">
                                <Link to={`/warranty?bookingWarrantyId=${w?._id || ''}`} className="dropdown-item">
                                  <i className="feather-eye"></i> Chi tiết
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Chưa có bảo hành nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.paginationBtn, ...(page === 1 ? styles.disabledBtn : {}) }}
                  onClick={goPrev}
                  disabled={loading || page === 1}
                >
                  ← Trước
                </button>

                <span style={styles.pageInfo}>
                  Trang {page} / {totalPages}
                </span>

                <button
                  style={{ ...styles.paginationBtn, ...(page === totalPages ? styles.disabledBtn : {}) }}
                  onClick={goNext}
                  disabled={loading || page === totalPages}
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS nhúng: bảng đẹp, chip màu, responsive giống template bạn đưa */}
      <style>{`
.table-modern {
  table-layout: fixed;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.table-modern thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #343a40;
  border-bottom: 1px solid #e9ecef;
  padding: 14px 16px;
  vertical-align: middle;
}
.table-modern tbody td {
  padding: 14px 16px;
  vertical-align: middle;
  border-top: 1px solid #f1f3f5;
  color: #343a40;
}
.table-modern tbody tr:nth-child(even) { background: #fcfcfd; }
.table-modern tbody tr:hover { background: #f6fbff; }
.table-modern th, .table-modern td {
  white-space: normal !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.mono { word-break: break-all; }

/* cột */
.table-modern th:nth-child(1), .table-modern td:nth-child(1) { width: 18%; } /* Mã bảo hành */
.table-modern th:nth-child(2), .table-modern td:nth-child(2) { width: 18%; } /* Mã booking */
.table-modern th:nth-child(3), .table-modern td:nth-child(3) { width: 20%; } /* Khách */
.table-modern th:nth-child(4), .table-modern td:nth-child(4) { width: 18%; } /* Ngày yêu cầu */
.table-modern th:nth-child(5), .table-modern td:nth-child(5) { width: 16%; } /* Trạng thái */
.table-modern th:nth-child(6), .table-modern td:nth-child(6) { width: 10%; text-align: center; } /* Thao tác */

.badge-light-success { background: #e6f7f0; color: #1e8e5a; border: 1px solid #c4eddc; }
.badge-light-warning { background: #fff7e6; color: #b77400; border: 1px solid #ffe2b8; }
.badge-light-danger  { background: #fdecee; color: #c23c43; border: 1px solid #f7c7cd; }

.table-responsive { overflow-x: auto !important; }

@media (max-width: 991.98px) {
  .badge { min-width: 100px; font-size: 12px; height: 26px; }
}
@media (max-width: 575.98px) {
  .table-modern thead th, .table-modern tbody td { padding: 10px 12px; }
}
      `}</style>
    </div>
  );
}
