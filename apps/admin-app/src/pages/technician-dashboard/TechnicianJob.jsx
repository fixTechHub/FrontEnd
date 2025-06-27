import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTechnicianJobs, fetchTechnicianJobDetails } from '../../features/technician/technicianSlice';

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

    const handleViewDetails = (bookingId, technicianId) => {
        dispatch(fetchTechnicianJobDetails({ bookingId, technicianId }));
    };

    return (

        <>
        <div className="main-wrapper">
            <div className="sidebar" id="sidebar">
                    <div className="sidebar-logo">
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="logo logo-normal">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo.svg" alt="Logo" />
                        </a>
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="logo-small">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-small.svg" alt="Logo" />
                        </a>
                        <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/index.html" className="dark-logo">
                            <img src="https://dreamsrent.dreamstechnologies.com/html/template/admin/assets/img/logo-white.svg" alt="Logo" />
                        </a>
                    </div>

                    <div className="sidebar-inner slimscroll overflow-auto" style={{ maxHeight: '100vh' }}>
                        <div id="sidebar-menu" className="sidebar-menu">
                            <div className="form-group">
                                <div className="input-group input-group-flat d-inline-flex">
                                    <span className="input-icon-addon">
                                        <i className="ti ti-search"></i>
                                    </span>
                                    <input type="text" className="form-control" placeholder="Search" />
                                    <span className="group-text">
                                        <i className="ti ti-command"></i>
                                    </span>
                                </div>
                            </div>
                            <ul>
                                <li className="menu-title"><span>Main</span></li>
                                <li>
                                    <ul>
                                        <li className="active">
                                            <a href="">
                                                <i className="ti ti-layout-dashboard"></i><span>Dashboard</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Bookings</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-files"></i><span>Reservations</span><span className="track-icon"></span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`/technician/${technicianId}/booking`}>
                                                <i className="ti ti-calendar-bolt"></i><span>Work</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Manage</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-users-group"></i><span>Account</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href={`/technician/profile/${technicianId}`}>
                                                <i className="ti ti-users-group"></i><span>Profile</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-star"></i><span>Reviews</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>FINANCE & ACCOUNTS</span></li>
                                <li>
                                    <ul>
                                        <li >
                                            <a href={`/technician/${technicianId}/earning`}>
                                                <i className="ti ti-file-invoice"></i><span>Earnings</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-credit-card"></i><span>Payments</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>OTHERS</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="https://dreamsrent.dreamstechnologies.com/html/template/admin/chat.html">
                                                <i className="ti ti-message"></i><span>Messages</span><span className="count">5</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-bell"></i><span>Notifications</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-flag"></i><span>Reports</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-settings"></i><span>Settings</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu-title"><span>Pages</span></li>
                                <li>
                                    <ul>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-lock"></i><span>Login</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-user"></i><span>Register</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-circle-check"></i><span>Forgot Password</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="">
                                                <i className="ti ti-file-invoice"></i><span>Verification</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            <div className="page-wrapper">
                <div className="content pb-0">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h4 className="mb-1">Dashboard</h4>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">Technician Dashboard</li>
                                </ol>
                            </nav>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
                                        <h5 className="mb-1">Job</h5>
                                        <a
                                            href=""
                                            className="text-decoration-underline fw-medium mb-1"
                                        >
                                            View All
                                        </a>
                                    </div>
                                    <div className="custom-table table-responsive">
                                        <table className="table datatable">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Mã đơn</th>
                                                    <th>Tên khách hàng</th>
                                                    <th>Dịch vụ</th>
                                                    <th>Địa chỉ</th>
                                                    <th>Ngày</th>
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
                                                        <td>{b.status}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleViewDetails(b._id, b.technicianId)}
                                                            >
                                                                Xem chi tiết
                                                            </button>
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

export default TechnicianJobList;