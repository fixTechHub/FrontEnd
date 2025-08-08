import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "./common/BookingDetails";
import BookingWizard from "./common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";
import { useBookingParams } from "../../hooks/useBookingParams";
import { checkBookingAccess } from "../../hooks/checkBookingAccess";
import { useDispatch, useSelector } from "react-redux";
import { onBookingStatusUpdate } from "../../services/socket";
import { onAdditionalItemsAdded, onAdditionalItemsStatusUpdate, onAdditionalItemsAccepted, onAdditionalItemsRejected } from "../../services/socket";
import { confirmJobDoneByTechnician } from '../../features/bookings/bookingAPI';
import { fetchBookingById, customerAcceptQuoteThunk, customerRejectQuoteThunk, technicianSendQuoteThunk } from "../../features/bookings/bookingSlice";
import { BOOKING_STATUS } from "../../constants/bookingConstants";
import { Modal, Button } from "react-bootstrap";
import { FaSpinner } from "react-icons/fa";

function BookingProcessing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { user } = useSelector((state) => state.auth);
    const { booking, status: bookingStatusState } = useSelector((state) => state.booking);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);

    const [technicianServicePrice, setTechnicianServicePrice] = useState(null);
    const [selectedLaborPrice, setSelectedLaborPrice] = useState(0);
    const [selectedWarrantyDuration, setSelectedWarrantyDuration] = useState(0);
    const [items, setItems] = useState([]);
    const [modalItem, setModalItem] = useState({
        name: '',
        price: 0,
        quantity: 1,
        note: ''
    });
    const [editIndex, setEditIndex] = useState(null);
    const [additionalReason, setAdditionalReason] = useState('');
    const [sending, setSending] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const lastCancelBy = useSelector((state) => state.booking.lastCancelBy);
    const [showAdditionalPopup, setShowAdditionalPopup] = useState(false);

    // Load thông tin technician service khi booking thay đổi
    useEffect(() => {
        if (booking?.technicianId && booking?.serviceId) {
            // Lấy giá từ TechnicianService
            if (booking.technicianService) {
                setTechnicianServicePrice(booking.technicianService.price);
                setSelectedLaborPrice(booking.technicianService.price);
                setSelectedWarrantyDuration(booking.technicianService.warrantyDuration || 0);
            }

            // Nếu đã có quote, lấy thông tin từ quote để set giá công và warranty
            if (booking.quote) {
                setSelectedLaborPrice(booking.quote.laborPrice || 0);
                setSelectedWarrantyDuration(booking.quote.warrantiesDuration || 0);
            } else {
                // Nếu chưa có quote, reset về giá trị mặc định
                setSelectedLaborPrice(0);
                setSelectedWarrantyDuration(0);
            }
        }
    }, [booking]);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingId || !user?._id) {
                setIsAuthorized(false);
                setIsChecking(true);
                return;
            }

            const { isAuthorized, error } = await checkBookingAccess(
                dispatch,
                bookingId,
                user._id,
                user.role.name);

            setIsAuthorized(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
        };

        verifyAccess();
    }, [dispatch, bookingId, user?._id]);

    useEffect(() => {
        if (isChecking) return;

        if (isChecking && isAuthorized === false) {
            toast.error("Bạn không có quyền truy cập trang này.");
            // Redirect to the original page or default to '/'
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthorized, isChecking, navigate]);

    useEffect(() => {
        const unsubscribe = onBookingStatusUpdate((data) => {
            if (data.bookingId === bookingId && data.status === 'CANCELLED') {
                if (lastCancelBy === user._id) return;
                setShowCancelModal(true);
            }
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });
        return unsubscribe;
    }, [bookingId, dispatch, user._id, lastCancelBy]);

    // Socket listeners cho thiết bị phát sinh
    useEffect(() => {
        if (!bookingId) return;

        // Lắng nghe khi thợ thêm thiết bị phát sinh
        const unsubscribeAdded = onAdditionalItemsAdded((data) => {
            console.log('Additional items added:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi có cập nhật trạng thái thiết bị phát sinh
        const unsubscribeStatusUpdate = onAdditionalItemsStatusUpdate((data) => {
            console.log('Additional items status update:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi user chấp nhận thiết bị phát sinh
        const unsubscribeAccepted = onAdditionalItemsAccepted((data) => {
            console.log('Additional items accepted:', data);
            if (data.bookingId === bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        });

        // Lắng nghe khi user từ chối thiết bị phát sinh
        const unsubscribeRejected = onAdditionalItemsRejected((data) => {
            console.log('Additional items rejected:', data);
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

    const handleComfirm = () => {
        if (!bookingId) {
            alert("Thiếu thông tin booking hoặc kỹ thuật viên!");
            return;
        }

        navigate(`/checkout?bookingId=${bookingId}`);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (modalItem.name.trim() === '' || !modalItem.price || !modalItem.quantity) return;

        const newItem = {
            ...modalItem,
            price: Number(modalItem.price),
            quantity: Number(modalItem.quantity)
        };

        if (editIndex !== null) {
            const updatedItems = [...items];
            updatedItems[editIndex] = newItem;
            setItems(updatedItems);
            setEditIndex(null);
        } else {
            setItems([...items, newItem]);
        }

        setModalItem({
            name: '',
            price: 0,
            quantity: 1,
            note: ''
        });

        const modal = document.getElementById('add_card');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    };

    const handleEdit = (idx) => {
        setModalItem(items[idx]);
        setEditIndex(idx);

        const modal = document.getElementById('add_card');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    };

    const handleDelete = (idx) => {
        if (window.confirm('Bạn có chắc muốn xóa hạng mục này?')) {
            const updatedItems = items.filter((_, index) => index !== idx);
            setItems(updatedItems);
        }
    };

    const handleComfirmByTechnician = async () => {
        if (!bookingId) {
            alert('Thiếu thông tin booking!');
            return;
        }
        try {
            const res = await confirmJobDoneByTechnician(bookingId);
            if (res?.data?.success) {
                alert('Đã xác nhận hoàn thành! Bạn sẽ được chuyển đến trang xác nhận.');
                navigate(`/technician-income/${bookingId}`);
            } else {
                alert(
                    // 'Xác nhận hoàn thành thất bại: ' + 
                    (res?.data?.message || 'Lỗi không xác định'));
            }
        } catch (err) {
            alert(
                // 'Xác nhận hoàn thành thất bại: ' +
                (err?.response?.data?.message || err.message));
        }
    };

    const handleSendAdditional = async () => {
        if (!bookingId) {
            alert('Không tìm thấy booking!');
            return;
        }

        // Kiểm tra có items không trước khi gửi
        if (items.length === 0) {
            alert('Vui lòng thêm ít nhất một thiết bị phát sinh trước khi gửi yêu cầu!');
            return;
        }

        setSending(true);
        try {
            const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Lấy giá công và thời gian bảo hành từ TechnicianService (đã có sẵn)
            const laborPrice = booking.technicianService?.price || 0;
            const warrantyDuration = booking.technicianService?.warrantyDuration || 0;

            // Đảm bảo sử dụng giá trị từ TechnicianService thay vì từ quote cũ
            // Lưu ý: warrantyDuration có thể là 0, nhưng backend sẽ fallback về 1 nếu không có giá trị
            const quoteData = {
                laborPrice: laborPrice,
                items: items,
                warrantiesDuration: warrantyDuration, // Luôn lấy từ TechnicianService (có thể là 0)
                totalAmount: laborPrice + itemsTotal,
                note: additionalReason || 'Yêu cầu phát sinh thiết bị'
            };

            const resultAction = await dispatch(technicianSendQuoteThunk({ bookingId, quoteData }));
            if (technicianSendQuoteThunk.fulfilled.match(resultAction)) {
                alert('Đã gửi yêu cầu phát sinh cho khách!');
                // Reset form sau khi gửi thành công
                setItems([]);
                setModalItem({
                    name: '',
                    price: 0,
                    quantity: 1,
                    note: ''
                });
                setAdditionalReason('');
                dispatch(fetchBookingById(bookingId));
            } else {
                alert(resultAction.payload || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            alert(error?.message || 'Có lỗi xảy ra!');
        } finally {
            setSending(false);
        }
    };

    const handleAcceptAdditional = async () => {
        const resultAction = await dispatch(customerAcceptQuoteThunk(bookingId));
        if (customerAcceptQuoteThunk.fulfilled.match(resultAction)) {
            alert('Bạn đã đồng ý yêu cầu phát sinh!');
            setShowAdditionalPopup(false);
            dispatch(fetchBookingById(bookingId));
        } else {
            alert(resultAction.payload || 'Có lỗi xảy ra!');
        }
    };

    const handleRejectAdditional = async () => {
        const resultAction = await dispatch(customerRejectQuoteThunk(bookingId));
        if (customerRejectQuoteThunk.fulfilled.match(resultAction)) {
            alert('Bạn đã từ chối yêu cầu phát sinh!');
            setShowAdditionalPopup(false);
            dispatch(fetchBookingById(bookingId));
        } else {
            alert(resultAction.payload || 'Có lỗi xảy ra!');
        }
    };

    const handleShowAdditionalRequest = () => {
        setShowAdditionalPopup(true);
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
        return <div className="d-flex align-items-center justify-content-center">
            <FaSpinner className="me-2 fa-spin" /> Đang tải...
        </div>
    }

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Thông tin chi tiết'} subtitle={'Booking Details'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={3} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-8">
                                <BookingDetails bookingId={bookingId} />

                                {items.length > 0 && (
                                    <div className="booking-processing-items-section">
                                        <div className="booking-processing-items-header">
                                            <div>
                                                <div className="booking-processing-items-title">
                                                    {/* <i className="feather-tool"></i> */}
                                                    Thiết bị phát sinh mới
                                                    <span className="booking-processing-items-count">
                                                        {items.length} hạng mục
                                                    </span>
                                                </div>
                                                {booking?.quote?.items && booking.quote.items.length > 0 && (
                                                    <div className="booking-processing-items-subtitle">
                                                        Sẽ thêm vào danh sách hiện có
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="booking-processing-items-content">
                                            <div className="booking-processing-items-alert">
                                                <i className="feather-info booking-processing-alert-icon"></i>
                                                <div className="booking-processing-alert-text">
                                                    Các thiết bị này sẽ được gửi cho khách xác nhận
                                                </div>
                                            </div>

                                            <div className="booking-processing-items-table">
                                                <table className="table">
                                                    <thead className="booking-processing-table-header">
                                                        <tr>
                                                            <th>Tên thiết bị</th>
                                                            <th>Giá tiền</th>
                                                            <th>Số lượng</th>
                                                            <th>Ghi chú</th>
                                                            <th>Hành động</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.map((item, idx) => (
                                                            <tr key={idx} className="booking-processing-table-row">
                                                                <td className="booking-processing-item-name">
                                                                    {item.name}
                                                                </td>
                                                                <td className="booking-processing-item-price">
                                                                    {item.price.toLocaleString()} VNĐ
                                                                </td>
                                                                <td className="booking-processing-item-quantity">
                                                                    {item.quantity}
                                                                </td>
                                                                <td className="booking-processing-item-note">
                                                                    {item.note || '-'}
                                                                </td>
                                                                <td>
                                                                    <div className="booking-processing-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="booking-processing-btn-edit"
                                                                            onClick={() => handleEdit(idx)}
                                                                            title="Sửa thiết bị"
                                                                        >
                                                                            <i className="feather-edit-2"></i>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="booking-processing-btn-delete"
                                                                            onClick={() => handleDelete(idx)}
                                                                            title="Xóa thiết bị"
                                                                        >
                                                                            <i className="feather-trash-2"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="booking-processing-items-summary">
                                                <div className="booking-processing-summary-label">
                                                    Tổng giá thiết bị mới:
                                                </div>
                                                <div className="booking-processing-summary-value">
                                                    {items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()} VNĐ
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="col-lg-4">
                                {booking?.isChatAllowed && booking?.isVideoCallAllowed ? (
                                    <div style={{ paddingBottom: 10 }}>
                                        <MessageBox bookingId={bookingId} />
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        Bạn không thể nhắn tin hoặc gọi nữa
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-end">
                        {user?.role?.name === 'CUSTOMER' && (
                            <>
                                {booking?.status === BOOKING_STATUS.WAITING_CUSTOMER_CONFIRM_ADDITIONAL && booking?.quote && (
                                    <>
                                        {booking?.quote?.note === 'Yêu cầu xác nhận giá công và thời gian bảo hành' ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleShowAdditionalRequest}
                                            >
                                                <i className="feather-eye me-2" />
                                                Xem đề xuất giá công
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleShowAdditionalRequest}
                                            >
                                                <i className="feather-eye me-2" />
                                                Xem yêu cầu phát sinh
                                            </button>
                                        )}
                                    </>
                                )}

                                {booking.status === 'AWAITING_DONE'
                                    // && booking.status === 'WAITING_CONFIRM'
                                    && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleComfirm}
                                        >
                                            Xác nhận và Thanh toán
                                        </button>
                                    )
                                }

                            </>
                        )}


                        {user?.role?.name === 'TECHNICIAN'
                            && (booking.status === 'IN_PROGRESS' || booking.status === 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL' || booking.status === 'CONFIRM_ADDITIONAL')
                            && (
                                <>
                                    {/* Nút gửi yêu cầu phát sinh - luôn hiển thị cho thợ */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSendAdditional}
                                        disabled={sending}
                                    >
                                        {sending ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                    </button>

                                    {/* Nút thêm thiết bị phát sinh - luôn hiển thị cho thợ */}
                                    <button
                                        style={{ marginLeft: 10 }}
                                        className="btn btn-primary"
                                        data-bs-toggle="modal" data-bs-target="#add_card"
                                    >
                                        Thêm thiết bị phát sinh
                                    </button>

                                    <button
                                        style={{ marginLeft: 10 }}
                                        className="btn btn-primary"
                                        onClick={handleComfirmByTechnician}
                                    >
                                        Xác nhận hoàn thành
                                    </button>
                                </>
                            )}
                    </div>

                </div>

            </div>

            <div className="modal new-modal fade" id="add_card" tabIndex="-1" data-bs-keyboard="false" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered modal-md" style={{ maxWidth: '700px' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">
                                {editIndex !== null ? 'Sửa thiết bị' : 'Chi tiết đơn giá'}
                            </h4>
                            <button type="button" className="close-btn" data-bs-dismiss="modal" aria-label="Close">
                                <span>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddItem}>
                                <div className="modal-form-group">
                                    <label>
                                        Tên thiết bị <span className="text-danger">*</span>
                                    </label>
                                    <input type="text" className="form-control"
                                        placeholder="Nhập tên thiết bị"
                                        value={modalItem.name}
                                        onChange={e => setModalItem({ ...modalItem, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="modal-form-group">
                                            <label>
                                                Số lượng <span className="text-danger">*</span>
                                            </label>
                                            <div className="form-icon">
                                                <input type="number" className="form-control"
                                                    value={modalItem.quantity}
                                                    onChange={e => setModalItem({ ...modalItem, quantity: e.target.value })}
                                                    min={1}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="modal-form-group">
                                            <label>
                                                Giá <span className="text-danger">*</span>
                                            </label>
                                            <div className="form-icon">
                                                <input type="number" className="form-control"
                                                    value={modalItem.price}
                                                    onChange={e => setModalItem({ ...modalItem, price: e.target.value })}
                                                    min={0}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>
                                        Ghi chú
                                    </label>
                                    <input type="text" className="form-control"
                                        placeholder="Nhập ghi chú (không bắt buộc)"
                                        value={modalItem.note}
                                        onChange={e => setModalItem({ ...modalItem, note: e.target.value })}
                                    />
                                </div>

                                {/* Thông báo giá công đã chọn */}
                                {/* {user?.role?.name === 'TECHNICIAN' && selectedLaborPrice > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Giá công:</strong> {selectedLaborPrice.toLocaleString()} VNĐ
                                    </div>
                                )} */}

                                {/* Thông báo thời gian bảo hành đã chọn */}
                                {/* {user?.role?.name === 'TECHNICIAN' && selectedWarrantyDuration > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Thời gian bảo hành đã chọn:</strong> {selectedWarrantyDuration} tháng
                                    </div>
                                )} */}

                                {/* Thông báo cho dịch vụ */}
                                {/* {user?.role?.name === 'TECHNICIAN' && booking?.technicianService && (
                                    <div className="alert alert-success">
                                        <strong>Thông báo:</strong> Giá công ({booking.technicianService.price?.toLocaleString()} VNĐ) và thời gian bảo hành ({booking.technicianService.warrantyDuration || 0} tháng) sẽ được tự động lấy từ cấu hình dịch vụ của bạn
                                    </div>
                                )} */}

                                {/* Thông báo về tích lũy yêu cầu phát sinh */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.quote?.items && booking.quote.items.length > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Lưu ý:</strong> Thiết bị mới sẽ được thêm vào danh sách hiện có. Chỉ những thiết bị được chấp nhận mới được tính vào tổng tiền.
                                    </div>
                                )}

                                <div className="modal-btn">
                                    <button type="submit" className="btn btn-secondary w-100">
                                        {editIndex !== null ? 'Lưu thay đổi' : 'Xác nhận'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {showCancelModal && (
                <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Đơn đã bị huỷ</h5>
                            </div>
                            <div className="modal-body">
                                <p>Đơn hàng này đã bị huỷ. Bạn sẽ được chuyển về trang chủ.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => navigate('/')}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup cho khách xác nhận yêu cầu phát sinh */}
            {user?.role?.name === 'CUSTOMER' && booking?.status === BOOKING_STATUS.WAITING_CUSTOMER_CONFIRM_ADDITIONAL && booking?.quote && showAdditionalPopup && (
                <Modal show={showAdditionalPopup} onHide={() => setShowAdditionalPopup(false)} className="booking-processing-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className="feather-info"></i>
                            Yêu cầu phát sinh từ kỹ thuật viên
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="booking-processing-modal-content">
                            {booking.quote.items && booking.quote.items.filter(item => item.status === 'PENDING').length > 0 ? (
                                <div className="booking-processing-items-list">
                                    <div className="booking-processing-items-list-header">
                                        <i className="feather-tool"></i>
                                        Thiết bị phát sinh mới
                                    </div>
                                    <div className="booking-processing-items-list-content">
                                        {booking.quote.items
                                            .filter(item => item.status === 'PENDING')
                                            .map((item, idx) => (
                                                <div key={idx} className="booking-processing-item-row">
                                                    <div className="booking-processing-item-info">
                                                        <div className="booking-processing-item-name">
                                                            {item.name}
                                                        </div>
                                                        <div className="booking-processing-item-details">
                                                            Số lượng: {item.quantity}
                                                            {item.note && ` • ${item.note}`}
                                                        </div>
                                                    </div>
                                                    <div className="booking-processing-item-price">
                                                        {(item.price * item.quantity).toLocaleString()} VNĐ
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="booking-processing-note-section">
                                    <div className="booking-processing-note-header">
                                        <i className="feather-alert-triangle"></i>
                                        Thông báo
                                    </div>
                                    <div className="booking-processing-note-content">
                                        Không có thiết bị mới nào đang chờ xác nhận.
                                    </div>
                                </div>
                            )}

                            {/* Tính tổng và breakdown */}
                            {(() => {
                                const pendingItems = booking.quote.items.filter(item => item.status === 'PENDING');

                                if (pendingItems.length > 0) {
                                    const acceptedItemsTotal = booking.quote.items
                                        .filter(item => item.status === 'ACCEPTED')
                                        .reduce((total, item) => total + (item.price * item.quantity), 0);

                                    const pendingItemsTotal = pendingItems
                                        .reduce((total, item) => total + (item.price * item.quantity), 0);

                                    // Lấy giá công từ TechnicianService (đã có sẵn từ trước)
                                    // Lưu ý: booking.quote.warrantiesDuration có thể khác với booking.technicianService.warrantyDuration
                                    // do quote được tạo trước đó với logic cũ. Luôn sử dụng TechnicianService để đảm bảo tính nhất quán.
                                    const laborPrice = booking.technicianService?.price || 0;
                                    const totalAmount = laborPrice + acceptedItemsTotal + pendingItemsTotal;

                                    return (
                                        <div className="booking-processing-summary-section">
                                            <div className="booking-processing-summary-header">
                                                <div className="booking-processing-summary-label">
                                                    Tổng cộng
                                                </div>
                                                <div className="booking-processing-summary-value">
                                                    {totalAmount.toLocaleString()} VNĐ
                                                </div>
                                            </div>

                                            <div className="booking-processing-summary-breakdown">
                                                <div className="booking-processing-breakdown-item">
                                                    <span className="booking-processing-breakdown-label">Giá công (từ cấu hình dịch vụ)</span>
                                                    <span className="booking-processing-breakdown-value">
                                                        {laborPrice.toLocaleString()} VNĐ
                                                    </span>
                                                </div>
                                                {acceptedItemsTotal > 0 && (
                                                    <div className="booking-processing-breakdown-item">
                                                        <span className="booking-processing-breakdown-label">Thiết bị đã chấp nhận</span>
                                                        <span className="booking-processing-breakdown-value">
                                                            {acceptedItemsTotal.toLocaleString()} VNĐ
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="booking-processing-breakdown-item">
                                                    <span className="booking-processing-breakdown-label">Thiết bị mới</span>
                                                    <span className="booking-processing-breakdown-value">
                                                        {pendingItemsTotal.toLocaleString()} VNĐ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })()}

                            {/* Thông tin giá công và thời gian bảo hành từ cấu hình dịch vụ */}
                            {/* <div className="booking-processing-note-section">
                                <div className="booking-processing-note-header">
                                    <i className="feather-info"></i>
                                    Thông tin dịch vụ
                                </div>
                                <div className="booking-processing-note-content">
                                    <strong>Giá công:</strong> {(booking.technicianService?.price || 0).toLocaleString()} VNĐ
                                    <br />
                                    <strong>Thời gian bảo hành:</strong> {(booking.technicianService?.warrantyDuration || 0)} tháng
                                    <br />
                                    <em>(Thông tin này được lấy từ cấu hình dịch vụ của thợ, không phụ thuộc vào quote cũ)</em>
                                </div>
                            </div> */}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="booking-processing-btn-accept" onClick={handleAcceptAdditional}>
                            <i className="feather-check me-2"></i>
                            Đồng ý
                        </Button>
                        <Button className="booking-processing-btn-reject" onClick={handleRejectAdditional}>
                            <i className="feather-x me-2"></i>
                            Từ chối
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}

export default BookingProcessing;