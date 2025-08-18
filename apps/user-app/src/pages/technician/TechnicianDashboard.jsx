// TechnicianDashboard.jsx
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
// import { useParams } from 'react-router-dom'; // <-- không dùng
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import React from "react";
import {
  fetchEarningAndCommission,
  fetchTechnicianJobs,
  fetchTechnicianAvailability,
  changeTechnicianAvailability
} from '../../features/technicians/technicianSlice';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { selectTechnicianId } from '../../utils/selectors';

import { formatDateOnly } from '../../utils/formatDate';

const BreadcrumbSection = () => (
  <div className="breadcrumb-bar">
    <div className="container">
      <div className="row align-items-center text-center">
        <div className="col-md-12 col-12">
          <h2 className="breadcrumb-title">Technician Dashboard</h2>
          <nav aria-label="breadcrumb" className="page-breadcrumb">
            <ol className="breadcrumb" />
          </nav>
        </div>
      </div>
    </div>
  </div>
);

// ---------- Widget Item ----------
const WidgetItem = ({ icon, title, value, color, link }) => (
  <div className="col-lg-3 col-md-6 d-flex">
    <div className="widget-box flex-fill">
      <div className="widget-header">
        <div className="widget-content">
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
        <div className="widget-icon">
          <span className={color ? `bg-${color}` : ""}>
            <img src={`/img/icons/${icon}-icon.svg`} alt="icon" />
          </span>
        </div>
      </div>

      {link ? (
        <Link to={link} className="view-link">
          Xem chi tiết <i className="feather-arrow-right" />
        </Link>
      ) : (
        <a href="#" className="view-link">
          Xem chi tiết <i className="feather-arrow-right" />
        </a>
      )}
    </div>
  </div>
);

// ---------- Widgets Row ----------
const WidgetsRow = () => {
  const bookingsState = useSelector((state) => state.technician.bookings);
  const { technician } = useSelector((state) => state.auth);

  // Normalize bookings
  const bookings = useMemo(() => {
    return Array.isArray(bookingsState)
      ? bookingsState
      : (Array.isArray(bookingsState?.data) ? bookingsState.data : []);
  }, [bookingsState]);

  const bookingCount = bookings.length;

  const feedbackItems = useSelector((s) => s.feedback?.items) || [];
  const reviewCount = Number(
    (technician && technician.ratingCount) != null
      ? technician.ratingCount
      : (Array.isArray(feedbackItems) ? feedbackItems.length : 0)
  );

  // Thu nhập hôm nay (chỉ demo)
  const isSameDate = (d1, d2) => {
    const a = new Date(d1), b = new Date(d2);
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  };

  const todayIncomeNumber = useMemo(() => {
    const today = new Date();
    const done = new Set(['DONE', 'COMPLETED']);
    return bookings.reduce((sum, b) => {
      const status = String(b?.status || '').toUpperCase();
      const when = b?.schedule?.startTime || b?.createdAt;
      if (!when || !done.has(status)) return sum;
      if (isSameDate(when, today)) {
        const earning =
          (b?.technicianEarning != null ? Number(b.technicianEarning) : null) ??
          (b?.finalPrice != null && b?.quote?.commissionRate != null
            ? Number(b.finalPrice) * (1 - Number(b.quote.commissionRate))
            : (b?.finalPrice != null ? Number(b.finalPrice) : 0));
        return sum + (Number.isFinite(earning) ? earning : 0);
      }
      return sum;
    }, 0);
  }, [bookings]);

  // ✅ sửa format: dùng số gốc rồi toLocaleString một lần
  const walletBalanceNum = Number(technician?.balance || 0);
  const walletBalanceStr = `${walletBalanceNum.toLocaleString('vi-VN')}\u00A0VND`;
  const todayIncomeStr = `${todayIncomeNumber.toLocaleString('vi-VN')}\u00A0VND`;

  return (
    <>
      <div className="row">
        <WidgetItem icon="book" title="Đơn hàng của tôi" value={bookingCount} link="/technician/booking" />
        <WidgetItem
          icon="balance"
          title="Tài khoản"
          value={<span className="kpi-amount" title={walletBalanceStr}>{walletBalanceStr}</span>}
          link="/technician/deposit"
        />
        <WidgetItem icon="transaction" title="Đánh giá" value={reviewCount} color="success" link="/technician/feedback" />
        <WidgetItem
          icon="cars"
          title="Thu nhập hôm nay"
          value={<span className="kpi-amount" title={todayIncomeStr}>{todayIncomeStr}</span>}
          link="/technician/earning"
        />
      </div>
      <style>{`
        .kpi-amount {
          display: inline-block;
          white-space: nowrap;
          max-width: calc(100% - 72px);
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: bottom;
          word-break: keep-all;
        }
        .widget-card { min-height: 152px; }
      `}</style>
    </>
  );
};

