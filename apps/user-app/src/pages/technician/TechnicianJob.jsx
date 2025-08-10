import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { fetchTechnicianJobs, fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';
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
        margin: '0 15px',
    },
    statusChip: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '120px',      // chiều rộng tối thiểu
        height: '28px',         // chiều cao đồng nhất
        padding: '0 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        borderRadius: '6px',
        fontSize: '14px',
    },

};


const TechnicianJobList = () => {
    const dispatch = useDispatch();
    const { bookings, loading, error } = useSelector((state) => state.technician);
    const { technician } = useSelector((state) => state.auth);

    const technicianId = technician?._id;

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [allBookings, setAllBookings] = useState([]);
    const itemsPerPage = 5;

    // ==== FILTER & SORT STATES ====
    const [timeRange, setTimeRange] = useState("week"); // week | month | 30d | all | custom
    const [customRange, setCustomRange] = useState({ from: "", to: "" }); // yyyy-mm-dd
    const [sortBy, setSortBy] = useState("relevance"); // relevance | timeAsc | timeDesc | alpha
    const [statusFilter, setStatusFilter] = useState("all");

    // ==== FILTER LOGIC ====
    // ==== FILTER LOGIC (calendar range) ====
    const inRange = (dateMs) => {
        if (!dateMs) return false;
        if (timeRange === "all") return true;

        const now = new Date();

        const endOfDay = (d) => {
            const x = new Date(d);
            x.setHours(23, 59, 59, 999);
            return x;
        };

        const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const startOfWeek = (d) => {
            // tuần bắt đầu THỨ 2
            const day = d.getDay();                 // 0=CN..6=T7
            const diff = (day === 0 ? -6 : 1 - day); // nếu CN (0) => lùi 6 ngày, ngược lại lùi (day-1)
            const s = new Date(d);
            s.setDate(d.getDate() + diff);
            return startOfDay(s);
        };
        const endOfWeek = (d) => {
            const s = startOfWeek(d);
            const e = new Date(s);
            e.setDate(s.getDate() + 6);
            return endOfDay(e);
        };

        const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = (d) => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));

        let start, end;

        if (timeRange === "week") {
            start = startOfWeek(now);
            end = endOfWeek(now);                   // ✅ gồm cả booking tương lai trong tuần này
        } else if (timeRange === "month") {
            start = startOfMonth(now);
            end = endOfMonth(now);                  // ✅ gồm cả booking tương lai trong tháng này
        } else if (timeRange === "30d") {
            end = endOfDay(now);
            start = new Date(end);
            start.setDate(end.getDate() - 29);      // 30 ngày gần nhất (bao gồm hôm nay)
        } else if (timeRange === "custom") {
            if (!customRange.from && !customRange.to) return true;
            start = customRange.from ? startOfDay(new Date(customRange.from)) : new Date(0);
            end = customRange.to ? endOfDay(new Date(customRange.to)) : new Date(8640000000000000);
        } else {
            // fallback
            start = new Date(0);
            end = new Date(8640000000000000);
        }

        return dateMs >= start.getTime() && dateMs <= end.getTime();
    };


    // ==== SORT LOGIC ====
    const sortBookings = (arr) => {
        const copy = [...arr];
        if (sortBy === "alpha") {
            copy.sort((a, b) => (a.serviceName || "").localeCompare(b.serviceName || "", "vi"));
        } else if (sortBy === "timeAsc") {
            copy.sort((a, b) => new Date(a?.schedule?.startTime) - new Date(b?.schedule?.startTime));
        } else if (sortBy === "timeDesc") {
            copy.sort((a, b) => new Date(b?.schedule?.startTime) - new Date(a?.schedule?.startTime));
        } else {
            // relevance: ưu tiên Inprogress -> Upcoming -> Others, sau đó gần thời gian hiện tại trước
            const rank = (s) => {
                const x = (s || "").toUpperCase();
                if (x.includes("INPROGRESS")) return 0;
                if (x.includes("UPCOMING")) return 1;
                if (x.includes("DONE") || x.includes("COMPLETED")) return 2;
                if (x.includes("CANCELLED")) return 3;
                return 4;
            };
            copy.sort((a, b) => {
                const r = rank(a.status) - rank(b.status);
                if (r !== 0) return r;
                return Math.abs(new Date(a?.schedule?.startTime) - Date.now()) -
                    Math.abs(new Date(b?.schedule?.startTime) - Date.now());
            });
        }
        return copy;
    };

    // ==== APPLY FILTER & SORT TRƯỚC KHI PHÂN TRANG ====
    // const filteredSorted = sortBookings(
    //     (allBookings || []).filter((b) => inRange(new Date(b?.schedule?.startTime).getTime()))
    // );
    // Filter thêm theo status
    const filteredSorted = sortBookings(
        (allBookings || [])
            .filter((b) => inRange(new Date(b?.schedule?.startTime).getTime()))
            .filter((b) => {
                if (statusFilter === "all") return true;
                return (b.status || "").toLowerCase() === statusFilter.toLowerCase();
            })
    );

    // ==== Pagination chạy trên filteredSorted ====
    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredSorted.slice(startIndex, endIndex);

    // Khi đổi filter/sort -> về trang 1
    useEffect(() => { setCurrentPage(1); }, [timeRange, customRange.from, customRange.to, sortBy]);


    useEffect(() => {
        if (technicianId) {
            dispatch(fetchTechnicianJobs(technicianId)).then((res) => {
                const data = res.payload?.data || res.payload || [];
                setAllBookings(Array.isArray(data) ? data : []);
            });
        }
    }, [technicianId, dispatch]);

    // Dropdown state (React-only)
    const [openRange, setOpenRange] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [showCustomInline, setShowCustomInline] = useState(false);




    const rangeRef = React.useRef(null);
    const sortRef = React.useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const onDocClick = (e) => {
            if (rangeRef.current && !rangeRef.current.contains(e.target)) setOpenRange(false);
            if (sortRef.current && !sortRef.current.contains(e.target)) setOpenSort(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);


    // Tính toán dữ liệu cho trang hiện tại
    //   const totalPages = Math.max(1, Math.ceil(allBookings.length / itemsPerPage));
    //   const startIndex = (currentPage - 1) * itemsPerPage;
    //   const endIndex = startIndex + itemsPerPage;
    //   const currentBookings = allBookings.slice(startIndex, endIndex);

    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const goToPage = (page) => page >= 1 && page <= totalPages && setCurrentPage(page);

    const handleViewDetails = (technicianId, bookingId) => {
        dispatch(fetchTechnicianJobDetails({ technicianId, bookingId }));
    };

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

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <>
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
                                                <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Bảng điểu khiển</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} className="active">
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
                                                <img style={{ height: '28px' }} src="/public/img/cer.png" alt="Icon" />
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
                                        <li>
                                            <Link to={`/technician/earning`}>
                                                <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>Thu nhập</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/profile`}>
                                                <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
                                                <span>Cái đặt</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container">
                        <div className="content-header d-flex align-items-center justify-content-between">
                            <h4>Đơn hàng của tôi</h4>
                            <ul className="booking-nav">
                                <li>
                                    <a href="user-bookings.html" className="active">
                                        <i className="fa-solid fa-list"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="bookings-calendar.html">
                                        <i className="fa-solid fa-calendar-days"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="sorting-info">
                                    <div className="row d-flex align-items-center">
                                        <div className="col-xl-7 col-lg-8 col-sm-12 col-12">
                                            <div className="booking-lists">
                                                <div className="status-filter">
                                                    <button
                                                        className={statusFilter === "all" ? "active" : ""}
                                                        onClick={() => setStatusFilter("all")}
                                                    >
                                                        Tất cả
                                                    </button>
                                                    <button
                                                        className={statusFilter === "UPCOMING" ? "active" : ""}
                                                        onClick={() => setStatusFilter("UPCOMING")}
                                                    >
                                                        Đã lên lịch
                                                    </button>
                                                    <button
                                                        className={statusFilter === "INPROGRESS" ? "active" : ""}
                                                        onClick={() => setStatusFilter("INPROGRESS")}
                                                    >
                                                        Đang xử lí
                                                    </button>
                                                    <button
                                                        className={statusFilter === "DONE" ? "active" : ""}
                                                        onClick={() => setStatusFilter("DONE")}
                                                    >
                                                        Đã hoàn thành
                                                    </button>
                                                    <button
                                                        className={statusFilter === "CANCELLED" ? "active" : ""}
                                                        onClick={() => setStatusFilter("CANCELLED")}
                                                    >
                                                        Đã hủy
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-xl-5 col-lg-4 col-sm-12 col-12">
                                            <div className="filter-group">
                                                {/* TIME RANGE (React dropdown) */}
                                                <div className="sort-week sort" ref={rangeRef}>
                                                    <div className="dropdown dropdown-action" style={{ position: 'relative' }}>
                                                        <button
                                                            type="button"
                                                            className="dropdown-toggle"
                                                            onClick={() => {
                                                                setOpenRange((v) => !v);
                                                                setOpenSort(false);
                                                            }}
                                                            style={{ background: 'transparent', border: 0 }}
                                                            aria-haspopup="true"
                                                            aria-expanded={openRange}
                                                        >
                                                            {timeRange === "week" ? "Tuần này"
                                                                : timeRange === "month" ? "Tháng này"
                                                                    : "All"} <i className="fas fa-chevron-down"></i>
                                                        </button>

                                                        {openRange && (
                                                            <div
                                                                className="dropdown-menu dropdown-menu-end show"
                                                                style={{ display: 'block', position: 'absolute', right: 0, top: '100%' }}
                                                                role="menu"
                                                            >
                                                                <button className="dropdown-item" onClick={() => { setTimeRange("week"); setShowCustomInline(false); setOpenRange(false); }}>
                                                                    Tuần này
                                                                </button>
                                                                <button className="dropdown-item" onClick={() => { setTimeRange("month"); setShowCustomInline(false); setOpenRange(false); }}>
                                                                    Tháng này
                                                                </button>

                                                                <div className="dropdown-divider"></div>
                                                                <button className="dropdown-item" onClick={() => { setTimeRange("all"); setShowCustomInline(false); setOpenRange(false); }}>
                                                                    All
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* SORT (React dropdown) */}
                                                <div className="sort-relevance sort" ref={sortRef}>
                                                    <div className="dropdown dropdown-action" style={{ position: 'relative' }}>
                                                        <button
                                                            type="button"
                                                            className="dropdown-toggle"
                                                            onClick={() => {
                                                                setOpenSort((v) => !v);
                                                                setOpenRange(false);
                                                            }}
                                                            style={{ background: 'transparent', border: 0 }}
                                                            aria-haspopup="true"
                                                            aria-expanded={openSort}
                                                        >
                                                            {sortBy === "timeAsc" ? "Tăng dần"
                                                                : sortBy === "timeDesc" ? "Giảm dần"
                                                                    : " Sắp xếp theo A–Z"} <i className="fas fa-chevron-down"></i>
                                                        </button>

                                                        {openSort && (
                                                            <div
                                                                className="dropdown-menu dropdown-menu-end show"
                                                                style={{ display: 'block', position: 'absolute', right: 0, top: '100%' }}
                                                                role="menu"
                                                            >

                                                                <button className="dropdown-item" onClick={() => { setSortBy("timeAsc"); setOpenSort(false); }}>
                                                                    Tăng dần
                                                                </button>
                                                                <button className="dropdown-item" onClick={() => { setSortBy("timeDesc"); setOpenSort(false); }}>
                                                                    Giảm dần
                                                                </button>
                                                                <button className="dropdown-item" onClick={() => { setSortBy("alpha"); setOpenSort(false); }}>
                                                                    Sắp xếp theo A–Z
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>{/* row */}
                                </div>
                            </div>
                        </div>

                        {/* Thông tin phân trang */}
                        <div className="row mb-3">
                            <div className="col-12">
                                <p style={styles.pageInfo}>
                                    Hiển thị {filteredSorted.length === 0 ? 0 : (startIndex + 1)} - {Math.min(endIndex, filteredSorted.length)} trong tổng số {filteredSorted.length} đơn đặt
                                </p>

                            </div>
                        </div>

                        <div className="card-body">
                            {/* Lưu ý: vẫn giữ class .table-responsive nhưng tắt overflow-x bằng CSS bên dưới */}
                            <div className="table-responsive dashboard-table">
                                <table className="table datatable table-modern">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Dịch vụ</th>
                                            <th>Địa chỉ</th>
                                            <th>Thời gian đến</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBookings.length > 0 ? (
                                            currentBookings.map((b) => {
                                                const id = b.bookingId || b._id;
                                                return (
                                                    <tr key={id}>
                                                        <td className="mono">{b.bookingCode}</td>
                                                        <td>{b.serviceName}</td>
                                                        <td>{b.address}</td>
                                                        <td className="mono">
                                                            {new Date(b.schedule.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{" "}
                                                            {new Date(b.schedule.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}{" "}
                                                            -{" "}
                                                            {new Date(b.schedule.expectedEndTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{" "}
                                                            {new Date(b.schedule.expectedEndTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${b.status === 'DONE' || b.status === 'COMPLETED'
                                                                    ? 'badge-light-success'
                                                                    : (b.status || '').toUpperCase().includes('CANCEL')
                                                                        ? 'badge-light-danger'
                                                                        : 'badge-light-warning'
                                                                    }`}
                                                                style={styles.statusChip}
                                                            >
                                                                {prettyStatus(b.status)}
                                                            </span>
                                                        </td>

                                                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} className="dropdown dropdown-action">
                                                                <a href="#" className="dropdown-toggle" data-bs-toggle="dropdown" aria-label="More actions">
                                                                    <i className="fas fa-ellipsis-vertical"></i>
                                                                </a>
                                                                <div className="dropdown-menu dropdown-menu-end">
                                                                    <Link to={`/technician/booking/${id}`} className="dropdown-item">
                                                                        <i className="feather-eye"></i> View
                                                                    </Link>
                                                                    <button className="dropdown-item">
                                                                        <i className="feather-trash-2"></i> Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>

                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                {/* bảng có 6 cột → colSpan=6 */}
                                                <td colSpan="6" className="text-center">
                                                    Không có đơn đặt nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination - chỉ hiển thị khi có nhiều hơn 1 trang */}
                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    <button
                                        style={{ ...styles.paginationBtn, ...(currentPage === 1 ? styles.disabledBtn : {}) }}
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                    >
                                        ← Trước
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            style={{
                                                ...styles.paginationBtn,
                                                ...(page === currentPage
                                                    ? { backgroundColor: '#007bff', color: 'white', borderColor: '#007bff' }
                                                    : {}),
                                            }}
                                            onClick={() => goToPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        style={{ ...styles.paginationBtn, ...(currentPage === totalPages ? styles.disabledBtn : {}) }}
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS NHÚNG – KHÔNG THANH KÉO NGANG, CHO PHÉP XUỐNG DÒNG */}
            <style>{`
        /* Cho phép xuống dòng trong bảng (ghi đè mọi nowrap) */
        .table-modern th,
        .table-modern td,
        .table.datatable th,
        .table.datatable td {
          white-space: normal !important;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        /* Cột mã/chuỗi liền không có dấu cách vẫn bẻ dòng */
        .mono { word-break: break-all; }

        /* Tránh bảng tự giãn vô hạn gây tràn ngang */
        .table-modern {
          table-layout: fixed;
          width: 100%;
        }

        /* Tắt kéo ngang của Bootstrap wrapper */
        .table-responsive {
          overflow-x: visible !important;
        }

        /* (Tuỳ chọn) đặt tỉ lệ cột để wrap hợp lý hơn */
        .table-modern th:nth-child(1),
        .table-modern td:nth-child(1) { width: 18ch; }   /* Mã đơn */
        .table-modern th:nth-child(2),
        .table-modern td:nth-child(2) { width: 22%; }    /* Dịch vụ */
        .table-modern th:nth-child(3),
        .table-modern td:nth-child(3) { width: 38%; }    /* Địa chỉ */
        .table-modern th:nth-child(4),
        .table-modern td:nth-child(4) { width: 22%; }    /* Thời gian đến */
        .table-modern th:nth-child(5),
        .table-modern td:nth-child(5) { width: 10%; }    /* Trạng thái */
        .table-modern th:nth-child(6),
        .table-modern td:nth-child(6) { width: 10%; }    /* Thao tác */
        .status-filter {
  display: flex;
  gap: 10px;
}

.status-filter button {
  border: 1px solid #ccc;
  background-color: white;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;
}

.status-filter button:hover {
  background-color: #f5f5f5;
}

.status-filter button.active {
  background-color: #197d87;
  color: white;
  border-color: #197d87;
}

      `}</style>
        </>
    );
};

export default TechnicianJobList;
