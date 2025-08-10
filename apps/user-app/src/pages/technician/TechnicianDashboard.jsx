import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import React from "react";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchEarningAndCommission, fetchTechnicianJobs, fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';
import { Link } from 'react-router-dom';

const BreadcrumbSection = () => (
    <div className="breadcrumb-bar">
        <div className="container">
            <div className="row align-items-center text-center">
                <div className="col-md-12 col-12">
                    <h2 className="breadcrumb-title">Technician Dashboard</h2>
                    <nav aria-label="breadcrumb" className="page-breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Technician Dashboard</li>
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
                    View Details <i className="feather-arrow-right" />
                </Link>
            ) : (
                <a href="#" className="view-link">
                    View Details <i className="feather-arrow-right" />
                </a>
            )}
        </div>
    </div>
);

// ---------- Widgets Row -----------
const WidgetsRow = () => {
    const { bookings } = useSelector((state) => state.technician);
    const { technician } = useSelector((state) => state.auth);
    // console.log(technician);


    return (
        <div className="row">
            <WidgetItem icon="book" title="My Bookings" value={bookings?.length} link="/technician/booking" />
            <WidgetItem icon="balance" title="Wallet Balance" value={technician?.balance.toLocaleString('vi-VN')} link="/technician/deposit" />
            <WidgetItem icon="transaction" title="Total Transactions" value="$15,210" color="success" link="/technician/earning" />
            <WidgetItem icon="cars" title="Wishlist Cars" value="24" color="danger" />
        </div>
    );
};

function ViewEarningAndCommission() {
    const dispatch = useDispatch();
    const { technician } = useSelector((state) => state.auth);
    // const technicianId = technician?._id;

    const { earnings, loading, error } = useSelector((state) => state.technician);

    useEffect(() => {
        if (technician?._id) {
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
                                                <h5>My Earnings</h5>
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
                                                        <th>Tiền hoa hồng</th>
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
                                                                <tr key={item.bookingId ?? item._id ?? index}>
                                                                    <td>{item.bookingInfo?.customerName ?? 'Không có'}</td>
                                                                    <td>{item.bookingInfo?.service ?? 'Không có'}</td>
                                                                    <td>{item.commissionAmount?.toLocaleString() ?? '0'} VNĐ</td>
                                                                    <td>{item.holdingAmount?.toLocaleString() ?? '0'} VNĐ</td>
                                                                    <td>{item.technicianEarning?.toLocaleString() ?? '0'} VNĐ</td>
                                                                    <td>{item.finalPrice?.toLocaleString() ?? '0'} VNĐ</td>
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

const TechnicianJobList = () => {
    const dispatch = useDispatch();
    const { technician } = useSelector((state) => state.auth);
    // const technicianId = technician._id;
    const { bookings, loading, error } = useSelector((state) => state.technician);

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
                                            <h4>My Bookings</h4>
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
                                                        This Week <i className="fas fa-chevron-down"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            This Week
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            This Month
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Last 30 Days
                                                        </a>
                                                        <a
                                                            className="dropdown-item"
                                                            href="javascript:void(0);"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#custom_date"
                                                        >
                                                            Custom
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
                                                        Sort By Relevance <i className="fas fa-chevron-down"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Sort By Relevance
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Sort By Ascending
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Sort By Descending
                                                        </a>
                                                        <a className="dropdown-item" href="javascript:void(0);">
                                                            Sort By Alphabet
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
                                            <tr key={b.bookingId || b._id}>
                                                <td>{b.bookingCode}</td>
                                                <td>{b.customerName}</td>
                                                <td>{b.serviceName}</td>
                                                <td>{b.address}</td>
                                                <td>{new Date(b.schedule).toLocaleString()}</td>
                                                <td >
                                                    <span
                                                        className={
                                                            b.status === 'DONE'
                                                                ? 'badge badge-light-success'
                                                                : b.status === 'CANCELLED'
                                                                    ? 'badge badge-light-danger'
                                                                    : 'badge badge-light-warning'
                                                        }>{b.status}</span></td>
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
        <ViewEarningAndCommission />

    </div>
);

function TechnicianDashboard() {
    const { technician } = useSelector((state) => state.auth);
    const technicianId = technician?._id;
    // console.log(technicianId);

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
                                                <span>Dashboard</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} >
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>My Bookings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/feedback">
                                                <img src="/public/img/icons/review-icon.svg" alt="Icon" />
                                                <span>Reviews</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/user-wishlist">
                                                <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
                                                <span>Wishlist</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/user-messages">
                                                <img src="/public/img/icons/message-icon.svg" alt="Icon" />
                                                <span>Messages</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/deposit">
                                                <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                                                <span>My Wallet</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/earning`}>
                                                <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>My Earnings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/profile`}>
                                                <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
                                                <span>Settings</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content dashboard-content">
                    <div className="container">

                        <div className="content-header">
                            <h4>Dashboard</h4>
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