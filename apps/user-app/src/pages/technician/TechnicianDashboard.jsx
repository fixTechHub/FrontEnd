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

const StatusList = () => (
    <ul className="status-lists">
        <li className="approve-item">
            <div className="status-info">
                <span><i className="fa-solid fa-calendar-days" /></span>
                <p>Your Booking has been Approved by admin</p>
            </div>
            <a href="#" className="view-detail">View Details</a>
        </li>
        <li>
            <div className="status-info">
                <span><i className="fa-solid fa-money-bill" /></span>
                <p>Your Refund request has been approved by admin &amp; your payment will be updated in 3 days.</p>
            </div>
            <a href="#" className="close-link"><i className="feather-x" /></a>
        </li>
        <li className="bg-danger-light">
            <div className="status-info">
                <span><i className="fa-solid fa-money-bill" /></span>
                <p>Your Refund request has been rejected by admin <a href="#">View Reason</a></p>
            </div>
            <a href="#" className="close-link"><i className="feather-x" /></a>
        </li>
    </ul>
);

// ---------- Widget Item component -----------
const WidgetItem = ({ icon, title, value, color }) => (
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
            <a href="#" className="view-link">
                View Details <i className="feather-arrow-right" />
            </a>
        </div>
    </div>
);

// ---------- Widgets Row -----------
const WidgetsRow = () => (
    <div className="row">
        <WidgetItem icon="book" title="My Bookings" value="450" />
        <WidgetItem icon="balance" title="Wallet Balance" value="$24,665" color="warning" />
        <WidgetItem icon="transaction" title="Total Transactions" value="$15,210" color="success" />
        <WidgetItem icon="cars" title="Wishlist Cars" value="24" color="danger" />
    </div>
);

function ViewEarningAndCommission() {
    const dispatch = useDispatch();
    const { technicianId } = useParams();
    console.log("tech:" + technicianId);

    const { earnings, loading, error } = useSelector((state) => state.technician);

    useEffect(() => {
        if (technicianId) {
            dispatch(fetchEarningAndCommission(technicianId));
        }
    }, [dispatch, technicianId]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;
    if (!earnings || earnings.length === 0) return <p>Không có dữ liệu thu nhập.</p>;

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
                                            <tbody>
                                                {earnings.map((item, index) => (
                                                    <tr key={item.bookingId ?? item._id ?? index}>
                                                        <td>
                                                            <h6>Khách Hàng</h6>
                                                            <p>{item.bookingInfo?.customerName?.fullName ?? 'Không có'}</p>
                                                        </td>
                                                        <td>
                                                            <h6>Dịch vụ</h6>
                                                            <p>{item.bookingInfo?.service?.serviceName ?? 'Không có'}</p>
                                                        </td>
                                                        <td>
                                                            <h6>Hoa hồng</h6>
                                                            <p>{item.commissionAmount?.toLocaleString() ?? '0'} VNĐ</p>
                                                        </td>
                                                        <td>
                                                            <h6>Giữ lại</h6>
                                                            <p>{item.holdingAmount?.toLocaleString() ?? '0'} VNĐ</p>
                                                        </td>
                                                        <td>
                                                            <h6>Thu nhập kỹ thuật viên</h6>
                                                            <p>{item.technicianEarning?.toLocaleString() ?? '0'} VNĐ</p>
                                                        </td>
                                                        <td>
                                                            <h6>Tổng tiền</h6>
                                                            <h5 className="text-danger">{item.finalPrice?.toLocaleString() ?? '0'} VNĐ</h5>
                                                        </td>

                                                    </tr>
                                                ))}
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
    const { technicianId } = useParams();
    const { bookings, loading, error } = useSelector((state) => state.technician);

    useEffect(() => {
        if (technicianId) {
            dispatch(fetchTechnicianJobs(technicianId));
        }
    }, [technicianId, dispatch]);

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
                                    {Array.isArray(bookings) && bookings.map((b) => (
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>



                </div>
            </div>
        </>
    );
}

const CardsRow = () => (
    <div className="row">
        <ViewEarningAndCommission />

    </div>
);

function TechnicianDashboard() {
    const { technicianId } = useParams();
    return (
        <>
            <div class="main-wrapper">

                <BreadcrumbSection />

                <div className="dashboard-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="dashboard-menu">
                                    <ul>
                                        <li>
                                            <Link to={`/technician/${technicianId}`} className="active">
                                                <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/${technicianId}/booking`} >
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>My Bookings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/user-reviews">
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
                                            <Link to="/user-wallet">
                                                <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                                                <span>My Wallet</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/${technicianId}/earning`}>
                                                <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                                                <span>My Earnings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/profile/${technicianId}`}>
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
                        <StatusList />
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
