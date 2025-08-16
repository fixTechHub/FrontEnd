import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import React from "react";
import { fetchEarningAndCommission, fetchTechnicianJobs, fetchTechnicianJobDetails, fetchTechnicianAvailability, changeTechnicianAvailability } from '../../features/technicians/technicianSlice';
import { Link } from 'react-router-dom';

import { formatDateOnly } from '../../utils/formatDate'

const BreadcrumbSection = () => (
    <div className="breadcrumb-bar">
        <div className="container">
            <div className="row align-items-center text-center">
                <div className="col-md-12 col-12">
                    <h2 className="breadcrumb-title">Technician Dashboard</h2>
                    <nav aria-label="breadcrumb" className="page-breadcrumb">
                        <ol className="breadcrumb">
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>
);



// ---------- Widget Item component -----------
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

// ---------- Widgets Row -----------
const WidgetsRow = () => {
    const dispatch = useDispatch();
    const bookingsState = useSelector((state) => state.technician.bookings);
    const { technician } = useSelector((state) => state.auth);

    // 1) Chuẩn hoá bookings về mảng (BE có thể trả {success, data})
    const bookings = useMemo(() => {
        return Array.isArray(bookingsState)
            ? bookingsState
            : (Array.isArray(bookingsState?.data) ? bookingsState.data : []);
    }, [bookingsState]);

    // 2) Tổng số booking
    const bookingCount = bookings.length;

    // 3) Đếm số đánh giá
    // - Ưu tiên số đếm sẵn từ backend (nếu có), ví dụ: technician.ratingCount
    // - Nếu không có, lấy từ slice feedback (nếu bạn có) hoặc 0
    const feedbackItems = useSelector((s) => s.feedback?.items) || [];
    const reviewCount = Number(
        (technician && technician.ratingCount) != null
            ? technician.ratingCount
            : (Array.isArray(feedbackItems) ? feedbackItems.length : 0)
    );

    // 4) Thu nhập hôm nay = tổng technicianEarning của booking hoàn thành trong ngày
    const isSameDate = (d1, d2) => {
        const a = new Date(d1), b = new Date(d2);
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    };

    const todayIncomeNumber = useMemo(() => {
        const today = new Date();
        const done = new Set(['DONE', 'COMPLETED']); // trạng thái hoàn thành

        return bookings.reduce((sum, b) => {
            const status = String(b?.status || '').toUpperCase();
            const when = b?.schedule?.startTime || b?.createdAt;
            if (!when || !done.has(status)) return sum;

            if (isSameDate(when, today)) {
                // Ưu tiên field technicianEarning nếu có.
                // Fallback: nếu có finalPrice & commissionRate => tính; nếu không, dùng finalPrice.
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

    const walletBalance = technician?.balance != null
        ? technician.balance.toLocaleString('vi-VN')
        : '0';

    const walletBalanceStr = `${walletBalance.toLocaleString('vi-VN')}\u00A0VND`; // \u00A0 = space không ngắt dòng
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
        {/* CSS thêm để không xuống dòng & không nở card */}
      <style>{`
        .kpi-amount {
          display: inline-block;
          white-space: nowrap;             /* giữ 1 dòng */
          max-width: calc(100% - 72px);    /* chừa chỗ cho icon góc phải (tùy kích thước icon của bạn) */
          overflow: hidden;
          text-overflow: ellipsis;         /* dài quá thì … */
          vertical-align: bottom;
          word-break: keep-all;            /* không tách từ */
        }

        /* (Tùy chọn) đảm bảo mọi card cao bằng nhau nếu layout bị lệch chiều cao */
        .widget-card {
          min-height: 152px;               /* chỉnh lại theo UI của bạn */
        }
      `}</style>
      </>
    );
};

function ViewEarningAndCommission() {
    const dispatch = useDispatch();
    const technician = useSelector((state) => state.auth.technician);
    console.log("technician", technician);

    // const technicianId = technician._id;

    const { earnings, loading, error } = useSelector((state) => state.technician);
    // console.log("earnings:", JSON.stringify(earnings, null, 2));

    useEffect(() => {
        if (technician) {
            dispatch(fetchEarningAndCommission(technician?._id));
        }
    }, [dispatch, technician?._id]);


    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return (
        <>
            <div class="main-wrapper">
                <div class="content dashboard-content">
                    <div class="container">
                        <div class="row">
                            <div className="col-lg-12 d-flex">
                                <div className="card user-card flex-fill">
                                    <div className="card-header">
                                        <div className="row align-items-center">
                                            <div className="col-sm-5">
                                                <h5>Thu nhập của tôi</h5>
                                            </div>
                                            <div className="col-sm-7 text-sm-end">

                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive dashboard-table dashboard-table-info">
                                            <table className="table">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>
                                                            Khách hàng
                                                        </th>
                                                        <th>Dịch vụ</th>
                                                        <th>Tiền giữ lại</th>
                                                        <th>Thu nhập</th>
                                                        <th>Tổng tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.isArray(earnings) && earnings.length > 0 ? (
                                                        earnings
                                                            .slice(0, 5)
                                                            .map((item, index) => (
                                                                <tr key={item?.bookingId ?? item._id ?? index}>
                                                                    <td>{item?.bookingInfo?.customerName ?? 'Không có'}</td>
                                                                    <td>{item?.bookingInfo?.service ?? 'Không có'}</td>
                                                                    <td>{Number(item?.holdingAmount)?.toLocaleString('vi-VN') ?? '0'} VNĐ</td>
                                                                    <td>{Number(item?.technicianEarning)?.toLocaleString('vi-VN') ?? '0'} VNĐ</td>
                                                                    <td>{Number(item?.finalPrice)?.toLocaleString('vi-VN') ?? '0'} VNĐ</td>
                                                                </tr>
                                                            ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center">
                                                                Không có dữ liệu hoa hồng
                                                            </td>
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

        </>
    );
}

const AvailabilitySwitch = () => {
    const dispatch = useDispatch();
    const tech = useSelector((s) => s.auth?.technician || s.auth?.user);
    const availabilityState = useSelector((s) => s.technician?.availability);
    const globalLoading = useSelector((s) => s.technician?.loading);

    // Chuẩn hoá boolean
    const isAvailable = Boolean(
        (availabilityState && availabilityState.status) ??
        (availabilityState && availabilityState.isAvailable) ??
        availabilityState
    );

    const [pending, setPending] = React.useState(false);

    useEffect(() => {
        if (tech?._id) dispatch(fetchTechnicianAvailability(tech._id));
    }, [dispatch, tech?._id]);

    const handleToggle = async () => {
        if (!tech?._id || pending) return;
        setPending(true);
        try {
            await dispatch(
                changeTechnicianAvailability({
                    technicianId: tech._id,
                    status: !isAvailable,
                })
            );
        } finally {
            setPending(false);
        }
    };

    const disabled = !tech?._id || pending || globalLoading;

    return (
        <>
            <div className="availability-wrapper">
                <span className="status-text">
                    {pending
                        ? 'Đang cập nhật...'
                        : isAvailable
                            ? 'Nhận việc'
                            : 'Tạm ngưng'}
                </span>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    aria-pressed={isAvailable}
                    className={`switch ${isAvailable ? 'on' : ''}`}
                    title={
                        isAvailable
                            ? 'Đang nhận việc - bấm để tạm ngưng'
                            : 'Tạm ngưng - bấm để mở nhận việc'
                    }
                >
                    <span className="switch__thumb" />
                </button>
            </div>

            <style>{`
        .availability-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-text {
          font-weight: 500;
          font-size: 14px;
          color: ${isAvailable ? '#34c759' : '#6b7280'};
        }
        .switch {
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
        }
        .switch.on { background: #34c759; }
        .switch__thumb {
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
        .switch.on .switch__thumb {
          transform: translateX(24px);
        }
        .switch:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .switch:focus-visible {
          outline: 2px solid #34c759;
          outline-offset: 2px;
        }
      `}</style>
        </>
    );
};


const TechnicianJobList = () => {
    const dispatch = useDispatch();
    const technician = useSelector((state) => state.auth.technician);
    const { bookings, loading, error } = useSelector((state) => state.technician);

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

    const formatDateOnly = (ts) =>
        ts ? new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    useEffect(() => {
        if (technician?._id) {
            dispatch(fetchTechnicianJobs(technician._id));
        }
    }, [technician?._id, dispatch]);

    // ==== CHUẨN HÓA + SORT + LẤY 5 MỚI NHẤT (mới → cũ) ====
    const list = useMemo(() => {
        return Array.isArray(bookings) ? bookings : Array.isArray(bookings?.data) ? bookings.data : [];
    }, [bookings]);

    const toTime = (x) => (x ? new Date(x).getTime() : 0);

    const statusChipClass = (s = '') => {
        const x = String(s).toUpperCase();
        if (x === 'DONE' || x === 'COMPLETED') return 'chip chip--success';
        if (x.includes('CANCEL')) return 'chip chip--danger';
        if (x.includes('IN_PROGRESS')) return 'chip chip--warning';
        // mặc định: warning/đang xử lý
        return 'chip chip--warning';
    };

    const top5Newest = useMemo(() => {
        return list
            .slice()
            .sort((a, b) => {
                const ta = toTime(a?.schedule?.startTime) || toTime(a?.createdAt);
                const tb = toTime(b?.schedule?.startTime) || toTime(b?.createdAt);
                return tb - ta; // desc: mới → cũ
            })
            .slice(0, 5);
    }, [list]);

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

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
                                            <td colSpan="7" className="text-center">
                                                Không có đơn đặt lịch nào
                                            </td>
                                        </tr>
                                    ) : (
                                        top5Newest.map((b) => (
                                            <tr key={b?.bookingId || b?._id}>
                                                <td>{b?.bookingCode}</td>
                                                <td>{b?.customerName}</td>
                                                <td>{b?.serviceName}</td>
                                                <td>{b?.address?.split(',')[0]}</td>
                                                <td>{formatDateOnly(b?.schedule?.startTime || b?.createdAt)}</td>
                                                <td>
                                                    <span className={statusChipClass(b?.status)}>
                                                        {prettyStatus(b?.status)}
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
                <style>{`
        /* Chip trạng thái đồng bộ kích thước */
.chip{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:120px;    /* ✅ chiều rộng đồng đều */
  height:28px;        /* ✅ chiều cao đồng đều */
  padding:0 10px;
  border-radius:6px;
  font-size:13px;
  font-weight:600;
}

/* Màu rõ ràng cho từng trạng thái */
.chip--success{ background:#e6f7f0; color:#1e8e5a; border:1px solid #c4eddc; }
.chip--warning{ background:#fff7e6; color:#b77400; border:1px solid #ffe2b8; }
.chip--danger { background:#fdecee; color:#c23c43; border:1px solid #f7c7cd; }

      `}</style>
            </div>
        </>
    );
};

const CardsRow = () => (
    <div className="row">
        <ViewEarningAndCommission />

    </div>
);

function TechnicianDashboard() {
    // const { user } = useSelector((state) => state.auth);
    // console.log(user);

    const { technician } = useSelector((state) => state.auth);
    const technicianId = technician?._id;
    // const dispatch = useDispatch();
    // const user = useSelector((s) => s.auth.user);
    // console.log("user:", user);

    // const technicianId =
    // user?.role?._id ||
    // null;


    // // Gọi fetch ngay khi có user._id sau login
    // useEffect(() => {
    //     if (!technicianId) return;
    //     dispatch(fetchTechnicianJobs(technicianId));
    //     dispatch(fetchEarningAndCommission(technicianId));
    // }, [dispatch, technicianId]);

    return (
        <>
            <div class="main-wrapper">
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
        </>
    );
}

export default TechnicianDashboard;