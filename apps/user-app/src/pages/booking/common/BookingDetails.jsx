import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelBooking, fetchBookingById, setLastCancelBy, technicianAcceptBookingThunk, technicianRejectBookingThunk } from "../../../features/bookings/bookingSlice";
import { formatDateOnly, formatTimeOnly } from "../../../utils/formatDate";
import { BOOKING_STATUS_CONFIG } from "../../../constants/bookingConstants";
import { useNavigate } from "react-router-dom";
import { Image, Card, Badge, Button, Row, Col, Alert, Spinner, Modal, Form, Tab, Tabs } from "react-bootstrap";
import { toast } from 'react-toastify';
import { onAdditionalItemsAdded, onAdditionalItemsStatusUpdate, onAdditionalItemsAccepted, onAdditionalItemsRejected } from "../../../services/socket";

// Icons
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaTools,
    FaShieldAlt,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimes,
    FaExclamationTriangle,
    FaEdit,
    FaTrash,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaImage,
    FaInfoCircle,
    FaEye,
    FaTag,
    FaFileAlt,
    FaWrench,
    FaReceipt,
    FaCircle,
    FaUserTie,
    FaHome,
    FaCalendarCheck
} from 'react-icons/fa';

function BookingDetails({ bookingId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = useState(null);
    const { booking, status: bookingStatusState } = useSelector((state) => state.booking);
    const [confirming, setConfirming] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    // Socket listeners cho thiết bị phát sinh
    useEffect(() => {
        if (!bookingId) return;

        const unsubscribeAdded = onAdditionalItemsAdded((data) => {
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        const unsubscribeStatusUpdate = onAdditionalItemsStatusUpdate((data) => {
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        const unsubscribeAccepted = onAdditionalItemsAccepted((data) => {
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        const unsubscribeRejected = onAdditionalItemsRejected((data) => {
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        return () => {
            unsubscribeAdded();
            unsubscribeStatusUpdate();
            unsubscribeAccepted();
            unsubscribeRejected();
        };
    }, [bookingId, dispatch]);

    const statusConfig = BOOKING_STATUS_CONFIG[booking?.status] || BOOKING_STATUS_CONFIG.default;

    const canTechnicianCancel = () => {
        if (user?.role?.name !== 'TECHNICIAN') return false;
        const statusesAfterAcceptance = ['IN_PROGRESS', 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL', 'CONFIRM_ADDITIONAL', 'AWAITING_DONE', 'DONE'];
        return statusesAfterAcceptance.includes(booking?.status);
    };

    const handleCancel = async () => {
        if (!bookingId || !cancelReason.trim()) {
            setCancelError("Vui lòng nhập lý do hủy đơn!");
            return;
        }

        try {
            setCancelError('');
            dispatch(setLastCancelBy(user._id));
            
            const resultAction = await dispatch(cancelBooking({ bookingId, reason: cancelReason }));
            
            if (cancelBooking.fulfilled.match(resultAction)) {
                toast.success(resultAction.payload.message);
                setShowCancelModal(false);
                setCancelReason('');
                navigate('/');
            } else {
                const errorMessage = resultAction.payload || 'Hủy đơn thất bại!';
                setCancelError(errorMessage);
            }
        } catch (error) {
            const errorMessage = typeof error === 'string' ? error : (error?.payload || error?.message || error?.error || 'Hủy đơn thất bại!');
            setCancelError(errorMessage);
        }
    };

    const handleTechnicianConfirm = async () => {
        if (!bookingId) return;
        setConfirming(true);
        try {
            const resultAction = await dispatch(technicianAcceptBookingThunk(bookingId));

            if (technicianAcceptBookingThunk.fulfilled.match(resultAction)) {
                toast.success('Bạn đã xác nhận nhận đơn!');
                dispatch(fetchBookingById(bookingId));
            } else {
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                
                if (errorMessage.includes('đã được thợ khác nhận trước')) {
                    setErrorMessage(errorMessage);
                    setShowErrorModal(true);
                    setTimeout(() => {
                        dispatch(fetchBookingById(bookingId));
                    }, 1000);
                } else if (errorMessage.includes('Write conflict') || errorMessage.includes('Transaction numbers')) {
                    setErrorMessage('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
                    setShowErrorModal(true);
                } else {
                    setErrorMessage(errorMessage);
                    setShowErrorModal(true);
                }
            }
        } catch (error) {
            const errorMessage = error?.payload || error?.message || 'Có lỗi xảy ra!';
            
            if (errorMessage.includes('đã được thợ khác nhận trước')) {
                setErrorMessage(errorMessage);
                setShowErrorModal(true);
                setTimeout(() => {
                    dispatch(fetchBookingById(bookingId));
                }, 1000);
            } else if (errorMessage.includes('Write conflict') || errorMessage.includes('Transaction numbers')) {
                setErrorMessage('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
                setShowErrorModal(true);
            } else {
                setErrorMessage(errorMessage);
                setShowErrorModal(true);
            }
        } finally {
            setConfirming(false);
        }
    };

    const handleTechnicianReject = async () => {
        if (!bookingId) return;
        setRejecting(true);
        try {
            const resultAction = await dispatch(technicianRejectBookingThunk(bookingId));

            if (technicianRejectBookingThunk.fulfilled.match(resultAction)) {
                toast.success('Bạn đã từ chối yêu cầu!');
                navigate('/');
            } else {
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                setErrorMessage(errorMessage);
                setShowErrorModal(true);
            }
        } catch (error) {
            const errorMessage = error?.payload || error?.message || 'Có lỗi xảy ra!';
            setErrorMessage(errorMessage);
            setShowErrorModal(true);
        } finally {
            setRejecting(false);
        }
    };

    if (!booking) {
        return (
            <div className="booking-details-skeleton">
                <div className="booking-details-skeleton-card">
                    <div className="booking-details-skeleton-header"></div>
                    <div className="booking-details-skeleton-content">
                        <div className="booking-details-skeleton-line"></div>
                        <div className="booking-details-skeleton-line"></div>
                        <div className="booking-details-skeleton-line"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-details-container">
            {/* Header Section */}
            <div className="booking-details-header">
                <div className="booking-details-header-main">
                    <div className="booking-details-id-section">
                        <FaTag className="booking-details-id-icon" />
                        <div className="booking-details-id-info">
                            <span className="booking-details-id-label">Mã đơn hàng</span>
                            <span className="booking-details-id-value">{booking?.bookingCode}</span>
                        </div>
                    </div>
                    <div className="booking-details-status-section">
                        <FaCircle className={`booking-details-status-dot ${booking?.status?.toLowerCase()}`} />
                        <span className="booking-details-status-text">{statusConfig.text}</span>
                    </div>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="booking-details-quick-info">
                <div className="booking-details-quick-card">
                    <FaUserTie className="booking-details-quick-icon" />
                    <div className="booking-details-quick-content">
                        <span className="booking-details-quick-label">Khách hàng</span>
                        <span className="booking-details-quick-value">
                            {booking?.customerId?.fullName || 'Chưa có thông tin'}
                        </span>
                    </div>
                </div>
                
                <div className="booking-details-quick-card">
                    <FaTools className="booking-details-quick-icon" />
                    <div className="booking-details-quick-content">
                        <span className="booking-details-quick-label">Dịch vụ</span>
                        <span className="booking-details-quick-value">
                            {booking?.serviceId?.serviceName || 'Đang cập nhật...'}
                        </span>
                    </div>
                </div>

                <div className="booking-details-quick-card">
                    <FaHome className="booking-details-quick-icon" />
                    <div className="booking-details-quick-content">
                        <span className="booking-details-quick-label">Địa chỉ</span>
                        <span className="booking-details-quick-value address-text">
                            {booking?.location?.address || 'Đang cập nhật...'}
                        </span>
                    </div>
                </div>

                <div className="booking-details-quick-card">
                    <FaCalendarCheck className="booking-details-quick-icon" />
                    <div className="booking-details-quick-content">
                        <span className="booking-details-quick-label">Loại đặt lịch</span>
                        <span className="booking-details-quick-value">
                            {booking?.isUrgent ? 'Đặt ngay' : 'Đặt lịch'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="booking-details-content">
                <Tabs defaultActiveKey="service" className="booking-details-tabs">
                    <Tab eventKey="service" title={
                        <div className="booking-details-tab-title">
                            <FaWrench className="booking-details-tab-icon" />
                            <span>Thông tin dịch vụ</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            {/* Service Details */}
                            <div className="booking-details-section">
                                <div className="booking-details-section-header">
                                    <FaTools className="booking-details-section-icon" />
                                    <h5>Chi tiết dịch vụ</h5>
                                </div>
                                <div className="booking-details-info-grid">
                                    <div className="booking-details-info-item">
                                        <span className="booking-details-info-label">Loại dịch vụ</span>
                                        <span className="booking-details-info-value">
                                            {booking?.serviceId?.serviceName || 'Đang cập nhật...'}
                                        </span>
                                    </div>
                                    
                                    <div className="booking-details-info-item">
                                        <span className="booking-details-info-label">Mô tả</span>
                                        <span className="booking-details-info-value description-text">
                                            {booking?.description || 'Không có mô tả'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Info */}
                            {!booking?.isUrgent && (
                                <div className="booking-details-section">
                                    <div className="booking-details-section-header">
                                        <FaCalendarAlt className="booking-details-section-icon" />
                                        <h5>Lịch trình</h5>
                                    </div>
                                    <div className="booking-details-info-grid">
                                        <div className="booking-details-info-item">
                                            <span className="booking-details-info-label">Ngày đặt lịch</span>
                                            <span className="booking-details-info-value">
                                                {formatDateOnly(booking?.schedule?.startTime) || 'Đang cập nhật...'}
                                            </span>
                                        </div>
                                        <div className="booking-details-info-item">
                                            <span className="booking-details-info-label">Thời gian</span>
                                            <span className="booking-details-info-value">
                                                {booking?.schedule?.startTime && booking?.schedule?.expectedEndTime
                                                    ? `${formatTimeOnly(booking?.schedule?.startTime)} - ${formatTimeOnly(booking?.schedule?.expectedEndTime)}`
                                                    : 'Thời gian không hợp lệ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tab>

                    <Tab eventKey="images" title={
                        <div className="booking-details-tab-title">
                            <FaImage className="booking-details-tab-icon" />
                            <span>Hình ảnh</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            {Array.isArray(booking?.images) && booking.images.length > 0 ? (
                                <div className="booking-details-section">
                                    <div className="booking-details-section-header">
                                        <FaImage className="booking-details-section-icon" />
                                        <h5>Hình ảnh đính kèm ({booking.images.length})</h5>
                                    </div>
                                    <div className="booking-details-image-gallery">
                                        {booking.images.map((image, index) => (
                                            <div key={index} className="booking-details-image-item" onClick={() => setSelectedImage(image)}>
                                                <img src={image} alt={`Booking ${index + 1}`} />
                                                <div className="booking-details-image-overlay">
                                                    <FaEye />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="booking-details-empty-state">
                                    <div className="booking-details-empty-icon">
                                        <FaImage />
                                    </div>
                                    <h4>Chưa có hình ảnh</h4>
                                    <p>Hình ảnh đính kèm sẽ được hiển thị tại đây khi có.</p>
                                </div>
                            )}
                        </div>
                    </Tab>

                    <Tab eventKey="pricing" title={
                        <div className="booking-details-tab-title">
                            <FaReceipt className="booking-details-tab-icon" />
                            <span>Chi phí</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            {(booking?.quote && booking?.status !== 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL') || booking?.technicianService ? (
                                <div className="booking-details-section">
                                    <div className="booking-details-section-header">
                                        <FaReceipt className="booking-details-section-icon" />
                                        <h5>Thông tin chi phí</h5>
                                    </div>
                                    <div className="booking-details-pricing-grid">
                                        <div className="booking-details-pricing-item">
                                            <span className="booking-details-pricing-label">Giá công</span>
                                            <span className="booking-details-pricing-value">
                                                {booking.quote?.laborPrice?.toLocaleString() || booking.technicianService?.price?.toLocaleString() || 0} VNĐ
                                            </span>
                                        </div>
                                        <div className="booking-details-pricing-item">
                                            <span className="booking-details-pricing-label">Thời gian bảo hành</span>
                                            <span className="booking-details-pricing-value">
                                                {booking.quote?.warrantiesDuration || booking.technicianService?.warrantyDuration || 0} tháng
                                            </span>
                                        </div>
                                        <div className="booking-details-pricing-item">
                                            <span className="booking-details-pricing-label">Giá thiết bị</span>
                                            <span className="booking-details-pricing-value">
                                                {(() => {
                                                    if (booking?.quote?.items && booking.quote.items.length > 0) {
                                                        const acceptedItemsTotal = booking.quote.items
                                                            .filter(item => item.status === 'ACCEPTED')
                                                            .reduce((total, item) => total + (item.price * item.quantity), 0);
                                                        return acceptedItemsTotal.toLocaleString();
                                                    }
                                                    return '0';
                                                })()} VNĐ
                                            </span>
                                        </div>
                                        <div className="booking-details-pricing-item total">
                                            <span className="booking-details-pricing-label">Tổng tiền hiện tại</span>
                                            <span className="booking-details-pricing-value total-price">
                                                {booking?.finalPrice?.toLocaleString() || booking.technicianService?.price?.toLocaleString() || 0} VNĐ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="booking-details-empty-state">
                                    <div className="booking-details-empty-icon">
                                        <FaReceipt />
                                    </div>
                                    <h4>Chưa có thông tin chi phí</h4>
                                    <p>Thông tin chi phí sẽ được hiển thị khi có báo giá từ kỹ thuật viên.</p>
                                </div>
                            )}
                        </div>
                    </Tab>

                    <Tab eventKey="labor" title={
                        <div className="booking-details-tab-title">
                            <FaTools className="booking-details-tab-icon" />
                            <span>Thiết bị phát sinh</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            {booking?.quote?.items && booking.quote.items.length > 0 ? (
                                <div className="booking-details-section">
                                    <div className="booking-details-section-header">
                                        <FaTools className="booking-details-section-icon" />
                                        <h5>Danh sách thiết bị phát sinh</h5>
                                    </div>
                                    <div className="booking-details-items-table-container">
                                        <table className="booking-details-items-table">
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Tên thiết bị</th>
                                                    <th>Đơn giá</th>
                                                    <th>Số lượng</th>
                                                    <th>Thành tiền</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {booking.quote.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-center">{idx + 1}</td>
                                                        <td className="item-name">{item.name}</td>
                                                        <td className="item-price">{item.price.toLocaleString()} VNĐ</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="item-total">{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                                        <td className="text-center">
                                                            <span className={`item-status ${item.status?.toLowerCase()}`}>
                                                                {item.status === 'PENDING' && 'Chờ xác nhận'}
                                                                {item.status === 'ACCEPTED' && 'Đã chấp nhận'}
                                                                {item.status === 'REJECTED' && 'Đã từ chối'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-end fw-bold">Tổng giá thiết bị:</td>
                                                    <td colSpan="2" className="total-items-price fw-bold">
                                                        {booking.quote.items
                                                            .filter(item => item.status === 'PENDING' || item.status === 'ACCEPTED')
                                                            .reduce((total, item) => total + (item.price * item.quantity), 0)
                                                            .toLocaleString()} VNĐ
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="booking-details-empty-state">
                                    <div className="booking-details-empty-icon">
                                        <FaTools />
                                    </div>
                                    <h4>Chưa có thiết bị phát sinh</h4>
                                    <p>Danh sách thiết bị phát sinh sẽ được hiển thị khi có yêu cầu từ kỹ thuật viên.</p>
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="booking-details-actions">
                {/* Technician Actions */}
                {user?.role?.name === 'TECHNICIAN' && booking?.status === 'AWAITING_CONFIRM' && !booking?.technicianId && (
                    <div className="booking-details-technician-actions">
                        <Button
                            variant="success"
                            className="booking-details-action-btn confirm-btn"
                            disabled={confirming}
                            onClick={handleTechnicianConfirm}
                        >
                            {confirming ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xác nhận...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="me-2" />
                                    Chấp nhận yêu cầu
                                </>
                            )}
                        </Button>
                        
                        <Button
                            variant="warning"
                            className="booking-details-action-btn reject-btn"
                            disabled={rejecting}
                            onClick={handleTechnicianReject}
                        >
                            {rejecting ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang từ chối...
                                </>
                            ) : (
                                <>
                                    <FaTimes className="me-2" />
                                    Từ chối yêu cầu
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Cancel Button */}
                {booking?.status !== 'DONE' &&
                    booking?.status !== 'AWAITING_DONE' &&
                    ((user?.role?.name === 'CUSTOMER') ||
                    (user?.role?.name === 'TECHNICIAN' && canTechnicianCancel())) && (
                        <Button
                            variant="outline-danger"
                            className="booking-details-cancel-btn"
                            onClick={() => setShowCancelModal(true)}
                        >
                            <FaTrash className="me-2" />
                            Hủy đơn hàng
                        </Button>
                    )}
            </div>

            {/* Cancel Modal */}
            <Modal show={showCancelModal} onHide={() => {
                setShowCancelModal(false);
                setCancelError('');
                setCancelReason('');
            }} centered>
                <Modal.Header closeButton className="booking-details-modal-header-danger">
                    <Modal.Title>
                        <FaExclamationTriangle className="me-2" />
                        Xác nhận hủy đơn hàng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <FaExclamationTriangle className="me-2" />
                        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
                    </Alert>
                    
                    {cancelError && (
                        <Alert variant="danger" className="mt-3">
                            <FaExclamationTriangle className="me-2" />
                            <strong>Lỗi:</strong> {cancelError}
                        </Alert>
                    )}
                    
                    <Form.Group className="mt-3">
                        <Form.Label>Lý do hủy đơn:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => {
                                setCancelReason(e.target.value);
                                if (cancelError) setCancelError('');
                            }}
                            placeholder="Nhập lý do hủy đơn..."
                            isInvalid={!!cancelError}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowCancelModal(false);
                        setCancelError('');
                        setCancelReason('');
                    }}>
                        <FaTimes className="me-2" />
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleCancel}>
                        <FaTrash className="me-2" />
                        Xác nhận hủy
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Error Modal */}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
                <Modal.Header closeButton className="booking-details-modal-header-warning">
                    <Modal.Title>
                        <FaExclamationTriangle className="me-2" />
                        Thông báo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <FaExclamationTriangle className="me-2" />
                        <strong>Lưu ý:</strong> {errorMessage}
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => {
                        setShowErrorModal(false);
                        if (!errorMessage.includes("Vui lòng nhập lý do hủy đơn")) {
                            navigate('/');
                        }
                    }}>
                        <FaCheckCircle className="me-2" />
                        Đã hiểu
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Image Modal */}
            {selectedImage && (
                <div className="booking-details-image-modal" onClick={() => setSelectedImage(null)}>
                    <div className="booking-details-image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="light"
                            className="booking-details-image-modal-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            <FaTimes />
                        </Button>
                        <img src={selectedImage} alt="Zoom" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingDetails;
