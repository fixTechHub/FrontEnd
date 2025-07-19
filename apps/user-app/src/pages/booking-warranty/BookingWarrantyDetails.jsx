import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWarrantyInformationThunk, acceptWarrantyThunk, rejectWarrantyThunk } from "../../features/booking-warranty/warrantySlice";
import { formatDateOnly, formatDate } from "../../utils/formatDate";
import { BOOKING_WARRANTY_STATUS_CONFIG } from "../../constants/bookingConstants";
import { toast } from 'react-toastify';

function BookingWarrantyDetails({ bookingWarrantyId, onWarrantyUpdated }) {
    const dispatch = useDispatch();
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);
    const [rejectedReason, setRejectedReason] = useState('');
    const [expandedNotes2, setExpandedNotes2] = useState({});
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

    const handleRejectWarranty = async () => {
        if (!rejectedReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            await dispatch(rejectWarrantyThunk({ bookingWarrantyId, formData: { status: 'DENIED', rejectedReason } })).unwrap();
            toast.success('Từ chối yêu cầu bảo hành thành công');
            setRejectedReason('');
            if (onWarrantyUpdated) onWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi: ${error}`);
        }
    };

    const isExpired = warranty?.expireAt && new Date(warranty.expireAt) < new Date() && warranty?.status==='PENDING';
    const warrantyStatusText = isExpired ? 'HẾT HẠN' : statusConfig.text;

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
        },
        modalLinkHover: {
            textDecoration: 'underline',
        },
        modal: {
            display: 'none',
        },
        modalDialog: {
            maxWidth: '700px',
            margin: '1.75rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalContent: {
            borderRadius: '12px',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
            border: 'none',
            background: '#fff',
        },
        modalHeader: {
            background: 'linear-gradient(90deg, #007bff, #0056b3)',
            color: '#fff',
            padding: '16px 24px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
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
        warrantyDetailsItemLast: {
            borderBottom: 'none',
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
            maxWidth: '100px',
            maxHeight: '100px',
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
        btn: {
            padding: '12px 25px',
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '8px',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            border: 'none',
        },
        btnPrimary: {
            backgroundColor: '#007bff',
            color: '#fff',
        },
        btnPrimaryHover: {
            backgroundColor: '#0056b3',
            transform: 'translateY(-1px)',
        },
        btnPrimaryDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed',
        },
        btnDanger: {
            backgroundColor: '#dc3545',
            color: '#fff',
        },
        btnDangerHover: {
            backgroundColor: '#b02a37',
            transform: 'translateY(-1px)',
        },
        btnDangerDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed',
        },
        btnSecondary: {
            backgroundColor: '#6c757d',
            color: '#fff',
        },
        btnSecondaryHover: {
            backgroundColor: '#5a6268',
            transform: 'translateY(-1px)',
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
                        {error && <p style={styles.errorText} className="text-danger">Lỗi: {error}</p>}
                        {!loading && !error && warranty && (
                            <div style={styles.vehicleRates} className="booking-vehicle-rates">
                                <ul>
                                    <li style={styles.vehicleRatesLi}>
                                        <h6 style={styles.vehicleRatesH6}>
                                            <span style={styles.vehicleRatesSpan}>Mã đơn hàng:</span>
                                            {' '}
                                            <a
                                                href="#warranty_details_modal"
                                                data-bs-toggle="modal"
                                                data-bs-target="#warranty_details_modal"
                                                style={styles.modalLink}
                                                onMouseOver={(e) => Object.assign(e.target.style, styles.modalLinkHover)}
                                                onMouseOut={(e) => Object.assign(e.target.style, {})}
                                                className=" custom-modal-link"  
                                            >
                                            {warranty.bookingId?.bookingCode || 'Không có dữ liệu'}

                                            </a>
                                            {' '}
                                            {/* <a
                                                href="#warranty_details_modal"
                                                data-bs-toggle="modal"
                                                data-bs-target="#warranty_details_modal"
                                                style={styles.modalLink}
                                                onMouseOver={(e) => Object.assign(e.target.style, styles.modalLinkHover)}
                                                onMouseOut={(e) => Object.assign(e.target.style, {})}
                                                className="bx bx-info-circle custom-modal-link"  
                                            >
                                               
                                            </a> */}


                                        </h6>
                                    </li>



                                    <li style={styles.vehicleRatesLi}>
                                        <h6 style={styles.vehicleRatesH6}>
                                            <span style={styles.vehicleRatesSpan}>Ngày yêu cầu:</span> {formatDateOnly(warranty.requestDate) || 'Không có dữ liệu'}
                                        </h6>
                                    </li>

                                    <li style={styles.vehicleRatesLi}>
                                        <h6 style={styles.vehicleRatesH6}>
                                            <span style={styles.vehicleRatesSpan}>Trạng thái:</span>
                                            <span style={styles.statusBadge} className={`status-badge ${statusConfig.className}`}>
                                                {warrantyStatusText}
                                            </span>
                                        </h6>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for Warranty and Booking Details */}
                <div
                    style={styles.modal}
                    className="modal new-modal fade custom-custom-warranty-modal"
                    id="warranty_details_modal"
                    data-bs-keyboard="false"
                    data-bs-backdrop="static"
                >
                    <div style={styles.modalDialog} className="modal-dialog modal-dialog-centered modal-lg">
                        <div style={styles.modalContent} className="modal-content custom-custom-modal-content">
                            <div style={styles.modalHeader} className="modal-header custom-custom-modal-header">
                                <h4 style={styles.modalTitle} className="modal-title">Chi tiết bảo hành</h4>
                                <button
                                    type="button"
                                    style={styles.closeBtn}
                                    className="custom-custom-close-btn"
                                    data-bs-dismiss="modal"
                                    onClick={() => setRejectedReason('')}
                                    onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.closeBtnHover)}
                                    onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.closeBtn)}
                                >
                                    <span>×</span>
                                </button>
                            </div>
                            <div style={styles.modalBody} className="modal-body custom-custom-modal-body">
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
                                                    <span style={styles.detailLabel} className="custom-detail-label">Hình ảnh:</span>
                                                    <div style={styles.imageGallery} className="custom-image-gallery">
                                                        {warranty.images.map((image, index) => (
                                                            <img
                                                                key={index}
                                                                src={image}
                                                                alt={`Evidence ${index + 1}`}
                                                                style={styles.warrantyImage}
                                                                onMouseOver={(e) => Object.assign(e.target.style, styles.warrantyImageHover)}
                                                                onMouseOut={(e) => Object.assign(e.target.style, styles.warrantyImage)}
                                                                className="custom-warranty-image"
                                                            />
                                                        ))}
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
                                                <span style={styles.statusBadge} className={`status-badge ${statusConfig.className}`}>
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
                                                {/* <span style={styles.detailValue} className="custom-detail-value">{warranty.reportedIssue || 'Không có dữ liệu'}</span> */}

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
                                        {isTechnician && warranty.status === 'PENDING' && (
                                            <div style={styles.textareaGroup} className="custom-custom-textarea-group">
                                                <label style={styles.textareaLabel} className="custom-textarea-label">Lý do nếu từ chối:</label>
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
                                        )}
                                        {warranty.status === 'DENIED' && warranty.rejectedReason && (
                                            <li style={styles.warrantyDetailsItem}>
                                                <span style={styles.detailLabel} className="custom-detail-label">Lý do từ chối:</span>
                                                <span style={styles.detailValue} className="custom-detail-value">{warranty.rejectedReason}</span>
                                            </li>
                                        )}
                                    </div>
                                )}
                                <div style={styles.btnGroup} className="custom-custom-modal-btn-group">
                                    {isTechnician && warranty?.status === 'PENDING' && (
                                        <>
                                            <button
                                                type="button"
                                                style={isExpired ? { ...styles.btn, ...styles.btnPrimary, ...styles.btnPrimaryDisabled } : { ...styles.btn, ...styles.btnPrimary }}
                                                className="btn custom-custom-btn custom-custom-btn-primary"
                                                onClick={handleAcceptWarranty}
                                                disabled={loading || isExpired}
                                                title={isExpired ? 'Không thể chấp nhận vì đã hết hạn' : ''}
                                            >
                                                {loading ? 'Xử lý...' : 'Chấp nhận bảo hành'}
                                            </button>
                                            <button
                                                type="button"
                                                style={styles.btnDanger}
                                                className="btn custom-custom-btn custom-custom-btn-danger"
                                                onClick={handleRejectWarranty}
                                                disabled={loading}
                                                onMouseOver={(e) => Object.assign(e.target.style, styles.btnDangerHover)}
                                                onMouseOut={(e) => Object.assign(e.target.style, styles.btnDanger)}
                                            >
                                                {loading ? 'Xử lý...' : 'Từ chối bảo hành'}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        style={styles.btnSecondary}
                                        className="btn custom-custom-btn custom-custom-btn-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={() => setRejectedReason('')}
                                        onMouseOver={(e) => Object.assign(e.target.style, styles.btnSecondaryHover)}
                                        onMouseOut={(e) => Object.assign(e.target.style, styles.btnSecondary)}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookingWarrantyDetails;