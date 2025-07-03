import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWarrantyInformationThunk, acceptWarrantyThunk, rejectWarrantyThunk } from "../../features/booking-warranty/warrantySlice";
import { formatDate } from "../../utils/formatDate";
import { BOOKING_WARRANTY_STATUS_CONFIG } from "../../constants/bookingConstants";
import { toast } from 'react-toastify';

function BookingWarrantyDetails({ bookingWarrantyId, onWarrantyUpdated }) {
    const dispatch = useDispatch();
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const { user } = useSelector((state) => state.auth);
    const [rejectedReason, setRejectedReason] = useState('');

    useEffect(() => {
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    }, [dispatch, bookingWarrantyId]);

    const statusConfig = BOOKING_WARRANTY_STATUS_CONFIG[warranty?.status] || BOOKING_WARRANTY_STATUS_CONFIG.default;

    const isCustomer = user?.role?.name === 'CUSTOMER';
    const isTechnician = user?.role?.name === 'TECHNICIAN';
    const displayName = isCustomer
        ? warranty?.technicianId?.fullName || 'Không có dữ liệu'
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

    return (
        <>
            <div className="booking-sidebar">
                <div className="booking-sidebar-card">
                    <div className="booking-sidebar-head">
                        <h5>Chi tiết bảo hành</h5>
                    </div>
                    <div className="booking-sidebar-body">
                        {loading && <p className="custom-loading-text">Đang tải...</p>}
                        {error && <p className="text-danger">Lỗi: {error}</p>}
                        {!loading && !error && warranty && (
                            <div className="booking-vehicle-rates">
                                <ul>
                                    <li>
                                        <h6>
                                            <span>Mã đơn hàng:</span>{' '}
                                            <a
                                                href="#warranty_details_modal"
                                                data-bs-toggle="modal"
                                                data-bs-target="#warranty_details_modal"
                                                className="custom-modal-link"
                                            >
                                                {warranty.bookingId?.bookingCode || 'Không có dữ liệu'}
                                            </a>
                                        </h6>
                                    </li>
                                    <li>
                                        <h6>
                                            <span>Ngày yêu cầu:</span> {formatDate(warranty.requestDate) || 'Không có dữ liệu'}
                                        </h6>
                                    </li>
                                    <li>
                                        <h6>
                                            <span>Trạng thái:</span>
                                            <span className={`status-badge ${statusConfig.className}`}>
                                                {statusConfig.text}
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
                    className="modal new-modal fade custom-custom-warranty-modal"
                    id="warranty_details_modal"
                    data-bs-keyboard="false"
                    data-bs-backdrop="static"
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content custom-custom-modal-content">
                            <div className="modal-header custom-custom-modal-header">
                                <h4 className="modal-title">Chi tiết bảo hành</h4>
                                <button
                                    type="button"
                                    className="custom-custom-close-btn"
                                    data-bs-dismiss="modal"
                                    onClick={() => setRejectedReason('')}
                                >
                                    <span>×</span>
                                </button>
                            </div>
                            <div className="modal-body custom-custom-modal-body">
                                {warranty && (
                                    <div className="custom-custom-modal-form-group">
                                        <ul className="custom-warranty-details-list">
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Mã đơn hàng:</span>
                                                <span className="custom-detail-value">{warranty.bookingId?.bookingCode || 'Không có dữ liệu'}</span>
                                            </li>
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}:</span>
                                                <span className="custom-detail-value">{displayName}</span>
                                            </li>
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Lý do bảo hành:</span>
                                                <span className="custom-detail-value">{warranty.reportedIssue || 'Không có dữ liệu'}</span>
                                            </li>
                                            {warranty.status === 'DENIED' && warranty.rejectedReason && (
                                                <li className="custom-warranty-details-item">
                                                    <span className="custom-detail-label">Lý do từ chối:</span>
                                                    <span className="custom-detail-value">{warranty.rejectedReason}</span>
                                                </li>
                                            )}
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Ngày yêu cầu:</span>
                                                <span className="custom-detail-value">{formatDate(warranty.requestDate) || 'Không có dữ liệu'}</span>
                                            </li>
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Trạng thái:</span>
                                                <span className={`status-badge ${statusConfig.className}`}>
                                                    {statusConfig.text}
                                                </span>
                                            </li>
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Dịch vụ:</span>
                                                <span className="custom-detail-value">{warranty.bookingId?.serviceId?.serviceName || 'Không có dữ liệu'}</span>
                                            </li>
                                            <li className="custom-warranty-details-item">
                                                <span className="custom-detail-label">Lịch đặt:</span>
                                                <span className="custom-detail-value">{formatDate(warranty.bookingId?.schedule) || 'Không có dữ liệu'}</span>
                                            </li>
                                        </ul>
                                        {isTechnician && warranty.status === 'PENDING' && (
                                            <div className="custom-custom-textarea-group">
                                                <label className="custom-textarea-label">Lý do từ chối:</label>
                                                <textarea
                                                    className="custom-custom-textarea"
                                                    placeholder="Nhập lý do từ chối (bắt buộc nếu từ chối)"
                                                    value={rejectedReason}
                                                    onChange={(e) => setRejectedReason(e.target.value)}
                                                    rows="4"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="custom-custom-modal-btn-group">
                                    {isTechnician && warranty?.status === 'PENDING' && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn custom-custom-btn custom-custom-btn-primary"
                                                onClick={handleAcceptWarranty}
                                                disabled={loading}
                                            >
                                                {loading ? 'Xử lý...' : 'Chấp nhận bảo hành'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn custom-custom-btn custom-custom-btn-danger"
                                                onClick={handleRejectWarranty}
                                                disabled={loading}
                                            >
                                                {loading ? 'Xử lý...' : 'Từ chối bảo hành'}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className="btn custom-custom-btn custom-custom-btn-secondary"
                                        data-bs-dismiss="modal"
                                        onClick={() => setRejectedReason('')}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for the Modal */}
            <style jsx>{`
                .custom-custom-warranty-modal .modal-dialog {
                    max-width: 600px;
                }

                .custom-custom-modal-content {
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border: none;
                    background: #fff;
                }

                .custom-custom-modal-header {
                    background: linear-gradient(90deg, #007bff, #0056b3);
                    color: #fff;
                    padding: 16px 24px;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .custom-custom-modal-header .modal-title {
                    font-size: 1.5rem;
                    font-weight: 600;
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

                .custom-warranty-details-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .custom-warranty-details-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #e9ecef;
                    font-size: 1rem;
                }

                .custom-warranty-details-item:last-child {
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

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .custom-custom-textarea-group {
                    margin-top: 24px;
                }

                .custom-textarea-label {
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
}

export default BookingWarrantyDetails;