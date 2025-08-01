import { useEffect, useRef, useState } from "react";
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
import { confirmJobDoneByTechnician } from '../../features/bookings/bookingAPI';
import { Accordion } from "react-bootstrap";
import { fetchBookingById, customerAcceptQuoteThunk, customerRejectQuoteThunk, technicianSendQuoteThunk } from "../../features/bookings/bookingSlice";
import { BOOKING_STATUS } from "../../constants/bookingConstants";
import { Modal, Button } from "react-bootstrap";

function BookingProcessing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { user } = useSelector((state) => state.auth);
    const { booking, status: bookingStatusState } = useSelector((state) => state.booking);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [technicianRates, setTechnicianRates] = useState(null);
    const [technicianServicePrice, setTechnicianServicePrice] = useState(null);
    const [selectedLaborPrice, setSelectedLaborPrice] = useState(0);
    const [selectedWarrantyDuration, setSelectedWarrantyDuration] = useState(30);
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
    const [additionalItems, setAdditionalItems] = useState([]);

    // Load thông tin technician rates khi booking thay đổi
    useEffect(() => {
        if (booking?.technicianId && booking?.serviceId) {
            // Lấy rates từ technician
            if (booking.technicianId.rates) {
                setTechnicianRates(booking.technicianId.rates);
            }

            // Lấy giá từ TechnicianService nếu là dịch vụ FIXED
            if (booking.serviceId.serviceType === 'FIXED') {
                if (booking.technicianService) {
                    setTechnicianServicePrice(booking.technicianService.price);
                    setSelectedLaborPrice(booking.technicianService.price);
                }
            }

            // Nếu đã có quote, lấy thông tin từ quote để set giá công và warranty
            if (booking.quote) {
                setSelectedLaborPrice(booking.quote.laborPrice || 0);
                setSelectedWarrantyDuration(booking.quote.warrantiesDuration || 1);
            } else {
                // Nếu chưa có quote, reset về giá trị mặc định
                setSelectedLaborPrice(0);
                setSelectedWarrantyDuration(1);
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

    const handleSendLaborPriceQuote = async () => {
        if (!bookingId) {
            alert('Không tìm thấy booking!');
            return;
        }

        if (selectedLaborPrice === 0) {
            alert('Vui lòng chọn mức giá công trước!');
            return;
        }

        setSending(true);
        try {
            const quoteData = {
                laborPrice: selectedLaborPrice,
                items: [],
                warrantiesDuration: selectedWarrantyDuration,
                totalAmount: selectedLaborPrice,
                note: 'Yêu cầu xác nhận giá công và thời gian bảo hành'
            };
            
            console.log('--- FRONTEND QUOTE DATA ---', quoteData);
            
            console.log('--- FRONTEND QUOTE DATA ---', quoteData);

            const resultAction = await dispatch(technicianSendQuoteThunk({ bookingId, quoteData }));
            if (technicianSendQuoteThunk.fulfilled.match(resultAction)) {
                alert('Đã gửi yêu cầu xác nhận giá công cho khách!');
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

    const handleSendAdditional = async () => {
        if (!bookingId) {
            alert('Không tìm thấy booking!');
            return;
        }

        // Kiểm tra khác nhau cho FIXED và COMPLEX services
        if (booking?.serviceId?.serviceType === 'COMPLEX' && selectedLaborPrice === 0 && !booking?.quote?.laborPrice) {
            alert('Vui lòng chọn mức giá công trước!');
            return;
        }

        setSending(true);
        try {
            const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Lấy giá công đã chọn hoặc từ quote hiện tại cho FIXED service
            let laborPrice = 0;
            if (booking?.serviceId?.serviceType === 'FIXED') {
                laborPrice = booking.quote?.laborPrice || selectedLaborPrice || 0;
            } else {
                laborPrice = selectedLaborPrice || 0;
            }

            const quoteData = {
                laborPrice: laborPrice,
                items: items,
                warrantiesDuration: selectedWarrantyDuration,
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
        console.log('--- DEBUG POPUP ---');
        console.log('Quote note:', booking?.quote?.note);
        console.log('Quote items:', booking?.quote?.items);
        console.log('Booking status:', booking?.status);
        console.log('Note comparison:', booking?.quote?.note === 'Yêu cầu xác nhận giá công và thời gian bảo hành');
        setShowAdditionalPopup(true);
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
        return <div>Error: {authError}</div>;
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
                            <div className="col-lg-4">
                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg-8">
                                {booking?.isChatAllowed && booking?.isVideoCallAllowed ? (
                                    <div style={{ paddingBottom: 10 }}>
                                        <MessageBox bookingId={bookingId} />
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        You can't chat or call video.
                                    </div>
                                )}

                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'FIXED' && selectedLaborPrice > 0 && (
                                    <div className="alert alert-info mb-3">
                                        <strong>Giá công cố định:</strong> {selectedLaborPrice.toLocaleString()} VNĐ
                                        {booking?.quote && (
                                            <span className="text-muted ms-2">(từ yêu cầu phát sinh trước)</span>
                                        )}
                                    </div>
                                )}

                                {/* Chỉ hiển thị cho COMPLEX service khi thợ đã chấp nhận yêu cầu và chưa có quote */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'COMPLEX' && booking?.status === 'IN_PROGRESS' && !booking?.quote && (
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h5>Chọn mức giá công và thời gian bảo hành</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label className="form-label">Mức giá công</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedLaborPrice}
                                                        onChange={e => setSelectedLaborPrice(Number(e.target.value))}
                                                    >
                                                        <option value={0}>Chọn mức giá công</option>
                                                        {technicianRates?.laborTiers?.tier1 && (
                                                            <option value={technicianRates.laborTiers.tier1}>
                                                                Tier 1 - Cơ bản: {technicianRates.laborTiers.tier1.toLocaleString()} VNĐ
                                                            </option>
                                                        )}
                                                        {technicianRates?.laborTiers?.tier2 && (
                                                            <option value={technicianRates.laborTiers.tier2}>
                                                                Tier 2 - Trung bình: {technicianRates.laborTiers.tier2.toLocaleString()} VNĐ
                                                            </option>
                                                        )}
                                                        {technicianRates?.laborTiers?.tier3 && (
                                                            <option value={technicianRates.laborTiers.tier3}>
                                                                Tier 3 - Cao cấp: {technicianRates.laborTiers.tier3.toLocaleString()} VNĐ
                                                            </option>
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Thời gian bảo hành (tháng)</label>
                                                                                                            <select
                                                            className="form-control"
                                                            value={selectedWarrantyDuration}
                                                            onChange={e => setSelectedWarrantyDuration(Number(e.target.value))}
                                                        >
                                                            <option value={1}>1 tháng</option>
                                                            <option value={3}>3 tháng</option>
                                                            <option value={6}>6 tháng</option>
                                                            <option value={9}>9 tháng</option>
                                                            <option value={12}>12 tháng</option>
                                                        </select>
                                                </div>
                                            </div>
                                            {selectedLaborPrice > 0 && (
                                                <div className="mt-3">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleSendLaborPriceQuote()}
                                                        disabled={sending}
                                                    >
                                                        {sending ? 'Đang gửi...' : 'Gửi yêu cầu xác nhận giá công'}
                                                    </button>
                                                    <small className="text-muted d-block mt-2">
                                                        Gửi yêu cầu xác nhận giá công và thời gian bảo hành cho khách
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hiển thị thông tin cho FIXED service */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'FIXED' && (
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h5>Thông tin dịch vụ cố định</h5>
                                        </div>
                                        <div className="card-body">
                                            {booking?.quote ? (
                                                <div className="alert alert-success">
                                                    <h6>Đã có báo giá cố định:</h6>
                                                    <p><strong>Giá công:</strong> {booking.quote.laborPrice?.toLocaleString()} VNĐ</p>
                                                    <p><strong>Thời gian bảo hành:</strong> {booking.quote.warrantiesDuration} tháng</p>
                                                    <p><strong>Tổng tiền:</strong> {booking.quote.totalAmount?.toLocaleString()} VNĐ</p>
                                                </div>
                                            ) : (
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Giá công cố định</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={technicianServicePrice ? `${technicianServicePrice.toLocaleString()} VNĐ` : 'Chưa có giá'}
                                                            readOnly
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Thời gian bảo hành (tháng)</label>
                                                        <select
                                                            className="form-control"
                                                            value={selectedWarrantyDuration}
                                                            onChange={e => setSelectedWarrantyDuration(Number(e.target.value))}
                                                        >
                                                            <option value={1}>1 tháng</option>
                                                            <option value={3}>3 tháng</option>
                                                            <option value={6}>6 tháng</option>
                                                            <option value={9}>9 tháng</option>
                                                            <option value={12}>12 tháng</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hiển thị thông tin báo giá hiện tại nếu đã có và đã chọn giá công */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.quote && (selectedLaborPrice > 0 || booking?.quote?.laborPrice > 0) && (
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h5>Thông tin báo giá hiện tại</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="alert alert-info">
                                                <h6>Báo giá đã được tạo:</h6>
                                                <p><strong>Giá công:</strong> {booking?.quote?.laborPrice?.toLocaleString()} VNĐ</p>
                                                <p><strong>Thời gian bảo hành:</strong> {booking?.quote?.warrantiesDuration} tháng</p>
                                                {booking?.quote?.items && booking?.quote?.items?.length > 0 && (
                                                    <div>
                                                        <p><strong>Thiết bị phát sinh:</strong></p>
                                                        <ul className="list-unstyled">
                                                            {booking?.quote?.items.map((item, idx) => (
                                                                <li key={idx} className={`mb-1 ${item.status === 'REJECTED' ? 'text-muted' : item.status === 'ACCEPTED' ? 'text-success' : ''}`}>
                                                                    • {item.name} - {item.price.toLocaleString()} VNĐ x {item.quantity}
                                                                    {item.status === 'PENDING' && <span className="badge bg-warning">Chờ xác nhận</span>}
                                                                    {item.status === 'ACCEPTED' && <span className="badge bg-success">Đã chấp nhận</span>}
                                                                    {item.status === 'REJECTED' && <span className="badge bg-danger">Đã từ chối</span>}
                                                                    {item.note && <span className="text-muted"> ({item.note})</span>}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <p><strong>Tổng tiền:</strong> {booking?.finalPrice?.toLocaleString()} VNĐ</p>
                                                <p><strong>Trạng thái:</strong>
                                                    <span className={`badge ${booking?.quote?.status === 'PENDING' ? 'bg-warning' : 'bg-info'}`}>
                                                        {booking?.quote?.status === 'PENDING' ? 'Có yêu cầu phát sinh chờ xác nhận' : 'Không có yêu cầu phát sinh chờ xác nhận'}
                                                    </span>
                                                </p>
                                                {booking?.quote?.items?.some(item => item.status === 'PENDING') && (
                                                    <div className="alert alert-warning mt-2">
                                                        <strong>⚠ Có yêu cầu phát sinh đang chờ khách xác nhận!</strong>
                                                    </div>
                                                )}
                                                {booking?.quote?.items?.some(item => item.status === 'ACCEPTED') && (
                                                    <div className="alert alert-success mt-2">
                                                        <strong>✓ Có thiết bị đã được khách chấp nhận!</strong> Bạn có thể tiếp tục thêm thiết bị phát sinh nếu cần.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {items.length > 0 && (
                                    <Accordion defaultActiveKey={['0']} alwaysOpen>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>
                                                Thiết bị phát sinh mới ({items.length} hạng mục)
                                                {booking?.quote?.items && booking.quote.items.length > 0 && (
                                                    <span className="text-muted ms-2">
                                                        (Sẽ thêm vào danh sách hiện có)
                                                    </span>
                                                )}
                                            </Accordion.Header>
                                            <Accordion.Body className="p-0">
                                                {items.length > 0 && (
                                                    <div className="table-responsive" style={{ marginBottom: 15 }}>
                                                        <table className="table table-center table-hover">
                                                            <thead className="thead-light">
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
                                                                    <tr key={idx}>
                                                                        <td>{item.name}</td>
                                                                        <td>{item.price.toLocaleString()}</td>
                                                                        <td>{item.quantity}</td>
                                                                        <td>{item.note}</td>
                                                                        <td>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-warning me-2"
                                                                                onClick={() => handleEdit(idx)}
                                                                            >
                                                                                Sửa
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-danger"
                                                                                onClick={() => handleDelete(idx)}
                                                                            >
                                                                                Xóa
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
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

                                <button
                                    style={{ marginLeft: 10 }}
                                    className="btn btn-primary"
                                    onClick={handleComfirm}
                                >
                                    Xác nhận và Thanh toán
                                </button>


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

                                {/* Thông báo giá công đã chọn cho COMPLEX service */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'COMPLEX' && selectedLaborPrice > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Giá công đã chọn:</strong> {selectedLaborPrice.toLocaleString()} VNĐ
                                    </div>
                                )}

                                {/* Thông báo giá công cố định cho FIXED service */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'FIXED' && selectedLaborPrice > 0 && (
                                    <div className="alert alert-success">
                                        <strong>Giá công cố định:</strong> {selectedLaborPrice.toLocaleString()} VNĐ
                                    </div>
                                )}

                                {/* Thông báo thời gian bảo hành đã chọn */}
                                {user?.role?.name === 'TECHNICIAN' && selectedWarrantyDuration > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Thời gian bảo hành đã chọn:</strong> {selectedWarrantyDuration} tháng
                                    </div>
                                )}

                                {/* Thông báo cho FIXED service */}
                                {user?.role?.name === 'TECHNICIAN' && booking?.serviceId?.serviceType === 'FIXED' && booking?.quote && (
                                    <div className="alert alert-success">
                                        <strong>Dịch vụ cố định:</strong> Giá công đã được tự động lưu ({booking.quote.laborPrice?.toLocaleString()} VNĐ)
                                    </div>
                                )}

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
                <Modal show={showAdditionalPopup} onHide={() => setShowAdditionalPopup(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {booking?.quote?.note === 'Yêu cầu xác nhận giá công và thời gian bảo hành' 
                                ? 'Xác nhận giá công và thời gian bảo hành' 
                                : 'Yêu cầu phát sinh từ kỹ thuật viên'
                            }
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {booking?.quote?.note === 'Yêu cầu xác nhận giá công và thời gian bảo hành' ? (
                            // Nội dung cho xác nhận giá công
                            <>
                                <div className="text-center mb-4">
                                    <h5>Thợ đề xuất giá công cho dịch vụ này:</h5>
                                    <h3 className="text-primary">{booking.quote.laborPrice?.toLocaleString()} VNĐ</h3>
                                </div>
                                
                                <div className="text-center mb-4">
                                    <h5>Thời gian bảo hành:</h5>
                                    <h3 className="text-success">{booking.quote.warrantiesDuration} tháng</h3>
                                </div>
                                
                                <div className="alert alert-info">
                                    <strong>Lưu ý:</strong> Sau khi xác nhận, thợ sẽ bắt đầu thực hiện dịch vụ với mức giá và thời gian bảo hành đã thống nhất.
                                </div>
                            </>
                        ) : (
                            // Nội dung cho yêu cầu phát sinh thiết bị
                            <>
                                <p>Kỹ thuật viên yêu cầu thêm các thiết bị sau:</p>
                                {booking.quote.items && booking.quote.items.filter(item => item.status === 'PENDING').length > 0 ? (
                                    <ul>
                                        {booking.quote.items
                                            .filter(item => item.status === 'PENDING')
                                            .map((item, idx) => (
                                                <li key={idx}>
                                                    <strong>{item.name}</strong> - {item.price.toLocaleString()} VNĐ x {item.quantity}
                                                    {item.note && <span className="text-muted"> ({item.note})</span>}
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <div className="alert alert-warning">
                                        <strong>Không có thiết bị mới nào đang chờ xác nhận.</strong>
                                    </div>
                                )}
                                
                                {/* Tính tổng thiết bị chỉ từ items PENDING */}
                                {booking.quote.items && booking.quote.items.filter(item => item.status === 'PENDING').length > 0 && (
                                    <div className="alert alert-info">
                                        <strong>Tổng thiết bị mới:</strong> {booking.quote.items
                                            .filter(item => item.status === 'PENDING')
                                            .reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()} VNĐ
                                    </div>
                                )}
                                
                                {/* Tính tổng cộng: giá công + giá thiết bị đã chấp nhận + giá thiết bị pending */}
                                {(() => {
                                    const pendingItems = booking.quote.items.filter(item => item.status === 'PENDING');
                                    
                                    if (pendingItems.length > 0) {
                                        const acceptedItemsTotal = booking.quote.items
                                            .filter(item => item.status === 'ACCEPTED')
                                            .reduce((total, item) => total + (item.price * item.quantity), 0);
                                        
                                        const pendingItemsTotal = pendingItems
                                            .reduce((total, item) => total + (item.price * item.quantity), 0);
                                        
                                        const totalAmount = (booking.quote.laborPrice || 0) + acceptedItemsTotal + pendingItemsTotal;
                                        
                                        return (
                                            <div className="alert alert-success">
                                                <strong>Tổng cộng:</strong> {totalAmount.toLocaleString()} VNĐ
                                            </div>
                                        );
                                    }
                                    
                                    return null;
                                })()}
                                
                                {booking.quote.note && (
                                    <div className="alert alert-warning">
                                        <strong>Ghi chú:</strong> {booking.quote.note}
                                    </div>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleAcceptAdditional}>
                            Đồng ý
                        </Button>
                        <Button variant="danger" onClick={handleRejectAdditional}>
                            Từ chối
                        </Button>
                        {booking?.quote?.note === 'Yêu cầu xác nhận giá công và thời gian bảo hành' && (
                            <Button variant="secondary" onClick={() => {
                                setShowAdditionalPopup(false);
                                navigate('/');
                            }}>
                                Hủy đơn hàng
                            </Button>
                        )}
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}

export default BookingProcessing;