function ViewEarningAndCommission() {
  const dispatch = useDispatch();
  const techId = useSelector(selectTechnicianId);
  const { earnings, loading, error } = useSelector((state) => state.technician);

  useEffect(() => {
    if (techId) dispatch(fetchEarningAndCommission(techId));
  }, [dispatch, techId]);

  if (loading) return <p>Đang tải...</p>;
  // ✅ chỉ show lỗi khi đã có techId
  if (error && techId) return <p>Lỗi: {error}</p>;

  return (
    <div className="main-wrapper">
      <div className="content dashboard-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 d-flex">
              <div className="card user-card flex-fill">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-sm-5"><h5>Thu nhập của tôi</h5></div>
                    <div className="col-sm-7 text-sm-end" />
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive dashboard-table dashboard-table-info">
                    <table className="table">
                      <thead className="thead-light">
                        <tr>
                          <th>Khách hàng</th>
                          <th>Dịch vụ</th>
                          <th>Tiền giữ lại</th>
                          <th>Thu nhập</th>
                          <th>Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(earnings) && earnings.length > 0 ? (
                          earnings.slice(0, 5).map((item, index) => (
                            <tr key={item?.bookingId ?? item._id ?? index}>
                              <td>{item?.bookingInfo?.customerName ?? 'Không có'}</td>
                              <td>{item?.bookingInfo?.service ?? 'Không có'}</td>
                              <td>{Number(item?.holdingAmount || 0).toLocaleString('vi-VN')} VNĐ</td>
                              <td>{Number(item?.technicianEarning || 0).toLocaleString('vi-VN')} VNĐ</td>
                              <td>{Number(item?.finalPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">Không có dữ liệu hoa hồng</td>
                          </tr>
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
    </div>
  );
}

// ===== AvailabilitySwitch giữ nguyên như bạn đang dùng =====
// (đã đúng logic BUSY chỉ khi tất cả đơn DONE & dùng toast)
// ----------------------------------------------------------

const TechnicianJobList = () => {
  const dispatch = useDispatch();
  const techId = useSelector(selectTechnicianId);
  const { bookings, loading, error } = useSelector((state) => state.technician);

  useEffect(() => {
    if (techId) dispatch(fetchTechnicianJobs(techId));
  }, [techId, dispatch]);

  const STATUS_SHORT = {
    WAITING_CUSTOMER_CONFIRM_ADDITIONAL: 'Đợi xác nhận',
    CONFIRM_ADDITIONAL: 'Đã xác nhận',
    AWAITING_DONE: 'Đợi hoàn thành',
    IN_PROGRESS: 'Đang thực hiện',
    DONE: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    PENDING: 'Đang xử lí',
  };
  const prettyStatus = (raw = '') => {
    const key = String(raw).toUpperCase().trim();
    if (STATUS_SHORT[key]) return STATUS_SHORT[key];
    return key.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const list = useMemo(() => {
    return Array.isArray(bookings) ? bookings : Array.isArray(bookings?.data) ? bookings.data : [];
  }, [bookings]);

  const toTime = (x) => (x ? new Date(x).getTime() : 0);

  const statusChipClass = (s = '') => {
    const x = String(s).toUpperCase();
    if (x === 'DONE' || x === 'COMPLETED') return 'chip chip--success';
    if (x.includes('CANCEL')) return 'chip chip--danger';
    if (x.includes('IN_PROGRESS')) return 'chip chip--warning';
    return 'chip chip--warning';
  };

  const top5Newest = useMemo(() => {
    return list
      .slice()
      .sort((a, b) => {
        const ta = toTime(a?.schedule?.startTime) || toTime(a?.createdAt);
        const tb = toTime(b?.schedule?.startTime) || toTime(b?.createdAt);
        return tb - ta;
      })
      .slice(0, 5);
  }, [list]);

  if (loading) return <p>Loading bookings...</p>;
  // ✅ chỉ show lỗi khi đã có techId
  if (error && techId) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <>
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="sorting-info">
                <div className="row d-flex align-items-center">
                  <div className="col-xl-7 col-lg-8 col-sm-12 col-12">
                    <div className="booking-lists">
                      <h4>Danh sách đơn hàng của tôi</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive dashboard-table">
              <table className="table datatable">
                <thead className="thead-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Tên Khách Hàng</th>
                    <th>Dịch vụ</th>
                    <th>Địa chỉ</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {top5Newest.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">Không có đơn đặt lịch nào</td>
                    </tr>
                  ) : (
                    top5Newest.map((b) => (
                      <tr key={b?.bookingId || b?._id}>
                        <td>{b?.bookingCode}</td>
                        <td>{b?.customerName}</td>
                        <td>{b?.serviceName}</td>
                        <td>{b?.address?.split(',')[0]}</td>
                        <td>{formatDateOnly(b?.schedule?.startTime || b?.createdAt)}</td>
                        <td><span className={statusChipClass(b?.status)}>{prettyStatus(b?.status)}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <style>{`
          .chip{
            display:inline-flex; align-items:center; justify-content:center;
            min-width:120px; height:28px; padding:0 10px;
            border-radius:6px; font-size:13px; font-weight:600;
          }
          .chip--success{ background:#e6f7f0; color:#1e8e5a; border:1px solid #c4eddc; }
          .chip--warning{ background:#fff7e6; color:#b77400; border:1px solid #ffe2b8; }
          .chip--danger { background:#fdecee; color:#c23c43; border:1px solid #f7c7cd; }
        `}</style>
      </div>
    </>
  );
};

const AvailabilitySwitch = () => {
  const dispatch = useDispatch();
  const tech = useSelector((s) => s.auth?.technician || s.auth?.user);
  const techId = tech?._id || null;

  const availabilityState = useSelector((s) => s.technician?.availability);
  const globalLoading = useSelector((s) => s.technician?.loading);
  const bookingsState = useSelector((s) => s.technician?.bookings);
  const bookings = Array.isArray(bookingsState)
    ? bookingsState
    : (Array.isArray(bookingsState?.data) ? bookingsState.data : []);

  const normalizeStatus = (value) => {
    if (!value && value !== false) return null;
    if (typeof value === 'string') return value.toUpperCase();
    if (typeof value === 'boolean') return value ? 'FREE' : 'BUSY';
    if (typeof value === 'object') {
      if (typeof value.status === 'string') return value.status.toUpperCase();
      if (typeof value.isAvailable === 'boolean') return value.isAvailable ? 'FREE' : 'BUSY';
    }
    return null;
  };
  const currentStatus = normalizeStatus(availabilityState);
  const isSwitchOn = currentStatus === 'FREE' || currentStatus === 'ONJOB';

  useEffect(() => {
    if (!techId) return;
    dispatch(fetchTechnicianAvailability(techId));
    dispatch(fetchTechnicianJobs(techId));
  }, [dispatch, techId]);

  const DONE_SET = new Set(['DONE', 'COMPLETED']);
  const allJobsDone =
    bookings.length === 0
      ? true
      : bookings.every(b => DONE_SET.has(String(b?.status || '').toUpperCase()));

  const [pending, setPending] = React.useState(false);
  const disabled = !techId || pending || globalLoading || currentStatus == null;

  const handleToggle = async () => {
    if (disabled) return;

    // Nếu đang bật (FREE/ONJOB) -> tắt BUSY thì phải xong hết đơn
    if (isSwitchOn && !allJobsDone) {
      toast.error('Không thể chuyển sang "Tạm ngưng" khi vẫn còn đơn chưa hoàn thành.', { position:'top-right', autoClose:3000, theme:'colored' });
      return;
    }

    const next = isSwitchOn ? 'BUSY' : 'FREE';
    setPending(true);
    try {
      await dispatch(changeTechnicianAvailability({ technicianId: techId, status: next }));
      await Promise.all([
        dispatch(fetchTechnicianAvailability(techId)),
        dispatch(fetchTechnicianJobs(techId)),
      ]);
      toast.success(next === 'BUSY' ? 'Đã chuyển sang: Tạm ngưng' : 'Đã chuyển sang: Nhận việc', { position:'top-right', autoClose:2000, theme:'colored' });
    } catch {
      toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại!', { position:'top-right', autoClose:3000, theme:'colored' });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className="availability-wrapper ms-auto">
        <span className="status-text">
          {pending || currentStatus == null
            ? 'Đang cập nhật...'
            : (isSwitchOn ? 'Nhận việc' : 'Tạm ngưng')}
        </span>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-pressed={isSwitchOn}
          className={`tch-switch ${isSwitchOn ? 'on' : ''}`}
          title={
            isSwitchOn
              ? (allJobsDone ? 'Bấm để tạm ngưng (BUSY)' : 'Còn đơn chưa hoàn thành — không thể tạm ngưng')
              : 'Bấm để nhận việc (FREE)'
          }
        >
          <span className="tch-switch__thumb" />
        </button>
      </div>

      <ToastContainer limit={2} newestOnTop />

      <style>{`
        /* Wrapper KHÔNG đẩy layout, đứng mép phải */
        .availability-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex: 0 0 auto;     /* không giãn */
          margin-left: auto;  /* đảm bảo dạt phải nếu parent là flex */
        }

        .status-text {
          font-weight: 500;
          font-size: 14px;
          line-height: 1;     /* tránh lệch dọc */
          color: ${isSwitchOn ? '#34c759' : '#6b7280'};
        }

        /* Dùng class riêng để tránh xung đột .switch từ lib khác */
        .availability-wrapper .tch-switch {
          --w: 56px;
          --h: 32px;
          --pad: 2px;
          --thumb: calc(var(--h) - var(--pad)*2);

          width: var(--w);
          height: var(--h);
          border: 0;
          padding: 0;
          border-radius: 9999px;
          background: #e5e7eb;
          position: relative;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,.08) inset, 0 1px 2px rgba(0,0,0,.04);
          transition: background-color .2s ease;
          outline: none;

          display: inline-block; /* tránh bị flex items kéo giãn/ngắt dòng kỳ lạ */
          vertical-align: middle; /* căn theo text */
        }
        .availability-wrapper .tch-switch.on { background: #34c759; }

        .availability-wrapper .tch-switch__thumb {
          position: absolute;
          top: var(--pad);
          left: var(--pad);
          width: var(--thumb);
          height: var(--thumb);
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,.18);
          transform: translateX(0);
          transition: transform .25s ease;
        }
        .availability-wrapper .tch-switch.on .tch-switch__thumb {
          transform: translateX(calc(var(--w) - var(--h))); /* = 56 - 32 = 24px */
        }

        .availability-wrapper .tch-switch:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .availability-wrapper .tch-switch:focus-visible {
          outline: 2px solid #34c759;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};


const CardsRow = () => (
  <div className="row">
    <ViewEarningAndCommission />
  </div>
);

function TechnicianDashboard() {
  const dispatch = useDispatch();
  const techId = useSelector(selectTechnicianId);
  const techReady = !!techId;

  // ✅ Gọi fetch sau khi có techId
  useEffect(() => {
    if (!techReady) return;
    dispatch(fetchTechnicianJobs(techId));
    dispatch(fetchEarningAndCommission(techId));
    dispatch(fetchTechnicianAvailability(techId));
  }, [dispatch, techId, techReady]);

  // ✅ Chờ có technician rồi mới render nội dung chính
  if (!techReady) {
    return (
      <div className="main-wrapper">
        <Header />
        <BreadcrumbSection />
        <div className="content dashboard-content">
          <div className="container">
            <div className="content-header d-flex align-items-center justify-content-between">
              <h4>Bảng điều khiển</h4>
              <div style={{ width: 56, height: 32, borderRadius: 999, background: '#eee', opacity: .6 }} />
            </div>
            <div className="py-5 text-center text-muted">Đang tải hồ sơ kỹ thuật viên...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <BreadcrumbSection />

      <div className="dashboard-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-menu">
                <ul>
                  <li>
                    <Link to={`/technician`} className="active">
                      <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                      <span>Bảng điểu khiển</span>
                    </Link>
                  </li>
                  <li><Link to={`/technician/booking`} ><img src="/img/icons/booking-icon.svg" alt="Icon" /><span>Đơn hàng</span></Link></li>
                  <li><Link to="/technician/feedback"><img src="/img/icons/review-icon.svg" alt="Icon" /><span>Đánh giá</span></Link></li>
                  <li><Link to={`/technician/${techId}/certificate`}><img style={{ height: '28px' }} src="/img/cer.png" alt="Icon" /><span>Chứng chỉ</span></Link></li>
                  <li><Link to="/technician/schedule"><img src="/img/icons/booking-icon.svg" alt="Icon" /><span>Lịch trình</span></Link></li>
                  <li><Link to="/technician/deposit"><img src="/img/icons/wallet-icon.svg" alt="Icon" /><span>Ví của tôi</span></Link></li>
                  <li><Link to={`/technician/earning`}><img src="/img/icons/payment-icon.svg" alt="Icon" /><span>Thu nhập</span></Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content dashboard-content">
        <div className="container">
          <div className="content-header d-flex align-items-center justify-content-between">
            <h4>Bảng điều khiển</h4>
            <AvailabilitySwitch />
          </div>
          <WidgetsRow />
          <TechnicianJobList />
          <CardsRow />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TechnicianDashboard;
