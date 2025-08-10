// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect, useState } from 'react';
// import { fetchEarningAndCommission } from '../../features/technicians/technicianSlice';
// import { useParams } from 'react-router-dom';
// import BreadcrumbBar from '../../components/common/BreadcrumbBar';
// import Header from '../../components/common/Header';
// import { Link } from 'react-router-dom';

// const styles = {
//     pagination: {
//         display: 'flex',
//         justifyContent: 'center',
//         marginTop: '20px',
//     },
//     paginationBtn: {
//         backgroundColor: '#f8f9fa',
//         border: '1px solid #dee2e6',
//         borderRadius: '4px',
//         color: '#6c757d',
//         padding: '5px 10px',
//         margin: '0 5px',
//         cursor: 'pointer',
//         transition: 'all 0.2s',
//     },
//     disabledBtn: {
//         opacity: 0.5,
//         cursor: 'not-allowed',
//     },
// };

// function ViewEarningAndCommission() {
//     const dispatch = useDispatch();
//     // const { technicianId } = useParams();
//     // console.log("tech:" + technicianId);

//     const { earnings, loading, error } = useSelector((state) => state.technician);
//     const { user, technician } = useSelector((state) => state.auth);
//     const technicianId = technician._id;
//     console.log("tech" + technicianId);
//     const [page, setPage] = useState(0);
//     const limit = 5;
//     const [hasMore, setHasMore] = useState(true);


//     // useEffect(() => {
//     //     if (technicianId) {
//     //         dispatch(fetchEarningAndCommission(technicianId));
//     //     }
//     // }, [dispatch, technicianId]);

//     useEffect(() => {
//   if (technicianId) {
//     dispatch(fetchEarningAndCommission({ technicianId, limit, skip: page * limit }))
//       .then((res) => {
//         const returned = res.payload?.data || [];

//         // Nếu không có kết quả khi sang trang mới → quay về trang trước
//         if (returned.length === 0 && page > 0) {
//           setPage((prevPage) => Math.max(prevPage - 1, 0));
//         }

//         // Cập nhật trạng thái để kiểm soát nút "Trang Sau"
//         setHasMore(returned.length === limit);
//       });
//   }
// }, [dispatch, technicianId, page]);


//     const handlePageChange = (newPage) => {
//         if (newPage >= 0) {
//             setPage(newPage);
//         }
//     };

//     if (loading) return <p>Đang tải...</p>;
//     if (error) return <p>Lỗi: {error}</p>;


//     return (
//         <>
//             <div class="main-wrapper">
//                 <Header />

//                 <BreadcrumbBar />

//                 <div className="dashboard-section">
//                     <div className="container">
//                         <div className="row">
//                             <div className="col-lg-12">
//                                 <div className="dashboard-menu">
//                                     <ul>
//                                         <li>
//                                             <Link to={`/technician/${technicianId}`}>
//                                                 <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
//                                                 <span>Dashboard</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to={`/technician/${technicianId}/booking`} >
//                                                 <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
//                                                 <span>My Bookings</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to="/user-reviews">
//                                                 <img src="/public/img/icons/review-icon.svg" alt="Icon" />
//                                                 <span>Reviews</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to="/user-wishlist">
//                                                 <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
//                                                 <span>Wishlist</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to="/user-messages">
//                                                 <img src="/public/img/icons/message-icon.svg" alt="Icon" />
//                                                 <span>Messages</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to="/technician/deposit">
//                                                 <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
//                                                 <span>My Wallet</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to={`/technician/${technicianId}/earning`} className="active">
//                                                 <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
//                                                 <span>My Earnings</span>
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link to={`/technician/profile/${technicianId}`}>
//                                                 <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
//                                                 <span>Settings</span>
//                                             </Link>
//                                         </li>
//                                     </ul>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>


