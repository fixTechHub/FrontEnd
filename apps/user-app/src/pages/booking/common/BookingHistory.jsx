import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserBookingHistory, cancelBooking } from '../../../features/bookings/bookingSlice';
import { requestWarrantyThunk, resetWarrantyState } from '../../../features/booking-warranty/warrantySlice';
import { formatDateOnly, formatDate, formatTimeOnly } from '../../../utils/formatDate';
import { toast } from 'react-toastify';
import ImageUploader from "./ImageUploader";
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
        padding: '20px 25px',
        margin: '0 5px',
        cursor: 'pointer',
        transition: 'all 0.2s',

    },
    disabledBtn: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};
const modalStyles = {
    modalDialog: {
        maxWidth: '500px',
    },
    modalContent: {
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: 'none',
        background: '#fff',
    },
    modalHeader: {
        background: 'rgb(0, 0, 0)',
        padding: '16px 24px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitleH4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: '#f8f9fa',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
    },
    modalBody: {
        padding: '24px',
        background: '#f8f9fa',
    },
    modalFormGroup: {
        marginBottom: '20px',
    },
    formLabel: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#343a40',
        marginBottom: '8px',
        display: 'block',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        fontSize: '1rem',
        resize: 'vertical',
        transition: 'border-color 0.2s ease',
    },
    textareaFocus: {
        outline: 'none',
        borderColor: '#007bff',
        boxShadow: '0 0 5px rgba(0, 123, 255, 0.3)',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '8px',
        display: 'block',
    },
    detailsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    detailsItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #e9ecef',
        fontSize: '1rem',
    },
    detailLabel: {
        fontWeight: 600,
        color: '#343a40',
        flex: '0 0 40%',
    },
    detailValue: {
        color: '#495057',
        flex: '0 0 60%',
        wordBreak: 'break-word',
    },
    modalBtnGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
    },
    btn: {
        padding: '10px 20px',
        fontSize: '1rem',
        fontWeight: 500,
        borderRadius: '8px',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
    },
    btnPrimary: {
        backgroundColor: '#007bff',
        border: 'none',
        color: '#fff',
    },
    btnDanger: {
        backgroundColor: '#dc3545',
        border: 'none',
        color: '#fff',
    },
    btnSecondary: {
        backgroundColor: '#6c757d',
        border: 'none',
        color: '#fff',
    },
    modalLink: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 500,
    },
    loadingText: {
        color: '#007bff',
        fontStyle: 'italic',
    },
};
const BookingHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { bookingHistories, status, error } = useSelector((state) => state.booking);
    const { loading: warrantyLoading, error: warrantyError } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);

    const [page, setPage] = useState(0);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [warrantyImages, setWarrantyImages] = useState([]);
    // Warranty states
    const [warrantyReason, setWarrantyReason] = useState('');
    const [warrantyReasonError, setWarrantyReasonError] = useState(null);
    const [selectedWarrantyBookingId, setSelectedWarrantyBookingId] = useState(null);

    const limit = 5;
    const handleFilesSelect = (files) => {
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setWarrantyImages(imageUrls);
    };
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
                reportedIssue: warrantyReason || undefined,
                images: warrantyImages
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
                                                Lịch sử đặt
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
                                            ) : !Array.isArray(bookingHistories) || bookingHistories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        Không có đặt lịch nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                bookingHistories.map((booking) => (
                                                    <tr key={booking._id}>
                                                        <td>{booking.bookingCode}</td>
                                                        <td>{booking.serviceId?.serviceName || 'N/A'}</td>
                                                        <td>
                                                            {isCustomer
                                                                ? booking.technicianId?.userId.fullName || 'N/A'
                                                                : booking.customerId?.fullName || 'N/A'}
                                                        </td>
                                                        <td>{formatDateOnly(booking.schedule?.startTime) || 'N/A'}</td>
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
                                            ...(bookingHistories.length < limit ? styles.disabledBtn : {}),
                                        }}
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={bookingHistories.length < limit}
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


                    {Array.isArray(bookingHistories) &&
                        bookingHistories.map((booking) => (
                            <div
                                key={`warranty_${booking._id}`}
                                className="modal new-modal fade"
                                id={`warranty_modal_${booking._id}`}
                                data-bs-keyboard="false"
                                data-bs-backdrop="static"
                            >
                                <div style={modalStyles.modalDialog} className="modal-dialog modal-dialog-centered modal-md">
                                    <div style={modalStyles.modalContent} className="modal-content">
                                        <div style={modalStyles.modalHeader} className="modal-header">
                                            <h4 style={modalStyles.modalTitleH4} className="modal-title">Yêu cầu bảo hành</h4>
                                            <button
                                                type="button"
                                                style={modalStyles.closeBtn}
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                onClick={handleWarrantyModalClose}
                                            >
                                                <span>×</span>
                                            </button>
                                        </div>
                                        <div style={modalStyles.modalBody} className="modal-body">
                                            {warrantyError && <p style={modalStyles.errorText}>Lỗi: {warrantyError}</p>}
                                            <form onSubmit={handleWarrantySubmit}>
                                                <div style={modalStyles.modalFormGroup}>
                                                    <ImageUploader onFilesSelect={handleFilesSelect} />
                                                    <label style={modalStyles.formLabel}>
                                                        Lý do bảo hành <span className="text-danger">*</span>
                                                    </label>
                                                    <textarea
                                                        style={modalStyles.textarea}
                                                        placeholder="Nhập lý do bảo hành"
                                                        value={warrantyReason}
                                                        onChange={handleWarrantyReasonChange}
                                                        rows="4"
                                                    />
                                                    {warrantyReasonError && (
                                                        <small style={modalStyles.errorText}>{warrantyReasonError}</small>
                                                    )}
                                                </div>
                                                <div style={modalStyles.modalBtnGroup}>
                                                    <button
                                                        type="button"
                                                        style={{ ...modalStyles.btn, ...modalStyles.btnSecondary }}
                                                        className="btn"
                                                        data-bs-dismiss="modal"
                                                        onClick={handleWarrantyModalClose}
                                                    >
                                                        Thoát
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        style={{ ...modalStyles.btn, ...modalStyles.btnPrimary }}
                                                        className="btn"
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


                    {Array.isArray(bookingHistories) &&
                        bookingHistories.map((booking) => (
                            <div
                                key={booking._id}
                                className="modal new-modal fade"
                                id={`view_booking_${booking._id}`}
                                data-bs-keyboard="false"
                                data-bs-backdrop="static"
                            >
                                <div style={modalStyles.modalDialog} className="modal-dialog modal-dialog-centered modal-md">
                                    <div style={modalStyles.modalContent} className="modal-content">
                                        <div style={modalStyles.modalHeader} className="modal-header">
                                            <h4 style={modalStyles.modalTitleH4} className="modal-title">Chi tiết đặt</h4>
                                            <button
                                                type="button"
                                                style={modalStyles.closeBtn}
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                            >
                                                <span>×</span>
                                            </button>
                                        </div>
                                        <div style={modalStyles.modalBody} className="modal-body">
                                            <div style={modalStyles.detailsList}>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>Mã đơn hàng:</span>
                                                    <span style={modalStyles.detailValue}>{booking.bookingCode || 'N/A'}</span>
                                                </div>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>Dịch vụ:</span>
                                                    <span style={modalStyles.detailValue}>{booking.serviceId?.serviceName || 'N/A'}</span>
                                                </div>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}:</span>
                                                    <span style={modalStyles.detailValue}>
                                                        {isCustomer
                                                            ? booking.technicianId?.userId.fullName || 'N/A'
                                                            : booking.customerId?.fullName || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>Thời gian dự kiến:</span>
                                                    <span style={modalStyles.detailValue}>
                                                        {formatTimeOnly(booking.schedule?.startTime)} - {formatTimeOnly(booking.schedule?.expectedEndTime) || 'N/A'}
                                                    </span>
                                                </div>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>Ngày tạo:</span>
                                                    <span style={modalStyles.detailValue}>{formatDateOnly(booking.createdAt) || 'N/A'}</span>
                                                </div>
                                                <div style={modalStyles.detailsItem}>
                                                    <span style={modalStyles.detailLabel}>Trạng thái:</span>
                                                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                {booking.status === 'CANCELED' && booking.cancelReason && (
                                                    <div style={modalStyles.detailsItem}>
                                                        <span style={modalStyles.detailLabel}>Lý do hủy:</span>
                                                        <span style={modalStyles.detailValue}>{booking.cancelReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={modalStyles.modalBtnGroup}>
                                                <button
                                                    type="button"
                                                    style={{ ...modalStyles.btn, ...modalStyles.btnSecondary }}
                                                    className="btn"
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


        </>
    );
};

export default BookingHistory;