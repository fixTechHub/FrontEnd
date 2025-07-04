import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserBookingHistory, cancelBooking } from '../../../features/bookings/bookingSlice';
import { requestWarrantyThunk, resetWarrantyState } from '../../../features/booking-warranty/warrantySlice';
import { formatDate } from '../../../utils/formatDate';
import { toast } from 'react-toastify';

const styles = {
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    },
    paginationBtn: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        color: '#6c757d',
        padding: '5px 10px',
        margin: '0 5px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        
    },
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};

const BookingHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { bookings, status, error } = useSelector((state) => state.booking);
    const { loading: warrantyLoading, error: warrantyError } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);

    const [page, setPage] = useState(0);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // Warranty states
    const [warrantyReason, setWarrantyReason] = useState('');
    const [warrantyReasonError, setWarrantyReasonError] = useState(null);
    const [selectedWarrantyBookingId, setSelectedWarrantyBookingId] = useState(null);

    const limit = 5;

    useEffect(() => {
        dispatch(fetchUserBookingHistory({ limit, skip: page * limit }));
    }, [dispatch, page]);

    const handleCancelBooking = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy');
            return;
        }
        try {
            await dispatch(cancelBooking({ bookingId: selectedBookingId, reason: cancelReason })).unwrap();
            toast.success('Hủy đặt chỗ thành công');
            setCancelReason('');
            setShowCancelModal(false);
            setSelectedBookingId(null);
        } catch (error) {
            toast.error(`Lỗi: ${error}`);
        }
    };

    const handleWarrantyModalOpen = (bookingId) => {
        if (!bookingId) {
            toast.error('Booking ID is required');
            return false;
        }
        setSelectedWarrantyBookingId(bookingId);
        setWarrantyReason('');
        setWarrantyReasonError(null);
        dispatch(resetWarrantyState());
    };

    const handleWarrantyModalClose = () => {
        setWarrantyReason('');
        setWarrantyReasonError(null);
        setSelectedWarrantyBookingId(null);
        dispatch(resetWarrantyState());

        const modalElement = document.getElementById(`warranty_modal_${selectedWarrantyBookingId}`);
        if (modalElement) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
            bootstrapModal.hide();
        }
    };

    const handleWarrantyReasonChange = (e) => {
        setWarrantyReason(e.target.value);
        setWarrantyReasonError(null);
    };

    const handleWarrantySubmit = async (e) => {
        e.preventDefault();
        if (!selectedWarrantyBookingId) {
            toast.error('Booking ID is required');
            return;
        }
        try {
            const formData = {
                bookingId: selectedWarrantyBookingId,
                reportedIssue: warrantyReason || undefined
            };
            const result = await dispatch(requestWarrantyThunk(formData)).unwrap();
            toast.success(
                `Yêu cầu bảo hành thành công, Vui lòng đợi trong vòng 24h để thợ phản hồi`
            );
            handleWarrantyModalClose();
            // navigate(`/warranty?bookingWarrantyId=${result._id}`);
            dispatch(resetWarrantyState());
        } catch (err) {
            setWarrantyReasonError(err || 'Đã xảy ra lỗi khi yêu cầu bảo hành');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0) {
            setPage(newPage);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'badge-light-warning';
            case 'CONFIRMED':
                return 'badge-light-info';
            case 'DONE':
                return 'badge-light-success';
            case 'CANCELED':
                return 'badge-light-danger';
            default:
                return 'badge-light-secondary';
        }
    };

    const isCustomer = user?.role?.name === 'CUSTOMER';
    const isTechnician = user?.role?.name === 'TECHNICIAN';

    return (
        <>
            <div className="content">
                <div className="container">
                    <div className="col-lg-12 d-flex">
                        <div className="card book-card flex-fill mb-0">
                            <div className="card-body">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col-md-5">
                                            <h4>
                                                Lịch sử đặt<span>{Array.isArray(bookings) ? bookings.length : 0}</span>
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive dashboard-table">
                                    <table className="table datatable">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Mã đơn hàng</th>
                                                <th>Dịch vụ</th>
                                                <th>{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}</th>
                                                <th>Ngày đặt</th>
                                                <th>Trạng thái</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {status === 'loading' ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center custom-loading-text">
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : error ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center text-danger">
                                                        {error}
                                                    </td>
                                                </tr>
                                            ) : !Array.isArray(bookings) || bookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        Không có đặt lịch nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                bookings.map((booking) => (
                                                    <tr key={booking._id}>
                                                        <td>{booking.bookingCode}</td>
                                                        <td>{booking.serviceId?.serviceName || 'N/A'}</td>
                                                        <td>
                                                            {isCustomer
                                                                ? booking.technicianId?.userId.fullName || 'N/A'
                                                                : booking.customerId?.fullName || 'N/A'}
                                                        </td>
                                                        <td>{formatDate(booking.schedule)}</td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
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
                                                                <div className="dropdown-menu dropdown-menu-end">
                                                                    <a
                                                                        className="dropdown-item custom-modal-link"
                                                                        href="javascript:void(0);"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target={`#view_booking_${booking._id}`}
                                                                    >
                                                                        <i className="feather-eye"></i> Chi tiết
                                                                    </a>
                                                                    {isCustomer && booking.status === 'DONE' && (
                                                                        <a
                                                                            href="javascript:void(0);"
                                                                            className="dropdown-item custom-modal-link"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target={`#warranty_modal_${booking._id}`}
                                                                            onClick={() => handleWarrantyModalOpen(booking._id)}
                                                                        >
                                                                            <i className="feather-help-circle"></i> Yêu cầu bảo hành
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isCustomer && ['PENDING', 'CONFIRMED'].includes(booking.status) && (
                                                                <button
                                                                    className="btn btn-sm btn-danger ms-2"
                                                                    onClick={() => {
                                                                        setSelectedBookingId(booking._id);
                                                                        setShowCancelModal(true);
                                                                    }}
                                                                >
                                                                    Hủy
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={styles.pagination}>
                                    <button
                                        style={{
                                            ...styles.paginationBtn,
                                            ...(page === 0 ? styles.disabledBtn : {}),
                                        }}
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                    >
                                        Trang Trước
                                    </button>
                                    <button
                                        style={{
                                            ...styles.paginationBtn,
                                            ...(bookings.length < limit ? styles.disabledBtn : {}),
                                        }}
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={bookings.length < limit}
                                    >
                                        Trang Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancel Booking Modal */}
                    <div
                        className="modal new-modal fade custom-custom-cancel-modal"
                        id="cancel_booking_modal"
                        data-bs-keyboard="false"
                        data-bs-backdrop="static"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-md">
                            <div className="modal-content custom-custom-modal-content">
                                <div className="modal-header custom-custom-modal-header">
                                    <h4 className="modal-title">Hủy đặt</h4>
                                    <button
                                        type="button"
                                        className="custom-custom-close-btn"
                                        data-bs-dismiss="modal"
                                        onClick={() => {
                                            setCancelReason('');
                                            setShowCancelModal(false);
                                            setSelectedBookingId(null);
                                        }}
                                    >
                                        <span>×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-custom-modal-body">
                                    <form onSubmit={handleCancelBooking}>
                                        <div className="custom-custom-modal-form-group">
                                            <label className="custom-form-label">
                                                Lý do hủy <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="custom-custom-textarea"
                                                placeholder="Nhập lý do hủy"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                rows="4"
                                            />
                                        </div>
                                        <div className="custom-custom-modal-btn-group">
                                            <button
                                                type="button"
                                                className="btn custom-custom-btn custom-custom-btn-secondary"
                                                data-bs-dismiss="modal"
                                                onClick={() => {
                                                    setCancelReason('');
                                                    setShowCancelModal(false);
                                                    setSelectedBookingId(null);
                                                }}
                                            >
                                                Thoát
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn custom-custom-btn custom-custom-btn-danger"
                                                disabled={status === 'loading'}
                                            >
                                                {status === 'loading' ? 'Xử lý...' : 'Xác nhận hủy'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warranty Request Modals */}
                    {Array.isArray(bookings) &&
                        bookings.map((booking) => (
                            <div
                                key={`warranty_${booking._id}`}
                                className="modal new-modal fade custom-custom-warranty-modal"
                                id={`warranty_modal_${booking._id}`}
                                data-bs-keyboard="false"
                                data-bs-backdrop="static"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-md">
                                    <div className="modal-content custom-custom-modal-content">
                                        <div className="modal-header custom-custom-modal-header">
                                            <h4 className="modal-title">Yêu cầu bảo hành</h4>
                                            <button
                                                type="button"
                                                className="custom-custom-close-btn"
                                                data-bs-dismiss="modal"
                                                onClick={handleWarrantyModalClose}
                                            >
                                                <span>×</span>
                                            </button>
                                        </div>
                                        <div className="modal-body custom-custom-modal-body">
                                            {warrantyError && <p className="custom-error-text">Lỗi: {warrantyError}</p>}
                                            <form onSubmit={handleWarrantySubmit}>
                                                <div className="custom-custom-modal-form-group">
                                                    <label className="custom-form-label">
                                                        Lý do bảo hành <span className="text-danger">*</span>
                                                    </label>
                                                    <textarea
                                                        className="custom-custom-textarea"
                                                        placeholder="Nhập lý do bảo hành"
                                                        value={warrantyReason}
                                                        onChange={handleWarrantyReasonChange}
                                                        rows="4"
                                                    />
                                                    {warrantyReasonError && (
                                                        <small className="custom-error-text">{warrantyReasonError}</small>
                                                    )}
                                                </div>
                                                <div className="custom-custom-modal-btn-group">
                                                    <button
                                                        type="button"
                                                        className="btn custom-custom-btn custom-custom-btn-secondary"
                                                        data-bs-dismiss="modal"
                                                        onClick={handleWarrantyModalClose}
                                                    >
                                                        Thoát
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn custom-custom-btn custom-custom-btn-primary"
                                                        disabled={warrantyLoading}
                                                    >
                                                        {warrantyLoading ? 'Xử lý...' : 'Gửi yêu cầu'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {/* View Booking Modals */}
                    {Array.isArray(bookings) &&
                        bookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="modal new-modal fade custom-custom-view-modal"
                                id={`view_booking_${booking._id}`}
                                data-bs-keyboard="false"
                                data-bs-backdrop="static"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-md">
                                    <div className="modal-content custom-custom-modal-content">
                                        <div className="modal-header custom-custom-modal-header">
                                            <h4 className="modal-title" >Chi tiết đặt</h4>
                                            <button
                                                type="button"
                                                className="custom-custom-close-btn"
                                                data-bs-dismiss="modal"
                                            >
                                                <span>×</span>
                                            </button>
                                        </div>
                                        <div className="modal-body custom-custom-modal-body">
                                            <div className="custom-details-list">
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">Mã đơn hàng:</span>
                                                    <span className="custom-detail-value">{booking.bookingCode || 'N/A'}</span>
                                                </div>
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">Dịch vụ:</span>
                                                    <span className="custom-detail-value">{booking.serviceId?.serviceName || 'N/A'}</span>
                                                </div>
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}:</span>
                                                    <span className="custom-detail-value">
                                                        {isCustomer
                                                            ? booking.technicianId?.userId.fullName || 'N/A'
                                                            : booking.customerId?.fullName || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">Lịch đặt:</span>
                                                    <span className="custom-detail-value">{formatDate(booking.schedule) || 'N/A'}</span>
                                                </div>
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">Ngày tạo:</span>
                                                    <span className="custom-detail-value">{formatDate(booking.createdAt) || 'N/A'}</span>
                                                </div>
                                                <div className="custom-details-item">
                                                    <span className="custom-detail-label">Trạng thái:</span>
                                                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                {booking.status === 'CANCELED' && booking.cancelReason && (
                                                    <div className="custom-details-item">
                                                        <span className="custom-detail-label">Lý do hủy:</span>
                                                        <span className="custom-detail-value">{booking.cancelReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="custom-custom-modal-btn-group">
                                                <button
                                                    type="button"
                                                    className="btn custom-custom-btn custom-custom-btn-secondary"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Tắt
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Custom CSS for Modals */}
            <style jsx>{`
                .custom-custom-cancel-modal .modal-dialog,
                .custom-custom-warranty-modal .modal-dialog,
                .custom-custom-view-modal .modal-dialog {
                    max-width: 500px;
                }

                .custom-custom-modal-content {
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border: none;
                    background: #fff;
                }

                .custom-custom-modal-header {
                    background: rgb(0, 0, 0);
        
                    padding: 16px 24px;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .custom-custom-modal-header .modal-title h4 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color:#f8f9fa;
                }

                .custom-custom-close-btn {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .custom-custom-close-btn:hover {
                    color: #f8f9fa;
                }

                .custom-custom-modal-body {
                    padding: 24px;
                    background: #f8f9fa;
                }

                .custom-custom-modal-form-group {
                    margin-bottom: 20px;
                }

                .custom-form-label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #343a40;
                    margin-bottom: 8px;
                    display: block;
                }

                .custom-custom-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 1rem;
                    resize: vertical;
                    transition: border-color 0.2s ease;
                }

                .custom-custom-textarea:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
                }

                .custom-error-text {
                    color: #dc3545;
                    font-size: 0.875rem;
                    margin-top: 8px;
                    display: block;
                }

                .custom-details-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .custom-details-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #e9ecef;
                    font-size: 1rem;
                }

                .custom-details-item:last-child {
                    border-bottom: none;
                }

                .custom-detail-label {
                    font-weight: 600;
                    color: #343a40;
                    flex: 0 0 40%;
                }

                .custom-detail-value {
                    color: #495057;
                    flex: 0 0 60%;
                    word-break: break-word;
                }

                .custom-custom-modal-btn-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }

                .custom-custom-btn {
                    padding: 10px 20px;
                    font-size: 1rem;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                }

                .custom-custom-btn-primary {
                    background-color: #007bff;
                    border: none;
                    color: #fff;
                }

                .custom-custom-btn-primary:hover {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                }

                .custom-custom-btn-primary:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .custom-custom-btn-danger {
                    background-color: #dc3545;
                    border: none;
                    color: #fff;
                }

                .custom-custom-btn-danger:hover {
                    background-color: #b02a37;
                    transform: translateY(-1px);
                }

                .custom-custom-btn-danger:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .custom-custom-btn-secondary {
                    background-color: #6c757d;
                    border: none;
                    color: #fff;
                }

                .custom-custom-btn-secondary:hover {
                    background-color: #5a6268;
                    transform: translateY(-1px);
                }

                .custom-modal-link {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: 500;
                }

                .custom-modal-link:hover {
                    text-decoration: underline;
                }

                .custom-loading-text {
                    color: #007bff;
                    font-style: italic;
                }
            `}</style>
        </>
    );
};

export default BookingHistory;