//                 <div className="content">
//                     <div className="container">
//                         <div className="content-header d-flex align-items-center justify-content-between">
//                             <h4>My Earnings</h4>
//                             <ul className="booking-nav">
//                                 <li>
//                                     <a href="user-bookings.html" className="active">
//                                         <i className="fa-solid fa-list"></i>
//                                     </a>
//                                 </li>
//                                 <li>
//                                     <a href="bookings-calendar.html">
//                                         <i className="fa-solid fa-calendar-days"></i>
//                                     </a>
//                                 </li>
//                             </ul>
//                         </div>
//                         <div class="card-body">
//                             <div class="table-responsive dashboard-table">
//                                 <table className="table datatable">
//                                     <thead className="thead-light">
//                                         <tr>
//                                             <th>Khách hàng</th>
//                                             <th>Dịch vụ</th>
//                                             <th>Tiền hoa hông</th>
//                                             <th>Tiền giữ lại</th>
//                                             <th>Thu nhập</th>
//                                             <th>Tổng tiền</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {Array.isArray(earnings) && earnings.length > 0 ? (
//                                             earnings.map((item, index) => (
//                                                 <tr key={item.bookingId ?? item._id ?? index}>
//                                                     <td>{item.bookingInfo?.customerName ?? 'Không có'}</td>
//                                                     <td>{item.bookingInfo?.service ?? 'Không có'}</td>
//                                                     <td>{item.commissionAmount?.toLocaleString() ?? '0'} VNĐ</td>
//                                                     <td>{item.holdingAmount?.toLocaleString() ?? '0'} VNĐ</td>
//                                                     <td>{item.technicianEarning?.toLocaleString() ?? '0'} VNĐ</td>
//                                                     <td>{item.finalPrice?.toLocaleString() ?? '0'} VNĐ</td>
//                                                 </tr>
//                                             ))
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan="6" className="text-center">
//                                                     Không có dữ liệu hoa hồng
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                             <div style={styles.pagination}>
//                                 <button
//                                     style={{
//                                         ...styles.paginationBtn,
//                                         ...(page === 0 ? styles.disabledBtn : {}),
//                                     }}
//                                     onClick={() => handlePageChange(page - 1)}
//                                     disabled={page === 0}
//                                 >
//                                     Trang Trước
//                                 </button>
//                                 <button
//                                     style={{
//                                         ...styles.paginationBtn,
//                                         ...(!Array.isArray(earnings) || earnings.length < limit ? styles.disabledBtn : {}),
//                                     }}
//                                     onClick={() => handlePageChange(page + 1)}
//                                     disabled={!Array.isArray(earnings) || earnings.length < limit}

//                                 >
//                                     Trang Sau
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>


//             </div>

//         </>
//     );
// }

// export default ViewEarningAndCommission;

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchEarningAndCommission } from '../../features/technicians/technicianSlice';
import { useParams } from 'react-router-dom';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import { Link } from 'react-router-dom';

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
};

function ViewEarningAndCommission() {
    const dispatch = useDispatch();

    const { earnings, loading, error } = useSelector((state) => state.technician);
    const { user, technician } = useSelector((state) => state.auth);
    const technicianId = technician._id;

    const [currentPage, setCurrentPage] = useState(1);
    const [allEarnings, setAllEarnings] = useState([]); // Lưu tất cả dữ liệu
    const itemsPerPage = 5;

    // Lấy tất cả dữ liệu một lần duy nhất
    useEffect(() => {
        if (technicianId) {
            dispatch(fetchEarningAndCommission(technicianId))
                .then((res) => {
                    const data = res.payload?.data || [];
                    setAllEarnings(data);
                });
        }
    }, [dispatch, technicianId]);

    // Tính toán dữ liệu cho trang hiện tại
    const totalPages = Math.ceil(allEarnings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEarnings = allEarnings.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

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
                                                            <Link to="/user-wishlist">
                                                                <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
                                                                <span>Yêu thích</span>
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link to="/technician/schedule">
                                                                <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                                                                <span>Lịch trình</span>
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link to="/technician/deposit" className="active">
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
                            <h4>My Earnings</h4>
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

                        <div className="card-body">
                            {/* Thông tin trang */}
                            <div className="mb-3">
                                <p style={styles.pageInfo}>
                                    Hiển thị {startIndex + 1} - {Math.min(endIndex, allEarnings.length)}
                                    trong tổng số {allEarnings.length} bản ghi
                                </p>
                            </div>

                            <div className="table-responsive dashboard-table">
                                <table className="table datatable">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Khách hàng</th>
                                            <th>Dịch vụ</th>
                                            <th>Tiền hoa hông</th>
                                            <th>Tiền giữ lại</th>
                                            <th>Thu nhập</th>
                                            <th>Tổng tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEarnings.length > 0 ? (
                                            currentEarnings.map((item, index) => (
                                                <tr key={item.bookingCode || index}>
                                                    <td>{item.bookingInfo?.customerName || 'Không có'}</td>
                                                    <td>{item.bookingInfo?.service || 'Không có'}</td>
                                                    <td>{item.commissionAmount?.toLocaleString() || '0'} VNĐ</td>
                                                    <td>{item.holdingAmount?.toLocaleString() || '0'} VNĐ</td>
                                                    <td>{item.technicianEarning?.toLocaleString() || '0'} VNĐ</td>
                                                    <td>{item.finalPrice?.toLocaleString() || '0'} VNĐ</td>
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

                            {/* Pagination - chỉ hiển thị khi có nhiều hơn 1 trang */}
                            {totalPages > 1 && (
                                <div style={styles.pagination}>
                                    {/* Nút Trang Trước */}
                                    <button
                                        style={{
                                            ...styles.paginationBtn,
                                            ...(currentPage === 1 ? styles.disabledBtn : {}),
                                        }}
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                    >
                                        ← Trước
                                    </button>

                                    {/* Các nút số trang */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            style={{
                                                ...styles.paginationBtn,
                                                ...(page === currentPage ? {
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    borderColor: '#007bff'
                                                } : {}),
                                            }}
                                            onClick={() => goToPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Nút Trang Sau */}
                                    <button
                                        style={{
                                            ...styles.paginationBtn,
                                            ...(currentPage === totalPages ? styles.disabledBtn : {}),
                                        }}
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
        </>
    );
}

export default ViewEarningAndCommission;