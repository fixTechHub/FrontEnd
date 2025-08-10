import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Tabs, Tab, Alert, Spinner } from "react-bootstrap";
import { getWarrantyInformationThunk, acceptWarrantyThunk, rejectWarrantyThunk, proposeWarrantyScheduleThunk, confirmWarrantyScheduleThunk } from "../../features/booking-warranty/warrantySlice";
import { formatDateOnly, formatTimeOnly } from "../../utils/formatDate";
import { BOOKING_WARRANTY_STATUS_CONFIG } from "../../constants/bookingConstants";
import { toast } from 'react-toastify';
import './Details.css';
import {
    FaCalendarAlt,
    FaClock,
    FaTools,
    FaCheckCircle,
    FaTimes,
    FaExclamationTriangle,
    FaImage,
    FaWrench,
    FaUser,
    FaFileAlt,
    FaEye,
    FaCircle,
    FaInfoCircle
} from 'react-icons/fa';

function BookingWarrantyDetails({ bookingWarrantyId, onWarrantyUpdated }) {
    const dispatch = useDispatch();
    const { warranty, loading, error, loadingSchedule } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);
    const [rejectedReason, setRejectedReason] = useState('');
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageType, setImageType] = useState('warranty'); // 'warranty' or 'booking'
    const [showImageModal, setShowImageModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [proposedDate, setProposedDate] = useState("");
    const [proposedTime, setProposedTime] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [expectedEndDate, setExpectedEndDate] = useState("");
    const [expectedEndTime, setExpectedEndTime] = useState("");
    const [rejectError, setRejectError] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);
    const isCustomer = user?.role?.name === 'CUSTOMER';
    const isTechnician = user?.role?.name === 'TECHNICIAN';
    const displayName = isCustomer
        ? warranty?.technicianId?.userId?.fullName || 'Không có dữ liệu'
        : warranty?.customerId?.fullName || 'Không có dữ liệu';
    // console.log(warranty.bookingId.warrantyExpiresAt);
    
    const styles = {
        modalHeader: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            padding: '15px 20px'
        },
        modalBody: {
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto'
        },
        imageModalImage: {
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '8px'
        },
        imageModalNavBtn: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'background-color 0.3s'
        },
        imageModalNavBtnPrev: {
            left: '20px'
        },
        imageModalNavBtnNext: {
            right: '20px'
        },
        imageModalNavBtnHover: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6c757d'
        },
        imageSection: {
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            flexWrap: 'wrap'
        },
        imageColumn: {
            flex: '1',
            minWidth: '200px'
        }
    };

    useEffect(() => {
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    }, [dispatch, bookingWarrantyId]);

    const statusConfig = BOOKING_WARRANTY_STATUS_CONFIG[warranty?.status] || BOOKING_WARRANTY_STATUS_CONFIG.default;
    const isExpired = warranty?.expireAt && new Date(warranty.expireAt) < new Date() && warranty?.status === 'PENDING';
    const warrantyStatusText = isExpired ? 'HẾT HẠN' : statusConfig.text;

    // Calculate days left until warranty expires
    const calculateDaysLeft = () => {
        if (!warranty?.bookingId?.warrantyExpiresAt) return 'Không có dữ liệu';
        const expireDate = new Date(warranty.bookingId.warrantyExpiresAt);
        const today = new Date();
        const diffMs = expireDate - today;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return daysLeft >= 0 ? `${daysLeft} ngày` : 'Hết hạn';
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const validateDateTime = (date, time) => {
        if (!date || !time) return false;
        const selectedDateTime = new Date(`${date}T${time}:00+07:00`);
        return selectedDateTime >= tomorrow;
    };

    const handleAcceptWarranty = async () => {
        try {
            await dispatch(acceptWarrantyThunk({ bookingWarrantyId, status: 'CONFIRMED' })).unwrap();
            toast.success('Chấp nhận yêu cầu bảo hành thành công');
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi: ${error?.message || error || 'Đã xảy ra lỗi'}`);
        }
    };

    const handleRejectWarranty = async () => {
        if (!rejectedReason.trim()) {
            setRejectError('Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            await dispatch(rejectWarrantyThunk({ bookingWarrantyId, formData: { status: 'DENIED', rejectedReason } })).unwrap();
            toast.success('Từ chối yêu cầu bảo hành thành công');
            setRejectedReason('');
            setShowRejectModal(false);
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            setRejectError(`Lỗi: ${error?.message || error || 'Đã xảy ra lỗi'}`);
        }
    };

    const handleProposeSchedule = async (e) => {
        e.preventDefault();
        if (!proposedDate || !proposedTime) {
            toast.error("Vui lòng chọn cả ngày và giờ đề xuất!");
            return;
        }
        if (!validateDateTime(proposedDate, proposedTime)) {
            toast.error("Ngày và giờ đề xuất phải từ ngày mai trở đi!");
            return;
        }
        const proposedDateTime = `${proposedDate}T${proposedTime}:00+07:00`;
        try {
            await dispatch(proposeWarrantyScheduleThunk({ bookingWarrantyId, proposedSchedule: proposedDateTime })).unwrap();
            toast.success("Đề xuất lịch bảo hành thành công!");
            setShowProposeModal(false);
            setProposedDate("");
            setProposedTime("");
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi khi đề xuất lịch: ${error?.message || error || "Đã xảy ra lỗi"}`);
        }
    };

    const handleConfirmSchedule = async (e) => {
        e.preventDefault();
        if (!startDate || !startTime || !expectedEndDate || !expectedEndTime) {
            toast.error("Vui lòng cung cấp đầy đủ ngày và giờ bắt đầu cũng như kết thúc!");
            return;
        }
        if (!validateDateTime(startDate, startTime)) {
            toast.error("Thời gian bắt đầu phải từ ngày mai trở đi!");
            return;
        }
        const startDateTime = new Date(`${startDate}T${startTime}:00+07:00`);
        const endDateTime = new Date(`${expectedEndDate}T${expectedEndTime}:00+07:00`);
        if (endDateTime <= startDateTime) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
            return;
        }
        try {
            await dispatch(confirmWarrantyScheduleThunk({ bookingWarrantyId, data: { startTime: startDateTime.toISOString(), expectedEndTime: endDateTime.toISOString() } })).unwrap();
            toast.success("Xác nhận lịch bảo hành thành công!");
            setShowConfirmModal(false);
            setStartDate("");
            setStartTime("");
            setExpectedEndDate("");
            setExpectedEndTime("");
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi: ${error?.message || error || "Đã xảy ra lỗi"}`);
        }
    };

    const handlePrevImage = () => {
        const images = imageType === 'warranty' ? warranty?.images : warranty?.bookingId?.images;
        setSelectedImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        const images = imageType === 'warranty' ? warranty?.images : warranty?.bookingId?.images;
        setSelectedImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <FaClock />;
            case 'CONFIRMED': return <FaCheckCircle />;
            case 'DENIED': return <FaTimes />;
            case 'COMPLETED': return <FaCheckCircle />;
            default: return <FaExclamationTriangle />;
        }
    };

    if (!warranty) {
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
            <div className="booking-details-header-banner">
                <div className="booking-details-id">
                    <FaFileAlt className="booking-details-id-icon" />
                    <span>{warranty?.bookingId?.bookingCode || 'Không có mã đơn'}</span>
                </div>
                <div className="booking-details-status-indicator">
                    <FaCircle className={`booking-details-status-dot ${statusConfig.className}`} />
                    <span>{warrantyStatusText}</span>
                </div>
            </div>

            <div className="booking-details-content">
                <Tabs defaultActiveKey="warranty" className="booking-details-tabs">
                    <Tab eventKey="warranty" title={
                        <div className="booking-details-tab-title">
                            <FaWrench className="booking-details-tab-icon" />
                            <span>Thông tin bảo hành</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            <div className="booking-details-info-section">
                                <div className="booking-details-info-cards">
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaTools />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Dịch vụ</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.serviceId?.serviceName || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaUser />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}</div>
                                            <div className="booking-details-card-value">{displayName}</div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Ngày yêu cầu</div>
                                            <div className="booking-details-card-value">
                                                {formatDateOnly(warranty?.requestDate) || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Ngày đặt lịch</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.schedule?.startTime
                                                    ? `${formatDateOnly(warranty.bookingId.schedule.startTime)}`
                                                    : 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card full-width warranty-description-container">
                                        <div className="booking-details-card-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Mô tả vấn đề</div>
                                            <div
                                                className="booking-details-card-value description-text clickable"
                                            >
                                                <FaEye
                                                    className="description-icon"
                                                    onClick={() => setShowDescriptionModal(true)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {warranty?.status === 'DENIED' && warranty?.rejectedReason && (
                                        <div className="booking-details-info-card full-width">
                                            <div className="booking-details-card-icon">
                                                <FaExclamationTriangle />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Lý do từ chối</div>
                                                <div className="booking-details-card-value">{warranty.rejectedReason}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="booking" title={
                        <div className="booking-details-tab-title">
                            <FaInfoCircle className="booking-details-tab-icon" />
                            <span>Thông tin đặt lịch</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            <div className="booking-details-info-section">
                                <div className="booking-details-info-cards">
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Mã đặt lịch</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.bookingCode || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaTools />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Dịch vụ</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.serviceId?.serviceName || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaUser />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Khách hàng</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.customerId?.fullName || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaUser />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Kỹ thuật viên</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.technicianId?.userId?.fullName || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Ngày bắt đầu</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.schedule?.startTime
                                                    ? `${formatDateOnly(warranty.bookingId.schedule.startTime)} ${formatTimeOnly(warranty.bookingId.schedule.startTime)}`
                                                    : 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Ngày kết thúc dự kiến</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.schedule?.expectedEndTime
                                                    ? `${formatDateOnly(warranty.bookingId.schedule.expectedEndTime)} ${formatTimeOnly(warranty.bookingId.schedule.expectedEndTime)}`
                                                    : 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card">
                                        <div className="booking-details-card-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Thời gian bảo hành còn lại</div>
                                            <div className="booking-details-card-value">
                                                {calculateDaysLeft()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-details-info-card full-width">
                                        <div className="booking-details-card-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="booking-details-card-content">
                                            <div className="booking-details-card-label">Mô tả</div>
                                            <div className="booking-details-card-value">
                                                {warranty?.bookingId?.description || 'Không có dữ liệu'}
                                            </div>
                                        </div>
                                    </div>
                                    {warranty?.bookingId?.cancellationReason && (
                                        <div className="booking-details-info-card full-width">
                                            <div className="booking-details-card-icon">
                                                <FaExclamationTriangle />
                                            </div>
                                            <div className="booking-details-card-content">
                                                <div className="booking-details-card-label">Lý do hủy</div>
                                                <div className="booking-details-card-value">
                                                    {warranty?.bookingId?.cancellationReason}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="schedule" title={
                        <div className="booking-details-tab-title">
                            <FaCalendarAlt className="booking-details-tab-icon" />
                            <span>Lịch bảo hành</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            <div className="booking-details-info-section">
                                {loadingSchedule.propose || loadingSchedule.confirm ? (
                                    <div className="text-center">
                                        <Spinner animation="border" />
                                        <p>Đang tải...</p>
                                    </div>
                                ) : (
                                    <>
                                        {warranty?.proposedSchedule && (
                                            <div className="booking-details-info-card">
                                                <div className="booking-details-card-icon">
                                                    <FaCalendarAlt />
                                                </div>
                                                <div className="booking-details-card-content">
                                                    <div className="booking-details-card-label">Lịch đề xuất</div>
                                                    <div className="booking-details-card-value">
                                                        {formatDateOnly(warranty.proposedSchedule)} {formatTimeOnly(warranty.proposedSchedule)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {warranty?.confirmedSchedule && (
                                            <>
                                                <div className="booking-details-info-card">
                                                    <div className="booking-details-card-icon">
                                                        <FaCalendarAlt />
                                                    </div>
                                                    <div className="booking-details-card-content">
                                                        <div className="booking-details-card-label">Ngày bắt đầu</div>
                                                        <div className="booking-details-card-value">
                                                            {formatDateOnly(warranty.confirmedSchedule.startTime)} {formatTimeOnly(warranty.confirmedSchedule.startTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="booking-details-info-card">
                                                    <div className="booking-details-card-icon">
                                                        <FaCalendarAlt />
                                                    </div>
                                                    <div className="booking-details-card-content">
                                                        <div className="booking-details-card-label">Ngày kết thúc dự kiến</div>
                                                        <div className="booking-details-card-value">
                                                            {formatDateOnly(warranty.confirmedSchedule.expectedEndTime)} {formatTimeOnly(warranty.confirmedSchedule.expectedEndTime)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="booking-details-info-card">
                                                    <div className="booking-details-card-icon">
                                                        <FaClock />
                                                    </div>
                                                    <div className="booking-details-card-content">
                                                        <div className="booking-details-card-label">Thời gian dự kiến</div>
                                                        <div className="booking-details-card-value">
                                                            {(() => {
                                                                const start = new Date(warranty.confirmedSchedule.startTime);
                                                                const end = new Date(warranty.confirmedSchedule.expectedEndTime);
                                                                const diffMs = end - start;
                                                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                                                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                                return diffDays > 0 ? `${diffDays} ngày ${diffHours} giờ` : `${diffHours} giờ`;
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {!warranty?.proposedSchedule && !warranty?.confirmedSchedule && (
                                            <div className="booking-details-no-pricing-info">
                                                <div className="booking-details-no-data-icon">
                                                    <FaCalendarAlt />
                                                </div>
                                                <h4>Chưa có lịch bảo hành</h4>
                                                <p>Chưa có lịch bảo hành nào được đề xuất.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="images" title={
                        <div className="booking-details-tab-title">
                            <FaImage className="booking-details-tab-icon" />
                            <span>Hình ảnh</span>
                        </div>
                    }>
                        <div className="booking-details-tab-content">
                            <div className="booking-details-info-section" style={styles.imageSection}>
                                <div style={styles.imageColumn}>
                                    <h5>Hình ảnh đặt lịch</h5>
                                    {Array.isArray(warranty?.bookingId?.images) && warranty.bookingId.images.length > 0 ? (
                                        <div className="booking-details-image-stack">
                                            {warranty.bookingId.images.map((image, index) => (
                                                <div
                                                    key={`booking-${index}`}
                                                    className="booking-details-image-item stacked"
                                                    style={{ zIndex: warranty.bookingId.images.length - index }}
                                                    onClick={() => {
                                                        setSelectedImageIndex(index);
                                                        setImageType('booking');
                                                        setShowImageModal(true);
                                                    }}
                                                >
                                                    <img src={image} alt={`Booking ${index + 1}`} />
                                                    <div className="booking-details-image-overlay">
                                                        <FaEye />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Không có hình ảnh đặt lịch</p>
                                    )}
                                </div>
                                <div style={styles.imageColumn}>
                                    <h5>Hình ảnh bảo hành</h5>
                                    {Array.isArray(warranty?.images) && warranty.images.length > 0 ? (
                                        <div className="booking-details-image-stack">
                                            {warranty.images.map((image, index) => (
                                                <div
                                                    key={`warranty-${index}`}
                                                    className="booking-details-image-item stacked"
                                                    style={{ zIndex: warranty.images.length - index }}
                                                    onClick={() => {
                                                        setSelectedImageIndex(index);
                                                        setImageType('warranty');
                                                        setShowImageModal(true);
                                                    }}
                                                >
                                                    <img src={image} alt={`Warranty ${index + 1}`} />
                                                    <div className="booking-details-image-overlay">
                                                        <FaEye />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Không có hình ảnh bảo hành</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>

            <div className="booking-details-action-section">
                {isTechnician && warranty?.status === 'PENDING' && (
                    <div className="booking-details-technician-actions">
                        <Button
                            variant="success"
                            className="booking-details-action-btn confirm-btn"
                            onClick={handleAcceptWarranty}
                            disabled={loading || isExpired}
                            title={isExpired ? 'Không thể chấp nhận vì đã hết hạn' : ''}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="me-2" />
                                    Chấp nhận bảo hành
                                </>
                            )}
                        </Button>
                        <Button
                            variant="warning"
                            className="booking-details-action-btn reject-btn"
                            onClick={() => setShowRejectModal(true)}
                            disabled={loading}
                        >
                            <FaTimes className="me-2" />
                            Từ chối bảo hành
                        </Button>
                    </div>
                )}
                {isCustomer && warranty?.status === 'CONFIRMED' && !warranty?.proposedSchedule && (
                    <Button
                        variant="primary"
                        className="booking-details-action-btn"
                        onClick={() => setShowProposeModal(true)}
                        disabled={loadingSchedule.propose}
                    >
                        <FaCalendarAlt className="me-2" />
                        Đề xuất lịch bảo hành
                    </Button>
                )}
                {isTechnician && warranty?.status === 'CONFIRMED' && warranty?.proposedSchedule && !warranty?.confirmedSchedule && (
                    <Button
                        variant="primary"
                        className="booking-details-action-btn"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={loadingSchedule.confirm}
                    >
                        <FaCheckCircle className="me-2" />
                        Xác nhận lịch bảo hành
                    </Button>
                )}
            </div>

            <Modal
                show={showRejectModal}
                onHide={() => {
                    setShowRejectModal(false);
                    setRejectedReason('');
                    setRejectError('');
                }}
                centered
                size="md"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="booking-details-modal-header-danger">
                    <Modal.Title>
                        <FaExclamationTriangle className="me-2" />
                        Từ chối bảo hành
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rejectError && (
                        <Alert variant="danger">
                            <FaExclamationTriangle className="me-2" />
                            <strong>Lỗi:</strong> {rejectError}
                        </Alert>
                    )}
                    <Form.Group>
                        <Form.Label>Lý do từ chối <span style={{ color: '#dc3545' }}>*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={rejectedReason}
                            onChange={(e) => {
                                setRejectedReason(e.target.value);
                                if (rejectError) setRejectError('');
                            }}
                            placeholder="Nhập lý do từ chối (bắt buộc)"
                            isInvalid={!!rejectError}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowRejectModal(false);
                            setRejectedReason('');
                            setRejectError('');
                        }}
                    >
                        <FaTimes className="me-2" />
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleRejectWarranty}
                        disabled={loading}
                    >
                        <FaExclamationTriangle className="me-2" />
                        Xác nhận từ chối
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showProposeModal}
                onHide={() => {
                    setShowProposeModal(false);
                    setProposedDate("");
                    setProposedTime("");
                }}
                centered
                size="md"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="booking-details-modal-header">
                    <Modal.Title>Đề xuất lịch bảo hành</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleProposeSchedule}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày đề xuất <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                value={proposedDate}
                                min={minDate}
                                onChange={(e) => setProposedDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giờ đề xuất <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                value={proposedTime}
                                onChange={(e) => setProposedTime(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowProposeModal(false);
                                    setProposedDate("");
                                    setProposedTime("");
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loadingSchedule.propose}
                            >
                                {loadingSchedule.propose ? 'Đang xử lý...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal
                show={showConfirmModal}
                onHide={() => {
                    setShowConfirmModal(false);
                    setStartDate("");
                    setStartTime("");
                    setExpectedEndDate("");
                    setExpectedEndTime("");
                }}
                centered
                size="md"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="booking-details-modal-header">
                    <Modal.Title>Xác nhận lịch bảo hành</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleConfirmSchedule}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày bắt đầu <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                min={minDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giờ bắt đầu <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày kết thúc dự kiến <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="date"
                                value={expectedEndDate}
                                min={minDate}
                                onChange={(e) => setExpectedEndDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giờ kết thúc dự kiến <span style={{ color: "#dc3545" }}>*</span></Form.Label>
                            <Form.Control
                                type="time"
                                value={expectedEndTime}
                                onChange={(e) => setExpectedEndTime(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setStartDate("");
                                    setStartTime("");
                                    setExpectedEndDate("");
                                    setExpectedEndTime("");
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loadingSchedule.confirm}
                            >
                                {loadingSchedule.confirm ? 'Đang xử lý...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal
                show={showDescriptionModal}
                onHide={() => setShowDescriptionModal(false)}
                centered
                size="lg"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="booking-details-modal-header">
                    <Modal.Title>Mô tả vấn đề</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="description-modal-content">
                        {warranty?.reportedIssue || 'Không có mô tả'}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDescriptionModal(false)}>
                        <FaTimes className="me-2" />
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showImageModal}
                onHide={() => {
                    setShowImageModal(false);
                    setZoomLevel(1); // Reset zoom on close
                }}
                centered
                size="lg"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header style={styles.modalHeader}>
                    <Modal.Title>{imageType === 'warranty' ? 'Hình ảnh bảo hành' : 'Hình ảnh đặt lịch'}</Modal.Title>
                    <button
                        style={styles.closeBtn}
                        onClick={() => {
                            setShowImageModal(false);
                            setZoomLevel(1); // Reset zoom on close
                        }}
                    >
                        <span>×</span>
                    </button>
                </Modal.Header>
                <Modal.Body style={{ ...styles.modalBody, position: 'relative' }}>
                    {((imageType === 'warranty' && warranty?.images && warranty.images.length > 0) ||
                      (imageType === 'booking' && warranty?.bookingId?.images && warranty.bookingId.images.length > 0)) && (
                        <div
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                            onWheel={(e) => {
                                e.preventDefault();
                                setZoomLevel((prev) => {
                                    const newZoom = prev + (e.deltaY < 0 ? 0.1 : -0.1);
                                    return Math.max(0.5, Math.min(newZoom, 3)); // Limit zoom between 0.5x and 3x
                                });
                            }}
                        >
                            <img
                                src={imageType === 'warranty' ? warranty.images[selectedImageIndex] : warranty.bookingId.images[selectedImageIndex]}
                                alt={`${imageType === 'warranty' ? 'Warranty' : 'Booking'} ${selectedImageIndex + 1}`}
                                style={{ ...styles.imageModalImage, transform: `scale(${zoomLevel})` }}
                            />
                            {((imageType === 'warranty' ? warranty.images : warranty.bookingId.images).length > 1) && (
                                <>
                                    <button
                                        style={{ ...styles.imageModalNavBtn, ...styles.imageModalNavBtnPrev, position: 'absolute', left: '10px' }}
                                        onClick={handlePrevImage}
                                        onMouseOver={(e) => Object.assign(e.target.style, { ...styles.imageModalNavBtnHover })}
                                        onMouseOut={(e) => Object.assign(e.target.style, { ...styles.imageModalNavBtn, position: 'absolute', left: '10px' })}
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        style={{ ...styles.imageModalNavBtn, ...styles.imageModalNavBtnNext, position: 'absolute', right: '10px' }}
                                        onClick={handleNextImage}
                                        onMouseOver={(e) => Object.assign(e.target.style, { ...styles.imageModalNavBtnHover })}
                                        onMouseOut={(e) => Object.assign(e.target.style, { ...styles.imageModalNavBtn, position: 'absolute', right: '10px' })}
                                    >
                                        &gt;
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default BookingWarrantyDetails;