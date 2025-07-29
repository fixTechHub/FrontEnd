import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import React from 'react';
import { Link } from 'react-router-dom';
import { fetchTechnicianJobs, fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';

const TechnicianJobList = () => {
    const dispatch = useDispatch();
    const { profile, bookings, loading, error } = useSelector((state) => state.technician);
    const { technician } = useSelector((state) => state.auth);

    const technicianId = technician._id;
    console.log(technicianId);

    useEffect(() => {
        if (technicianId) {
            dispatch(fetchTechnicianJobs(technicianId));
        }
    }, [technicianId, dispatch]);

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    const handleViewDetails = (technicianId, bookingId) => {
        dispatch(fetchTechnicianJobDetails({ technicianId, bookingId }));
    };

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
                                            <Link to={`/technician`}>
                                                <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`/technician/booking`} className="active">
                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                <span>My Bookings</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/technician/feedback" >
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
                                            <Link to={`/technician/earning`} >
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

                <div className="content">
                    <div className="container">
                        <div className="content-header d-flex align-items-center justify-content-between">
                            <h4>My Bookings</h4>
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
                                                <ul className="nav">
                                                    <li><a className="active" href="user-bookings.html">All Bookings</a></li>
                                                    <li><a href="user-booking-upcoming.html">Upcoming</a></li>
                                                    <li><a href="user-booking-inprogress.html">Inprogress</a></li>
                                                    <li><a href="user-booking-complete.html">Completed</a></li>
                                                    <li><a href="user-booking-cancelled.html">Cancelled</a></li>
                                                </ul>
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
                                            <th>Thời gian đến</th>
                                            <th>Trạng thái</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(bookings) && bookings.map((b) => {
                                            const id = b.bookingId || b._id;
                                            console.log(bookings);

                                            console.log("bôking" + id);

                                            return (
                                                <tr key={id}>
                                                    <td>{b.bookingCode}</td>
                                                    <td>{b.customerName}</td>
                                                    <td>{b.serviceName}</td>
                                                    <td>{b.address}</td>
                                                    <td>
                                                        
                                                        {new Date(b.schedule.startTime).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}{" "}
                                                        {new Date(b.schedule.startTime).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}{" "}
                                                        -{" "}
                                                        {new Date(b.schedule.expectedEndTime).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}{" "}
                                                        {new Date(b.schedule.expectedEndTime).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                b.status === 'DONE'
                                                                    ? 'badge badge-light-success'
                                                                    : b.status === 'CANCELLED'
                                                                        ? 'badge badge-light-danger'
                                                                        : 'badge badge-light-warning'
                                                            }>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="dropdown dropdown-action">
                                                            <a href="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                                                                <i className="fas fa-ellipsis-vertical"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <Link
                                                                    to={`/technician/booking/${id}`}
                                                                    className="dropdown-item"
                                                                >
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
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        </div>



                    </div>
                </div>
            </div>


        </>
    );
}

export default TechnicianJobList;




