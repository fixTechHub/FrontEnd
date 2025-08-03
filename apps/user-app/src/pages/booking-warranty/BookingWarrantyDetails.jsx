import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import { getWarrantyInformationThunk, acceptWarrantyThunk, rejectWarrantyThunk } from "../../features/booking-warranty/warrantySlice";
import { formatDateOnly } from "../../utils/formatDate";
import { BOOKING_WARRANTY_STATUS_CONFIG } from "../../constants/bookingConstants";
import { toast } from 'react-toastify';
import './Details.css'
function BookingWarrantyDetails({ bookingWarrantyId, onWarrantyUpdated }) {
    const dispatch = useDispatch();
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);
    const [rejectedReason, setRejectedReason] = useState('');
    const [expandedNotes2, setExpandedNotes2] = useState({});
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    useEffect(() => {
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    }, [dispatch, bookingWarrantyId]);

    const statusConfig = BOOKING_WARRANTY_STATUS_CONFIG[warranty?.status] || BOOKING_WARRANTY_STATUS_CONFIG.default;

    const isCustomer = user?.role?.name === 'CUSTOMER';
    const isTechnician = user?.role?.name === 'TECHNICIAN';
    const displayName = isCustomer
        ? warranty?.technicianId?.userId?.fullName || 'Không có dữ liệu'
        : warranty?.customerId?.fullName || 'Không có dữ liệu';

    const handleAcceptWarranty = async () => {
        try {
            await dispatch(acceptWarrantyThunk({ bookingWarrantyId, status: 'CONFIRMED' })).unwrap();
            toast.success('Chấp nhận yêu cầu bảo hành thành công');
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi: ${error}`);
        }
    };

    const handleRejectWarranty = () => {
        if (!rejectedReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        dispatch(rejectWarrantyThunk({ bookingWarrantyId, formData: { status: 'DENIED', rejectedReason } }))
            .unwrap()
            .then(() => {
                toast.success('Từ chối yêu cầu bảo hành thành công');
                setRejectedReason('');
                if (onWarrantyUpdated) onWarrantyUpdated();
                setShowRejectModal(false); // Close the rejection modal after success
            })
            .catch((error) => {
                toast.error(`Lỗi: ${error}`);
            });
    };

    const isExpired = warranty?.expireAt && new Date(warranty.expireAt) < new Date() && warranty?.status === 'PENDING';
    const warrantyStatusText = isExpired ? 'HẾT HẠN' : statusConfig.text;

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setShowImageModal(true);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? (warranty?.images?.length || 0) - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === (warranty?.images?.length || 0) - 1 ? 0 : prev + 1));
    };
    // Add this helper function at the top of your component, before the return statement:
    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return 'bx-time';
            case 'CONFIRMED': return 'bx-check-circle';
            case 'DENIED': return 'bx-x-circle';
            case 'COMPLETED': return 'bx-badge-check';
            default: return 'bx-info-circle';
        }
    };
    const styles = {
        sidebar: {
            width: '100%',
        },
        sidebarCard: {
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            marginBottom: '20px',
        },
        warrantyTextarea: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666',
            resize: 'vertical',
            background: '#f8f9fa',
            minHeight: '80px',
        },
        sidebarHead: {
            padding: '15px 20px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8f9fa',
        },
        sidebarHeadH5: {
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#333',
        },
        sidebarBody: {
            padding: '20px',
        },
        loadingText: {
            color: '#007bff',
            fontStyle: 'italic',
            fontSize: '1rem',
        },
        errorText: {
            color: '#dc3545',
            fontSize: '1rem',
        },
        vehicleRates: {
            margin: 0,
            padding: 0,
        },
        vehicleRatesLi: {
            listStyle: 'none',
            marginBottom: '15px',
        },
        vehicleRatesH6: {
            margin: 0,
            fontSize: '1rem',
            color: '#495057',
        },
        vehicleRatesSpan: {
            fontWeight: 600,
            color: '#343a40',
        },
        modalLink: {
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: 500,
            cursor: 'pointer',
        },
        modalLinkHover: {
            textDecoration: 'underline',
        },
        modalContent: {
            borderRadius: '12px',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
            border: 'none',
            background: '#fff',
        },
        modalHeader: {
            background: 'linear-gradient(135deg, #090909 0%, #181818 100%)',
            color: '#fff',
            padding: '16px 24px',

            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: '1.6rem',
            fontWeight: 600,
            margin: 0,
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.6rem',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
        },
        closeBtnHover: {
            color: '#f8f9fa',
        },
        modalBody: {
            padding: '24px 30px',
            background: '#f8f9fa',
        },
        warrantyDetailsList: {
            listStyle: 'none',
            padding: 0,
            margin: '0 0 20px 0',
        },

        warrantyDetailsItem: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderBottom: '1px solid #e9ecef',
            fontSize: '1.05rem',
        },
        detailLabel: {
            fontWeight: 600,
            color: '#343a40',
            flex: '0 0 40%',
        },
        detailValue: {
            color: '#495057',
            flex: '0 0 58%',
            wordBreak: 'break-word',
        },
        imageGallery: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
        },
        warrantyImage: {
            maxWidth: '100%',
            objectFit: 'cover',
            borderRadius: '5px',
            border: '1px solid #dee2e6',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
        },
        warrantyImageHover: {
            transform: 'scale(1.1)',
        },
        statusBadge: {
            padding: '6px 14px',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 500,
        },
        textareaGroup: {
            marginTop: '24px',
        },
        textareaLabel: {
            fontSize: '1.1rem',
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
        btnGroup: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px',
            marginTop: '20px',
        },

        imageGalleryContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
        },

        featuredImageContainer: {
            position: 'relative',
            width: '100%',
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },

        featuredImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
        },

        featuredImageHover: {
            transform: 'scale(1.05)',
        },

        imageCounter: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
        },

        thumbnailGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
        },

        thumbnailContainer: {
            position: 'relative',
            width: '100%',
            height: '60px',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'border-color 0.2s ease',
        },

        thumbnailContainerHover: {
            borderColor: '#007bff',
        },

        thumbnailImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.2s ease',
        },

        thumbnailImageHover: {
            opacity: '0.8',
        },

        moreImagesOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600',
        },

        viewAllImagesBtn: {
            backgroundColor: 'transparent',
            border: '1px solid #007bff',
            color: '#007bff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
        },

        viewAllImagesBtnHover: {
            backgroundColor: '#007bff',
            color: '#fff',
        },


        imageModalImage: {
            maxWidth: '100%',
            maxHeight: '60vh',
            objectFit: 'contain',
            borderRadius: '8px',
        },
        imageModalNavBtn: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            border: 'none',
            padding: '10px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        imageModalNavBtnHover: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        imageModalNavBtnPrev: {
            left: '10px',
        },
        imageModalNavBtnNext: {
            right: '10px',
        },
        warrantyDetailsContainer: {
            padding: '10px 0',
        },
        detailCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            marginBottom: '16px',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        detailCardHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            borderColor: '#007bff',
        },
        detailCardHeader: {
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#495057',
        },
        detailCardBody: {
            padding: '16px',
        },
        orderCodeLink: {
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#007bff',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease',
        },
        detailValue: {
            fontSize: '1rem',
            color: '#343a40',
            fontWeight: '500',
        },
        statusBadgeEnhanced: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        statusContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        reportedIssuePreview: {
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            fontSize: '0.95rem',
            color: '#495057',
            lineHeight: '1.4',
        },
        btnViewDetails: {
            backgroundColor: 'transparent',
            border: '1px solid #FFA633',
            color: '#007bff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
        },
        btnViewDetailsHover: {
            backgroundColor: '#FFA633',
            color: '#fff',
        },
        warrantyProgressCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            padding: '20px',
            marginTop: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        progressHeader: {
            marginBottom: '20px',
        },
        progressTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#343a40',
        },
        progressSteps: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
        },
        progressStep: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            position: 'relative',
        },
        stepIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e9ecef',
            border: '2px solid #dee2e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
            fontSize: '1.2rem',
            color: '#6c757d',
            transition: 'all 0.3s ease',
        },
        stepIconCompleted: {
            backgroundColor: '#28a745',
            borderColor: '#28a745',
            color: '#fff',
        },
        stepIconRejected: {
            backgroundColor: '#dc3545',
            borderColor: '#dc3545',
            color: '#fff',
        },
        stepLabel: {
            fontSize: '0.85rem',
            color: '#6c757d',
            fontWeight: '500',
            textAlign: 'center',
        },
        stepLabelCompleted: {
            color: '#28a745',
            fontWeight: '600',
        },
        stepLabelRejected: {
            color: '#dc3545',
            fontWeight: '600',
        },

    };

    return (
        <>

            <div style={styles.sidebar} className="booking-sidebar">
                <div style={styles.sidebarCard} className="booking-sidebar-card">
                    <div style={styles.sidebarHead} className="booking-sidebar-head">
                        <h5 style={styles.sidebarHeadH5}>Chi tiết bảo hành</h5>
                    </div>
                    <div style={styles.sidebarBody} className="booking-sidebar-body">
                        {loading && <p style={styles.loadingText} className="custom-loading-text">Đang tải...</p>}
                        {!loading && !error && warranty && (
                            <div className="warranty-details-container">
                                {/* Order Code Card */}
                                <div className="detail-card mb-3">
                                    <div className="detail-card-header">
                                        <i className="bx bx-receipt me-2"></i>
                                        <span className="detail-label">Mã đơn hàng</span>
                                    </div>
                                    <div className="detail-card-body">

                                        {warranty.bookingId?.bookingCode || 'Không có dữ liệu'}
                                        <span>
                                            <Button
                                                style={{ marginLeft: '5%' }}
                                                variant="primary" // or any Bootstrap variant like "outline-secondary", "danger", etc.
                                                onClick={() => setShowWarrantyModal(true)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </span>
                                    </div>



                                </div>

                                {/* Request Date Card */}
                                <div className="detail-card mb-3">
                                    <div className="detail-card-header">
                                        <i className="bx bx-calendar me-2"></i>
                                        <span className="detail-label">Ngày yêu cầu</span>
                                    </div>
                                    <div className="detail-card-body">
                                        <span className="detail-value">
                                            {formatDateOnly(warranty.requestDate) || 'Không có dữ liệu'}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="detail-card status-card">
                                    <div className="detail-card-header">
                                        <i className="bx bx-info-circle me-2"></i>
                                        <span className="detail-label">Trạng thái</span>
                                    </div>
                                    <div className="detail-card-body">
                                        <div className="status-container">
                                            <span style={{color:'white'}} className={`status-badge-enhanced ${statusConfig.className}`}>
                                                <i className={`bx ${getStatusIcon(warranty?.status)} me-2`}></i>
                                                {warrantyStatusText}
                                            </span>
                                            {isExpired && (
                                                <small className="text-muted d-block mt-1">
                                                    <i className="bx bx-time me-1"></i>
                                                    Yêu cầu đã hết hạn
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Cards */}
                                {warranty.bookingId?.serviceId?.serviceName && (
                                    <div className="detail-card mb-3">
                                        <div className="detail-card-header">
                                            <i className="bx bx-wrench me-2"></i>
                                            <span className="detail-label">Dịch vụ</span>
                                        </div>
                                        <div className="detail-card-body">
                                            <span className="detail-value">
                                                {warranty.bookingId.serviceId.serviceName}
                                            </span>
                                        </div>
                                    </div>
                                )}



                                {/* Progress Indicator */}

                            </div>
                        )}


                    </div>
                </div>

                {/* Warranty Details Modal */}
                <Modal
                    show={showWarrantyModal}
                    onHide={() => {
                        setShowWarrantyModal(false);
                        setRejectedReason('');
                    }}
                    centered
                    size="lg"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header style={styles.modalHeader}>
                        <Modal.Title style={styles.modalTitle}>Chi tiết bảo hành</Modal.Title>
                        <button
                            style={styles.closeBtn}
                            onClick={() => {
                                setShowWarrantyModal(false);
                                setRejectedReason('');
                            }}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.closeBtnHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.closeBtn)}
                        >
                            <span>×</span>
                        </button>
                    </Modal.Header>
                    <Modal.Body style={styles.modalBody}>
                        {warranty && (
                            <div className="custom-custom-modal-form-group">
                                <ul style={styles.warrantyDetailsList} className="custom-warranty-details-list">
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Mã đơn hàng:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{warranty.bookingId?.bookingCode || 'Không có dữ liệu'}</span>
                                    </li>
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Dịch vụ:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{warranty.bookingId?.serviceId?.serviceName || 'Không có dữ liệu'}</span>
                                    </li>
                                    {warranty.images && warranty.images.length > 0 && (
                                        <li style={styles.warrantyDetailsItem}>
                                            <span style={styles.detailLabel} className="custom-detail-label">Hình ảnh ({warranty.images.length}):</span>
                                            <div style={styles.imageGalleryContainer} className="image-gallery-container">
                                                {/* Main Featured Image */}
                                                <div style={styles.featuredImageContainer} className="featured-image-container">
                                                    <img
                                                        src={warranty.images[0]}
                                                        alt="Featured Evidence"
                                                        style={styles.featuredImage}
                                                        onClick={() => handleImageClick(0)}
                                                        className="featured-image"
                                                    />
                                                    {warranty.images.length > 1 && (
                                                        <div style={styles.imageCounter} className="image-counter">
                                                            <i className="bx bx-image me-1"></i>
                                                            {warranty.images.length} ảnh
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnail Grid - Only show if more than 1 image */}
                                                {warranty.images.length > 1 && (
                                                    <div style={styles.thumbnailGrid} className="thumbnail-grid">
                                                        {warranty.images.slice(1, warranty.images.length > 4 ? 4 : warranty.images.length).map((image, index) => (
                                                            <div
                                                                key={index + 1}
                                                                style={styles.thumbnailContainer}
                                                                className="thumbnail-container"
                                                                onClick={() => handleImageClick(index + 1)}
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`Thumbnail ${index + 2}`}
                                                                    style={styles.thumbnailImage}
                                                                    className="thumbnail-image"
                                                                />
                                                                {/* Show "+X more" overlay on last thumbnail if there are more than 4 images */}
                                                                {index === 2 && warranty.images.length > 4 && (
                                                                    <div style={styles.moreImagesOverlay} className="more-images-overlay">
                                                                        <span>+{warranty.images.length - 4}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* View All Button */}

                                                <Button
                                                    style={{ marginLeft: '5%' }}
                                                    variant="primary" // or any Bootstrap variant like "outline-secondary", "danger", etc.
                                                    onClick={() => handleImageClick(0)}
                                                >
                                                    <i className="bx bx-expand me-2"></i>
                                                    Xem tất cả ảnh
                                                </Button>
                                            </div>
                                        </li>
                                    )}
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{displayName}</span>
                                    </li>
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Ngày đặt dịch vụ:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{formatDateOnly(warranty.bookingId?.schedule?.startTime) || 'Không có dữ liệu'}</span>
                                    </li>
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Ngày yêu cầu bảo hành:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{formatDateOnly(warranty.requestDate) || 'Không có dữ liệu'}</span>
                                    </li>
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Trạng thái:</span>
                                        <span style={{ ...styles.statusBadge, marginRight: '45%',color:'white' }} className={`status-badge ${statusConfig.className}`}>
                                            {warrantyStatusText}
                                        </span>
                                    </li>
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Mô tả của khách:
                                            <i
                                                className="bx bx-info-circle"
                                                style={{ marginLeft: '5px', cursor: 'pointer', color: '#ff6200' }}
                                                onClick={() => {
                                                    setExpandedNotes2(
                                                        prev => ({
                                                            ...prev,
                                                            [warranty.reportedIssue]: !prev[warranty.reportedIssue]
                                                        })
                                                    );
                                                }}
                                            ></i></span>
                                    </li>
                                    <li>
                                        {expandedNotes2 && expandedNotes2[warranty.reportedIssue] && (
                                            <textarea
                                                style={styles.warrantyTextarea}
                                                value={warranty.reportedIssue || 'Không có dữ liệu'}
                                                readOnly
                                                rows="4"
                                            />
                                        )}
                                    </li>
                                </ul>

                                {warranty.status === 'DENIED' && warranty.rejectedReason && (
                                    <li style={styles.warrantyDetailsItem}>
                                        <span style={styles.detailLabel} className="custom-detail-label">Lý do từ chối:</span>
                                        <span style={styles.detailValue} className="custom-detail-value">{warranty.rejectedReason}</span>
                                    </li>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={styles.btnGroup}>
                        {isTechnician && warranty?.status === 'PENDING' && (
                            <>
                                <Button
                                    onClick={handleAcceptWarranty}
                                    disabled={loading || isExpired}
                                    title={isExpired ? 'Không thể chấp nhận vì đã hết hạn' : ''}
                                >
                                    {loading ? 'Xử lý...' : 'Chấp nhận bảo hành'}
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={loading}
                                >
                                    {loading ? 'Xử lý...' : 'Từ chối bảo hành'}
                                </Button>
                            </>
                        )}

                    </Modal.Footer>
                </Modal>

                {/* Image Viewer Modal */}
                <Modal
                    show={showImageModal}
                    onHide={() => setShowImageModal(false)}
                    centered
                    size="lg"
                    backdrop="static"
                    keyboard={true}
                >
                    <Modal.Header style={styles.modalHeader}>
                        <Modal.Title ></Modal.Title>
                        <button
                            style={styles.closeBtn}
                            onClick={() => setShowImageModal(false)}

                        >
                            <span>×</span>
                        </button>
                    </Modal.Header>
                    <Modal.Body style={{ ...styles.modalBody, position: 'relative' }}>
                        {warranty?.images && warranty.images.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                <img
                                    src={warranty.images[selectedImageIndex]}
                                    alt={`Evidence ${selectedImageIndex + 1}`}
                                    style={styles.imageModalImage}
                                />
                                {warranty.images.length >= 1 && (
                                    <>
                                        <button
                                            style={{ ...styles.imageModalNavBtn, ...styles.imageModalNavBtnPrev }}
                                            onClick={handlePrevImage}
                                            onMouseOver={(e) => Object.assign(e.target.style, styles.imageModalNavBtnHover)}
                                            onMouseOut={(e) => Object.assign(e.target.style, styles.imageModalNavBtn)}
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            style={{ ...styles.imageModalNavBtn, ...styles.imageModalNavBtnNext }}
                                            onClick={handleNextImage}
                                            onMouseOver={(e) => Object.assign(e.target.style, styles.imageModalNavBtnHover)}
                                            onMouseOut={(e) => Object.assign(e.target.style, styles.imageModalNavBtn)}
                                        >
                                            &gt;
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
                <Modal
                    show={showRejectModal}
                    onHide={() => {
                        setShowRejectModal(false);
                        setRejectedReason('');
                    }}
                    centered
                    size="md"
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header style={styles.modalHeader}>
                        <Modal.Title style={styles.modalTitle}>Từ chối bảo hành</Modal.Title>
                        <button
                            style={styles.closeBtn}
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectedReason('');
                            }}

                        >
                            <span>×</span>
                        </button>
                    </Modal.Header>
                    <Modal.Body style={styles.modalBody}>
                        <div style={styles.textareaGroup} className="custom-custom-textarea-group">
                            <label style={styles.textareaLabel} className="custom-textarea-label">Lý do từ chối:</label>
                            <textarea
                                style={styles.textarea}
                                className="custom-custom-textarea"
                                placeholder="Nhập lý do từ chối (bắt buộc nếu từ chối)"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.textareaFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
                                rows="4"
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={styles.btnGroup}>
                        <Button
                            className="custom-custom-btn custom-custom-btn-danger"
                            onClick={handleRejectWarranty}
                            disabled={loading}

                        >
                            {loading ? 'Xử lý...' : 'Xác nhận từ chối'}
                        </Button>
                        <Button
                            className="custom-custom-btn custom-custom-btn-secondary"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectedReason('');
                            }}

                        >
                            Hủy
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default BookingWarrantyDetails;