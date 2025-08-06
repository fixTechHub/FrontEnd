import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Dropdown, Table, Pagination, Card } from 'react-bootstrap';
import { fetchUserBookingHistory, cancelBooking } from '../../../features/bookings/bookingSlice';
import { requestWarrantyThunk, resetWarrantyState } from '../../../features/booking-warranty/warrantySlice';
import { formatBookingDate, formatDateOnly, formatTimeOnly } from '../../../utils/formatDate';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import { FaFileAlt, FaUser, FaClock, FaCalendar, FaTag, FaBan, FaMapMarkerAlt, FaDollarSign, FaExclamationCircle, FaCreditCard } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatDuration';

// Status color mapping function from CheckoutPage
const getStatusColor = (status) => {
    const statusColors = {
        'PENDING': '#ffc107',
        'CONFIRMED': '#17a2b8',
        'IN_PROGRESS': '#fd7e14',
        'CONFIRM_ADDITIONAL': '#28a745',
        'CANCELLED': '#dc3545',
        'ACCEPTED': '#20c997',
        'REJECTED': '#FF0000',
         'WAITING_CUSTOMER_CONFIRM_ADDITIONAL': '#fd7e14',

        'AWAITING_CONFIRM': '#0d6efd',
        'AWAITING_DONE': '#e83e8c',
        'DONE': '#198754'
    };
    return statusColors[status] || '#6c757d';
};

