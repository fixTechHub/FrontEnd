import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
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
    const bookings = useSelector((state) => state.technician.bookings);
    const { technician } = useSelector((state) => state.auth);
    // console.log("tech", technician);
    // console.log(bookings);


    // useEffect(() => {

    //     if (!technician?._id) return;
    //     dispatch(fetchTechnicianJobs(technician?._id));
    // }, [dispatch, technician?._id]);

    const bookingCount = Array.isArray(bookings) ? bookings.length : 0;
    console.log("boking", bookingCount);



    // const bookingCount = bookings?.length ?? 0;
    const walletBalance = technician?.balance != null
        ? technician.balance.toLocaleString('vi-VN')
        : '0';

    return (
        <div className="row">
            <WidgetItem icon="book" title="Đơn hàng của tôi" value={bookingCount} link="/technician/booking" />
            <WidgetItem icon="balance" title="Tài khoản" value={`${walletBalance} VND`} link="/technician/deposit" />
            <WidgetItem icon="transaction" title="Đánh giá" value="20" color="success" link="/technician/feedback" />
            <WidgetItem icon="cars" title="Thu nhập hôm nay" value="240.000 VNĐ" link="/technician/earning" />
        </div>
    );
};

function ViewEarningAndCommission() {
    const dispatch = useDispatch();
    const technician = useSelector((state) => state.auth.technician);
    console.log("technician", technician);

    // const technicianId = technician._id;

    const { earnings, loading, error } = useSelector((state) => state.technician);
    console.log(earnings);
    
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
    // const technicianId = technician._id;
    const { bookings, loading, error } = useSelector((state) => state.technician);
    console.log(technician?._id);
    const STATUS_SHORT = {
        WAITING_CUSTOMER_CONFIRM_ADDITIONAL: "Đợi xác nhận",
        CONFIRM_ADDITIONAL: "Đã xác nhận",
        AWAITING_DONE: "Đợi hoàn thành",
        IN_PROGRESS: "Đang thực hiện",
        DONE: "Đã hoàn thành",
        CANCELLED: "Đã hủy",
        PENDING: "Đang xử lí"
        // …bổ sung nếu cần
    };
    const prettyStatus = (raw = "") => {
        const key = String(raw).toUpperCase().trim();
        if (STATUS_SHORT[key]) return STATUS_SHORT[key];
        // fallback: SNAKE_CASE -> Title Case gọn
        return key
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());
    };
    useEffect(() => {
        if (technician?._id) {
            dispatch(fetchTechnicianJobs(technician?._id));
        }
    }, [technician?._id, dispatch]);

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
                                    <div className="col-xl-5 col-lg-4 col-sm-12 col-12">
                                        <div className="filter-group">
                                            <div className="sort-week sort">
                                                <div className="dropdown dropdown-action">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="dropdown-toggle"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Tuần này <i className="fas fa-chevron-down"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Tuần này
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Tháng này
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            30 ngày gần nhất
                                                        </a>
                                                        <a
                                                            className="dropdown-item"
                                                            href="javascript:void(0);"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#custom_date"
                                                        >

                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sort-relevance sort">
                                                <div className="dropdown dropdown-action">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="dropdown-toggle"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Tăng dần <i className="fas fa-chevron-down"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">

                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Tăng dần
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Giảm giần
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Sắp xếp theo bảng chữ cái
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive dashboard-table">
                            <table className="table datatable">
                                <thead className="thead-light">
                                    <tr>
                                        <th>
                                            Mã đơn
                                        </th>
                                        <th>Tên Khách Hàng</th>
                                        <th>Dịch vụ</th>
                                        <th>Địa chỉ</th>
                                        <th>Thời gian</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">Đang tải...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-danger">{error}</td>
                                        </tr>
                                    ) : !Array.isArray(bookings) || bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">Không có đơn đặt lịch nào</td>
                                        </tr>
                                    ) : (
                                        bookings
                                            .slice(0, 5)
                                            .map((b) => (
                                                <tr key={b?.bookingId || b._id}>
                                                    <td>{b?.bookingCode}</td>
                                                    <td>{b?.customerName}</td>
                                                    <td>{b?.serviceName}</td>
                                                    <td>{b?.address?.split(",")[0]}</td>
                                                    <td>
                                                        {formatDateOnly(b?.schedule.startTime)}
                                                    </td>
                                                    <td >
                                                        <span
                                                            className={
                                                                b.status === 'DONE'
                                                                    ? 'badge badge-light-success'
                                                                    : b.status === 'CANCELLED'
                                                                        ? 'badge badge-light-danger'
                                                                        : 'badge badge-light-warning'
                                                            }>{prettyStatus(b.status)}</span></td>
                                                    <td className="text-end">
                                                        <div className="dropdown dropdown-action">
                                                            <a
                                                                href="javascript:void(0);"
                                                                className="dropdown-toggle"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                <i className="fas fa-ellipsis-vertical"></i>
                                                            </a>

                                                        </div>
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

            {/* <Footer /> */}
        </>
    );
}

const CardsRow = () => (
    <div className="row">
        {/* <ViewEarningAndCommission /> */}

    </div>
);

function TechnicianDashboard() {
    // const { user } = useSelector((state) => state.auth);
    // console.log(user);

    const { technician } = useSelector((state) => state.auth);
    const technicianId = technician._id;
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
                                                <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Bảng điểu khiển</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} >
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>Đơn hàng</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/feedback">
                                                <img src="/public/img/icons/review-icon.svg" alt="Icon" />
                                                <span>Đánh giá</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/${technicianId}/certificate`}>
                                                <img style={{height: '28px'}} src="/public/img/cer.png" alt="Icon" />
                                                <span>Chứng chỉ</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/schedule">
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>Lịch trình</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/deposit">
                                                <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                                                <span>Ví của tôi</span>
                                            </Link>
                                        </li>
                                        {/* <li>
                                            <Link to={`/technician/earning`}>
                                                <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>Thu nhập</span>
                                            </Link>
                                        </li> */}
                                        {/* <li>
                                            <Link to={`/profile`}>
                                                <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
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
                            <h4>Dashboard</h4>
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