import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedbacks } from '../../features/technicians/technicianSlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const ListFeedback = () => {
    const dispatch = useDispatch();
    const { technician } = useSelector((state) => state.auth);
    const technicianId  = technician._id;
    console.log(technicianId);
    
    const { feedbacks, loading, error } = useSelector((state) => state.technician);
    console.log("feedback:", feedbacks);
    
    useEffect(() => {
        dispatch(fetchFeedbacks(technicianId));
    }, [dispatch])

    // if (loading) return <p>Đang tải...</p>;
    // if (error) return <p>Lỗi: {error}</p>;


    return (
        <>
            <div class="main-wrapper">

                <Header />

                <BreadcrumbBar />

                <div className="dashboard-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="dashboard-menu">
                                    <ul>
                                        <li>
                                            <Link to={`/technician/${technicianId}`}>
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
                                            <Link to="/technician/feedback" className="active">
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
                            <h4>Đánh giá của tôi</h4>
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
                        <div class="card-body">
                            <div class="table-responsive dashboard-table">
                                <table className="table datatable">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Khách hàng</th>
                                            <th>Nội dung</th>
                                            <th>Đánh giá</th>
                                            <th>Hình ảnh</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                                            feedbacks.map((item, index) => (
                                                <tr >
                                                    <td>{item?.fromUser?.fullName}</td>
                                                    <td>{item?.content}</td>
                                                    <td>{item?.rating} <i className="fas fa-star text-warning"></i></td>
                                                    <td>{item?.image || 'Không có hình ảnh'}</td>
                                                
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    Không có dữ liệu đánh giá
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

        </>
    )
}
export default ListFeedback;