// Status label translation function
const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING': return 'Đang chờ';
        case 'CONFIRMED': return 'Xác nhận';
        case 'IN_PROGRESS': return 'Đang thực hiện';
        case 'CONFIRM_ADDITIONAL': return 'Chấp nhận thêm chi phí';
        case 'CANCELLED': return 'Hủy';
        case 'ACCEPTED': return 'Đồng ý';
        case 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL': return 'Chờ chấp nhận chi phí thêm';
        case 'AWAITING_CONFIRM': return 'Chờ chấp nhận';
        case 'AWAITING_DONE': return 'Chờ thanh toán';
        case 'DONE': return 'Đã thanh toán';
        default: return status;
    }
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
    const [warrantyReason, setWarrantyReason] = useState('');
    const [warrantyReasonError, setWarrantyReasonError] = useState(null);
    const [selectedWarrantyBookingId, setSelectedWarrantyBookingId] = useState(null);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(null);

    const limit = 5;

    const handleFilesSelect = (files) => {
        setWarrantyImages(files);
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
            return;
        }
        setSelectedWarrantyBookingId(bookingId);
        setWarrantyReason('');
        setWarrantyReasonError(null);
        setWarrantyImages([]);
        dispatch(resetWarrantyState());
        setShowWarrantyModal(true);
    };

    const handleWarrantyModalClose = () => {
        setWarrantyReason('');
        setWarrantyReasonError(null);
        setSelectedWarrantyBookingId(null);
        setWarrantyImages([]);
        dispatch(resetWarrantyState());
        setShowWarrantyModal(false);
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
            const formData = new FormData();
            formData.append('bookingId', selectedWarrantyBookingId);
            formData.append('reportedIssue', warrantyReason);
            for (const file of warrantyImages) {
                formData.append('images', file);
            }

            await dispatch(requestWarrantyThunk(formData)).unwrap();
            toast.success('Yêu cầu bảo hành thành công, Vui lòng đợi trong vòng 24h để thợ phản hồi');
            handleWarrantyModalClose();
        } catch (err) {
            const errorMessage = err?.error || 'Đã xảy ra lỗi khi yêu cầu bảo hành';
            toast.error(errorMessage);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0) {
            setPage(newPage);
        }
    };

    const isCustomer = user?.role?.name === 'CUSTOMER';
    const isTechnician = user?.role?.name === 'TECHNICIAN';

    return (
        <div className="content py-4">
            <div className="container">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        <h4 className="card-title mb-4">Lịch sử đặt dịch vụ</h4>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Dịch vụ</th>
                                    <th>{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}</th>
                                    <th>Ngày đặt</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {status === 'loading' ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">Đang tải...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-danger">{error}</td>
                                    </tr>
                                ) : !Array.isArray(bookingHistories) || bookingHistories.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">Không có đặt lịch nào</td>
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
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: getStatusColor(booking.status),
                                                        color: 'white',
                                                        fontSize: '11px',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {getStatusLabel(booking.status)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="link" className="p-0">
                                                        <i className="fas fa-ellipsis-vertical"></i>
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu align="end">
                                                        <Dropdown.Item
                                                            onClick={() => setShowDetailsModal(booking._id)}
                                                        >
                                                            <FaFileAlt className="me-2" /> Chi tiết
                                                        </Dropdown.Item>
                                                        {isCustomer && booking.status === 'DONE' && (
                                                            <Dropdown.Item
                                                                onClick={() => handleWarrantyModalOpen(booking._id)}
                                                            >
                                                                <FaTag className="me-2" /> Yêu cầu bảo hành
                                                            </Dropdown.Item>
                                                        )}
                                                        {isCustomer && ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_DONE'].includes(booking.status) && (
                                                            <Dropdown.Item
                                                                onClick={() => {
                                                                    setSelectedBookingId(booking._id);
                                                                    setShowCancelModal(true);
                                                                }}
                                                                className="text-danger"
                                                            >
                                                                <FaBan className="me-2" /> Hủy
                                                            </Dropdown.Item>
                                                        )}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                        <Pagination className="justify-content-center mt-4">
                            <Pagination.Prev
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                            >    Trang Trước </Pagination.Prev>
                            <Pagination.Next
                                onClick={() => handlePageChange(page + 1)}
                                disabled={bookingHistories.length < limit}
                            >    Trang Sau </Pagination.Next>
                        </Pagination>
                    </div>
                </div>

                {/* Cancel Booking Modal */}
                <Modal
                    show={showCancelModal}
                    onHide={() => {
                        setCancelReason('');
                        setShowCancelModal(false);
                        setSelectedBookingId(null);
                    }}
                    centered
                >
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>Hủy đặt dịch vụ</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleCancelBooking}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Lý do hủy <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đặt lịch này"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="border rounded"
                                    isInvalid={!!cancelReason && !cancelReason.trim()}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng nhập lý do hủy
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setCancelReason('');
                                        setShowCancelModal(false);
                                        setSelectedBookingId(null);
                                    }}
                                >
                                    Thoát
                                </Button>
                                <Button
                                    variant="danger"
                                    type="submit"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Xử lý...
                                        </span>
                                    ) : (
                                        'Xác nhận hủy'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Warranty Modal */}
                <Modal
                    show={showWarrantyModal}
                    onHide={handleWarrantyModalClose}
                    centered
                >
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>Yêu cầu bảo hành</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3 text">
                            Vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải. Chúng tôi sẽ xử lý yêu cầu trong vòng 24 giờ.
                        </div>
                        <Form onSubmit={handleWarrantySubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Lý do bảo hành <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải (ví dụ: thiết bị không hoạt động, lỗi kỹ thuật, ...)"
                                    value={warrantyReason}
                                    onChange={handleWarrantyReasonChange}
                                    className="border rounded"
                                    isInvalid={!!warrantyReasonError}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {warrantyReasonError || 'Vui lòng nhập lý do bảo hành'}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <ImageUploader onFilesSelect={handleFilesSelect} />
                                {warrantyImages.length > 0 && (
                                    <div className="mt-2 text-muted">
                                        {warrantyImages.length} ảnh đã được chọn
                                    </div>
                                )}
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleWarrantyModalClose}
                                >
                                    Thoát
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={warrantyLoading}
                                >
                                    {warrantyLoading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Gửi yêu cầu...
                                        </span>
                                    ) : (
                                        'Gửi yêu cầu'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Details Modal */}
                {Array.isArray(bookingHistories) &&
                    bookingHistories.map((booking) => (
                        <Modal
                            key={booking._id}
                            show={showDetailsModal === booking._id}
                            onHide={() => setShowDetailsModal(null)}
                            centered
                            size="lg"
                            className="booking-details-modal"
                        >
                            <style jsx>{`
                                .booking-details-modal .modal-content {
                                    border: none;
                                    border-radius: 20px;
                                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                                    overflow: hidden;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                }

                                .modal-header-custom {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    border: none;
                                    padding: 25px 30px;
                                    position: relative;
                                }

                                .modal-header-custom::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                                    pointer-events: none;
                                }

                                .modal-header-custom h5 {
                                    color: white;
                                    font-weight: 600;
                                    font-size: 1.4rem;
                                    margin: 0;
                                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                }

                                .modal-header-custom .btn-close {
                                    background: rgba(255, 255, 255, 0.2);
                                    border-radius: 50%;
                                    padding: 10px;
                                    opacity: 1;
                                    transition: all 0.3s ease;
                                }

                                .modal-header-custom .btn-close:hover {
                                    background: rgba(255, 255, 255, 0.3);
                                    transform: scale(1.1);
                                }

                                .modal-body-custom {
                                    background: #f8fafc;
                                    padding: 0;
                                }

                                .custom-nav-tabs {
                                    background: white;
                                    border: none;
                                    margin: 0;
                                    padding: 0 30px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                                }

                                .custom-nav-tabs .nav-link {
                                    border: none;
                                    padding: 20px 25px;
                                    font-weight: 500;
                                    color: #64748b;
                                    background: transparent;
                                    border-bottom: 3px solid transparent;
                                    transition: all 0.3s ease;
                                    position: relative;
                                }

                                .custom-nav-tabs .nav-link:hover {
                                    color: #667eea;
                                    background: #f1f5f9;
                                }

                                .custom-nav-tabs .nav-link.active {
                                    color: #667eea;
                                    background: white;
                                    border-bottom-color: #667eea;
                                }

                                .tab-content-custom {
                                    padding: 30px;
                                }

                                .service-card {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    border: none;
                                    border-radius: 15px;
                                    padding: 25px;
                                    color: white;
                                    margin-bottom: 25px;
                                    position: relative;
                                    overflow: hidden;
                                }

                                .service-card::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    right: 0;
                                    width: 100px;
                                    height: 100px;
                                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                                    transform: translate(30px, -30px);
                                }

                                .service-card .avatar {
                                    width: 60px;
                                    height: 60px;
                                    border-radius: 15px;
                                    background: rgba(255, 255, 255, 0.2);
                                    padding: 10px;
                                    backdrop-filter: blur(10px);
                                }

                                .service-card .avatar img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: contain;
                                }

                                .service-card h6 {
                                    font-weight: 600;
                                    margin-bottom: 5px;
                                }

                                .service-card p {
                                    opacity: 0.9;
                                    margin-bottom: 0;
                                    font-size: 0.9rem;
                                }

                                .price-tag {
                                    font-size: 1.2rem;
                                    font-weight: 700;
                                }

                                .info-section {
                                    background: white;
                                    border-radius: 15px;
                                    padding: 25px;
                                    margin-bottom: 20px;
                                    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
                                    border: 1px solid #e2e8f0;
                                }

                                .section-title {
                                    color: #1e293b;
                                    font-weight: 600;
                                    font-size: 1.1rem;
                                    margin-bottom: 20px;
                                    padding-bottom: 10px;
                                    border-bottom: 2px solid #f1f5f9;
                                }

                                .user-info {
                                    display: flex;
                                    align-items: center;
                                    padding: 15px;
                                    background: #f8fafc;
                                    border-radius: 12px;
                                    margin-bottom: 15px;
                                    transition: all 0.3s ease;
                                }

                                .user-info:hover {
                                    background: #f1f5f9;
                                    transform: translateY(-2px);
                                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                                }

                                .user-avatar {
                                    width: 50px;
                                    height: 50px;
                                    border-radius: 12px;
                                    overflow: hidden;
                                    margin-right: 15px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: 600;
                                }

                                .user-avatar img {
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }

                                .user-details h6 {
                                    margin-bottom: 5px;
                                    color: #1e293b;
                                    font-weight: 600;
                                }

                                .user-details p {
                                    margin: 0;
                                    color: #64748b;
                                    font-size: 0.9rem;
                                }

                                .detail-row {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #f1f5f9;
                                }

                                .detail-row:last-child {
                                    border-bottom: none;
                                }

                                .detail-label {
                                    font-weight: 500;
                                    color: #475569;
                                }

                                .detail-value {
                                    color: #1e293b;
                                    font-weight: 500;
                                }

                                .location-card {
                                    background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
                                    border: none;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-top: 15px;
                                }

                                .location-card h6 {
                                    color: #92400e;
                                    font-weight: 600;
                                    margin-bottom: 8px;
                                }

                                .location-card p {
                                    color: #b45309;
                                    margin: 0;
                                }

                                .history-item {
                                    display: flex;
                                    align-items: center;
                                    padding: 20px;
                                    background: white;
                                    border-radius: 12px;
                                    margin-bottom: 15px;
                                    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
                                    border-left: 4px solid #667eea;
                                    transition: all 0.3s ease;
                                }

                                .history-item:hover {
                                    transform: translateX(5px);
                                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                                }

                                .date-badge {
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    border-radius: 12px;
                                    padding: 15px;
                                    text-align: center;
                                    margin-right: 20px;
                                    min-width: 80px;
                                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                                }

                                .date-badge h5 {
                                    margin: 0;
                                    font-size: 1.5rem;
                                    font-weight: 700;
                                }

                                .date-badge .month-year {
                                    font-size: 0.8rem;
                                    opacity: 0.9;
                                    margin-top: 5px;
                                    display: block;
                                }

                                .history-content h6 {
                                    color: #1e293b;
                                    font-weight: 600;
                                    margin-bottom: 5px;
                                }

                                .history-content span {
                                    color: #64748b;
                                }

                                .urgent-badge {
                                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                                    color: white;
                                    padding: 5px 12px;
                                    border-radius: 20px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                    box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3);
                                }

                                .status-badge {
                                    padding: 8px 16px;
                                    border-radius: 20px;
                                    font-size: 0.85rem;
                                    font-weight: 500;
                                    display: inline-block;
                                }

                                .status-completed {
                                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                    color: white;
                                    box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
                                }

                                .status-cancelled {
                                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                                    color: white;
                                    box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3);
                                }

                                @keyframes fadeInUp {
                                    from {
                                        opacity: 0;
                                        transform: translateY(30px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }

                                .modal-content {
                                    animation: fadeInUp 0.4s ease-out;
                                }

                                .tab-pane {
                                    animation: fadeInUp 0.3s ease-out;
                                }
                            `}</style>

                            <Modal.Header closeButton className="modal-header-custom">
                                <h5>Chi tiết đặt dịch vụ</h5>
                            </Modal.Header>

                            <Modal.Body className="modal-body-custom">
                                <ul className="nav nav-tabs custom-nav-tabs" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a 
                                            className="nav-link active" 
                                            href="#solid-tab1" 
                                            data-bs-toggle="tab" 
                                            aria-selected="true" 
                                            role="tab"
                                        >
                                            Thông tin đặt dịch vụ
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a 
                                            className="nav-link" 
                                            href="#solid-tab2" 
                                            data-bs-toggle="tab" 
                                            aria-selected="false" 
                                            role="tab"
                                        >
                                            Lịch sử
                                        </a>
                                    </li>
                                </ul>

                                <div className="tab-content tab-content-custom">
                                    <div className="tab-pane active show" id="solid-tab1" role="tabpanel">
                                        {/* Service Card */}
                                        <div className="service-card">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div className="d-flex align-items-center">
                                                        <span className="avatar flex-shrink-0 me-3">
                                                            <img src={booking.serviceId?.icon} alt="Service" />
                                                        </span>
                                                        <div>
                                                            <p className="mb-1 opacity-75">Dịch vụ</p>
                                                            <h6 className="mb-0">{booking.serviceId?.serviceName || 'N/A'}</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-end">
                                                    <p className="mb-1 opacity-75">Giá</p>
                                                    <h6 className="price-tag mb-0">
                                                        {formatCurrency(booking.finalPrice)}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer and Technician Info */}
                                        <div className="info-section">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h6 className="section-title">Khách hàng</h6>
                                                    <div className="user-info">
                                                        <div className="user-avatar">
                                                            {booking?.customerId?.avatar ? (
                                                                <img
                                                                    src={booking.customerId.avatar}
                                                                    alt="Customer Avatar"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentNode.innerHTML = booking?.customerId?.fullName?.charAt(0) || 'N';
                                                                    }}
                                                                />
                                                            ) : (
                                                                booking?.customerId?.fullName?.charAt(0) || 'N'
                                                            )}
                                                        </div>
                                                        <div className="user-details">
                                                            <h6>{booking.customerId?.fullName || 'N/A'}</h6>
                                                            <p>{booking.customerId?.phoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <h6 className="section-title">Kỹ thuật viên</h6>
                                                    <div className="user-info">
                                                        <div className="user-avatar">
                                                            {booking?.technicianId?.userId?.avatar ? (
                                                                <img
                                                                    src={booking.technicianId.userId.avatar}
                                                                    alt="Technician Avatar"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentNode.innerHTML = booking?.technicianId?.userId?.fullName?.charAt(0) || 'T';
                                                                    }}
                                                                />
                                                            ) : (
                                                                booking?.technicianId?.userId?.fullName?.charAt(0) || 'T'
                                                            )}
                                                        </div>
                                                        <div className="user-details">
                                                            <h6>{booking.technicianId?.userId?.fullName || 'Chưa phân công'}</h6>
                                                            <p>{booking.technicianId?.userId?.phoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Schedule Details */}
                                        <div className="info-section">
                                            <h6 className="section-title">Thông tin lịch hẹn</h6>
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày bắt đầu </span>
                                                <span className="detail-value">
                                                    {formatDateOnly(booking.schedule?.startTime) || 'N/A'}, {formatTimeOnly(booking.schedule?.startTime) || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày kết thúc dự kiến </span>
                                                <span className="detail-value">
                                                    {formatDateOnly(booking.schedule?.expectedEndTime) || 'N/A'}, {formatTimeOnly(booking.schedule?.expectedEndTime) || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Khẩn cấp</span>
                                                <span className="detail-value">
                                                    {booking.isUrgent ? (
                                                        <span className="urgent-badge">Có</span>
                                                    ) : (
                                                        'Không'
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="location-card">
                                            <h6>📍 Địa điểm</h6>
                                            <p>{booking.location?.address || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="tab-pane" id="solid-tab2" role="tabpanel">
                                        {/* Service Card - History Tab */}
                                        <div className="service-card">
                                            <div className="row align-items-center">
                                                <div className="col-8">
                                                    <div className="d-flex align-items-center">
                                                        <span className="avatar flex-shrink-0 me-3">
                                                            <img src={booking.serviceId?.icon} alt="Service" />
                                                        </span>
                                                        <div>
                                                            <p className="mb-1 opacity-75">Dịch vụ</p>
                                                            <h6 className="mb-0">{booking.serviceId?.serviceName || 'N/A'}</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-end">
                                                    <p className="mb-1 opacity-75">Giá</p>
                                                    <h6 className="price-tag mb-0">
                                                        {formatCurrency(booking.finalPrice)}
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>

                                        {/* History Timeline */}
                                        <div className="info-section">
                                            <h6 className="section-title">📅 Lịch sử</h6>
                                            
                                            {/* Service Created */}
                                            <div className="history-item">
                                                <div className="date-badge">
                                                    <h5>{formatBookingDate(booking.createdAt).day}</h5>
                                                    <span className="month-year">{formatBookingDate(booking.createdAt).monthYear}</span>
                                                </div>
                                                <div className="history-content">
                                                    <h6>Dịch vụ được tạo</h6>
                                                    <span>{formatTimeOnly(booking.createdAt) || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Service Completed */}
                                            {booking.completedAt && (
                                                <div className="history-item">
                                                    <div className="date-badge">
                                                        <h5>{formatBookingDate(booking.completedAt).day}</h5>
                                                        <span className="month-year">{formatBookingDate(booking.completedAt).monthYear}</span>
                                                    </div>
                                                    <div className="history-content">
                                                        <h6>
                                                            Hoàn thành dịch vụ 
                                                            <span className="status-badge status-completed ms-2">✓ Hoàn thành</span>
                                                        </h6>
                                                        <span>{formatTimeOnly(booking.completedAt) || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Service Cancelled */}
                                            {booking.status === 'CANCELLED' && booking.cancellationReason && (
                                                <div className="history-item">
                                                    <div className="date-badge">
                                                        <h5>{formatBookingDate(booking.completedAt).day}</h5>
                                                        <span className="month-year">{formatBookingDate(booking.completedAt).monthYear}</span>
                                                    </div>
                                                    <div className="history-content">
                                                        <h6>
                                                            Đã hủy 
                                                            <span className="status-badge status-cancelled ms-2">✗ Đã hủy</span>
                                                        </h6>
                                                        <span>{formatTimeOnly(booking.completedAt) || 'N/A'}</span>
                                                        <p className="mt-2 text-muted small">
                                                            Lý do: {booking.cancellationReason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>
                    ))}
            </div>
        </div>
    );
};

export default BookingHistory;