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
    FaCircle
} from 'react-icons/fa';

function BookingDetails({ bookingId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = useState(null);
    const { booking, status: bookingStatusState } = useSelector((state) => state.booking);
    // console.log('--- USER ---', user);
    console.log('--- BOOKING ---', booking);
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

        // Lắng nghe khi thợ thêm thiết bị phát sinh
        const unsubscribeAdded = onAdditionalItemsAdded((data) => {
            console.log('Additional items added in BookingDetails:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi có cập nhật trạng thái thiết bị phát sinh
        const unsubscribeStatusUpdate = onAdditionalItemsStatusUpdate((data) => {
            console.log('Additional items status update in BookingDetails:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi user chấp nhận thiết bị phát sinh
        const unsubscribeAccepted = onAdditionalItemsAccepted((data) => {
            console.log('Additional items accepted in BookingDetails:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi user từ chối thiết bị phát sinh
        const unsubscribeRejected = onAdditionalItemsRejected((data) => {
            console.log('Additional items rejected in BookingDetails:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Cleanup listeners khi component unmount hoặc bookingId thay đổi
        return () => {
            unsubscribeAdded();
            unsubscribeStatusUpdate();
            unsubscribeAccepted();
            unsubscribeRejected();
        };
    }, [bookingId, dispatch]);

    console.log('--- BOOKING DETAILS ---', booking);

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
            setCancelError(''); // Clear previous error
            dispatch(setLastCancelBy(user._id));
            
            // Không sử dụng unwrap() để có thể xử lý error tốt hơn
            const resultAction = await dispatch(cancelBooking({ bookingId, reason: cancelReason }));
            console.log('--- CANCEL RESULT ACTION ---', resultAction);
            
            if (cancelBooking.fulfilled.match(resultAction)) {
                toast.success(resultAction.payload.message);
                setShowCancelModal(false);
                setCancelReason('');
                navigate('/');
            } else {
                const errorMessage = resultAction.payload || 'Hủy đơn thất bại!';
                console.log('--- CANCEL ERROR FROM ACTION ---', errorMessage);
                setCancelError(errorMessage);
            }
        } catch (error) {
            // console.log('--- CANCEL ERROR ---', error);
            // console.log('--- CANCEL ERROR PAYLOAD ---', error?.payload);
            // console.log('--- CANCEL ERROR MESSAGE ---', error?.message);
            // console.log('--- CANCEL ERROR TYPE ---', typeof error);
            // console.log('--- CANCEL ERROR KEYS ---', Object.keys(error || {}));
            
            // Khi sử dụng unwrap(), error message thường là string trực tiếp
            const errorMessage = typeof error === 'string' ? error : (error?.payload || error?.message || error?.error || 'Hủy đơn thất bại!');
            console.log('--- FINAL ERROR MESSAGE ---', errorMessage);
            setCancelError(errorMessage);
        }
    };

    const handleTechnicianConfirm = async () => {
        if (!bookingId) return;
        setConfirming(true);
        try {
            // console.log('--- FRONTEND: Bắt đầu gửi request ---');
            const resultAction = await dispatch(technicianAcceptBookingThunk(bookingId));
            // console.log('--- FRONTEND: Kết quả từ thunk ---', resultAction);
            // console.log('--- FRONTEND: Action type ---', resultAction.type);
            // console.log('--- FRONTEND: Payload ---', resultAction.payload);
            // console.log('--- FRONTEND: Error ---', resultAction.error);

            if (technicianAcceptBookingThunk.fulfilled.match(resultAction)) {
                console.log('--- FRONTEND: Thành công ---');
                toast.success('Bạn đã xác nhận nhận đơn!');
                dispatch(fetchBookingById(bookingId));
            } else {
                console.log('--- FRONTEND: Thất bại ---');
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                console.log('--- FRONTEND: Error message ---', errorMessage);
                
                // Xử lý lỗi race condition và MongoDB transaction
                if (errorMessage.includes('đã được thợ khác nhận trước')) {
                    setErrorMessage(errorMessage);
                    setShowErrorModal(true);
                    // Refresh booking data để đảm bảo UI hiển thị đúng trạng thái
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
            console.log('--- FRONTEND: Catch error ---', error);
            const errorMessage = error?.payload || error?.message || 'Có lỗi xảy ra!';
            console.log('--- FRONTEND: Error message in catch ---', errorMessage);
            
            // Xử lý lỗi race condition và MongoDB transaction
            if (errorMessage.includes('đã được thợ khác nhận trước')) {
                setErrorMessage(errorMessage);
                setShowErrorModal(true);
                // Refresh booking data để đảm bảo UI hiển thị đúng trạng thái
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
            console.log('--- TECHNICIAN REJECT DEBUG ---');
            console.log('Booking ID:', bookingId);
            console.log('Booking Status:', booking?.status);
            console.log('User ID:', user?._id);
            console.log('User Role:', user?.role?.name);
            console.log('Current Booking:', booking);

            const resultAction = await dispatch(technicianRejectBookingThunk(bookingId));
            console.log('--- TECHNICIAN REJECT RESULT ---', resultAction);

            if (technicianRejectBookingThunk.fulfilled.match(resultAction)) {
                toast.success('Bạn đã từ chối yêu cầu!');
                navigate('/');
            } else {
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                setErrorMessage(errorMessage);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.log('--- REJECT ERROR ---', error);
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
            {/* Header */}
            <div className="booking-details-header-banner">
                <div className="booking-details-id">
                    <FaTag className="booking-details-id-icon" />
                    <span>{booking?.bookingCode}</span>
                </div>
                <div className="booking-details-status-indicator">
                    <FaCircle className={`booking-details-status-dot ${booking?.status?.toLowerCase()}`} />
                    <span>{statusConfig.text}</span>
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
                            {/* Service Info */}
                            <div className="booking-details-info-section">
                                {/* <div className="booking-details-section-title">
                                    <FaWrench className="booking-details-title-icon" />
                                    <span>Thông tin dịch vụ</span>
                                </div> */}
                                <div className="booking-details-info-cards">
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaTools />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Loại dịch vụ</div>
                                            <div className="booking-details-card-value">{booking?.serviceId?.serviceName || 'Đang cập nhật...'}</div>
                                        </div>
                                    </div>

                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaClock />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Loại đặt lịch</div>
                                            <div className="booking-details-card-value">
                                                {booking?.isUrgent ? 'Đặt ngay' : 'Đặt lịch'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="booking-details-info-card full-width">
                                        <div className="booking-details-card-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Địa chỉ</div>
                                            <div className="booking-details-card-value address-text">
                                                {booking?.location?.address || 'Đang cập nhật...'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="booking-details-info-card full-width">
                                        <div className="booking-details-card-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Mô tả</div>
                                            <div className="booking-details-card-value description-text">
                                                {booking?.description || 'Không có mô tả'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Info */}
                            {!booking?.isUrgent && (
                                <div className="booking-details-info-section">
                                    <div className="booking-details-section-title">
                                        <FaCalendarAlt className="booking-details-title-icon" />
                                        <span>Lịch trình</span>
                                    </div>
                                    <div className="booking-details-info-cards">
                                        <div className="booking-details-info-card">
                                            <div className="booking-details-card-icon">
                                                <FaCalendarAlt />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Ngày đặt lịch</div>
                                                <div className="booking-details-card-value">{formatDateOnly(booking?.schedule?.startTime) || 'Đang cập nhật...'}</div>
                                            </div>
                                        </div>
                                        <div className="booking-details-info-card">
                                            <div className="booking-details-card-icon">
                                                <FaClock />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Thời gian</div>
                                                <div className="booking-details-card-value">
                                                    {booking?.schedule?.startTime && booking?.schedule?.expectedEndTime
                                                        ? `${formatTimeOnly(booking?.schedule?.startTime)} - ${formatTimeOnly(booking?.schedule?.expectedEndTime)}`
                                                        : 'Thời gian không hợp lệ'}
                                                </div>
                                            </div>
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
                                <div className="booking-details-info-section booking-details-images-section">
                                    <div className="booking-details-section-title">
                                        <FaImage className="booking-details-title-icon" />
                                        <span>Hình ảnh đính kèm ({booking.images.length})</span>
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
                                <div className="booking-details-no-pricing-info">
                                    <div className="booking-details-no-data-icon">
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
                                <div className="booking-details-info-section booking-details-pricing-section">
                                    <div className="booking-details-info-cards">
                                        <div className="booking-details-info-card">
                                            <div className="booking-details-card-icon">
                                                <FaMoneyBillWave />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Giá công</div>
                                                <div className="booking-details-card-value booking-details-price-value">
                                                    {booking.quote?.laborPrice?.toLocaleString() || booking.technicianService?.price?.toLocaleString() || 0} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-details-info-card">
                                            <div className="booking-details-card-icon">
                                                <FaShieldAlt />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Thời gian bảo hành</div>
                                                <div className="booking-details-card-value">
                                                    {booking.quote?.warrantiesDuration || booking.technicianService?.warrantyDuration || 0} tháng
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-details-info-card">
                                            <div className="booking-details-card-icon">
                                                <FaTools />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Giá thiết bị</div>
                                                <div className="booking-details-card-value booking-details-price-value">
                                                    {(() => {
                                                        if (booking?.quote?.items && booking.quote.items.length > 0) {
                                                            const acceptedItemsTotal = booking.quote.items
                                                                .filter(item => item.status === 'ACCEPTED')
                                                                .reduce((total, item) => total + (item.price * item.quantity), 0);
                                                            return acceptedItemsTotal.toLocaleString();
                                                        }
                                                        return '0';
                                                    })()} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-details-info-card booking-details-total-card">
                                            <div className="booking-details-card-icon">
                                                <FaReceipt />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Tổng tiền hiện tại</div>
                                                <div className="booking-details-card-value booking-details-total-price">
                                                    {booking?.finalPrice?.toLocaleString() || booking.technicianService?.price?.toLocaleString() || 0} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="booking-details-no-pricing-info">
                                    <div className="booking-details-no-data-icon">
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
                                <div className="booking-details-info-section booking-details-items-section">
                                    <div className="table-responsive">
                                        <table className="table table-hover booking-details-items-table">
                                            <thead className="booking-details-table-header">
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
                                                    <tr key={idx} className="booking-details-table-row">
                                                        <td className="text-center">{idx + 1}</td>
                                                        <td className="booking-details-item-name">{item.name}</td>
                                                        <td className="booking-details-item-price">{item.price.toLocaleString()} VNĐ</td>
                                                        <td className="text-center">{item.quantity}</td>
                                                        <td className="booking-details-item-total">{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                                        <td className="text-center">
                                                            <span className={`booking-details-item-status ${item.status?.toLowerCase()}`}>
                                                                {item.status === 'PENDING' && 'Chờ xác nhận'}
                                                                {item.status === 'ACCEPTED' && 'Đã chấp nhận'}
                                                                {item.status === 'REJECTED' && 'Đã từ chối'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="booking-details-table-footer">
                                                <tr>
                                                    <td colSpan="4" className="text-end fw-bold">Tổng giá thiết bị:</td>
                                                    <td colSpan="2" className="booking-details-total-items-price fw-bold">
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
                                <div className="booking-details-no-pricing-info">
                                    <div className="booking-details-no-data-icon">
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
            <div className="booking-details-action-section">
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
                    booking?.status !== 'AWAITING_DONE' && (
                        (user?.role?.name === 'CUSTOMER') ||
                        (user?.role?.name === 'TECHNICIAN' && canTechnicianCancel())
                    ) && (
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
                                if (cancelError) setCancelError(''); // Clear error when user types
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
                        // Chỉ navigate về home nếu không phải lỗi validation
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
