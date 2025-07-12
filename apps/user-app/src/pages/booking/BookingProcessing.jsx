import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "./common/BookingDetails";
import BookingWizard from "./common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";
import TechnicianProfile from "../../components/profile/TechnicianProfile";
import BookingItems from "./common/BookingItems";
import { useBookingParams } from "../../hooks/useBookingParams";
import { checkBookingAccess } from "../../hooks/checkBookingAccess";
import { useDispatch, useSelector } from "react-redux";
import { fetchDetailsBookingById, proposeAdditionalItemsThunk, approveAdditionalItemsThunk, rejectAdditionalItemsThunk } from "../../features/bookings/bookingSlice";
import { addItem, removeItem, updateItem } from "../../features/quotations/quotationSlice";
import { onBookingStatusUpdate } from "../../services/socket";
import { confirmJobDoneByTechnician } from '../../features/bookings/bookingAPI';

function BookingProcessing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { user } = useSelector((state) => state.auth);
    const { detailsBooking, status: bookingStatusState } = useSelector((state) => state.booking);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const { items } = useSelector((state) => state.quotation);
    const [modalItem, setModalItem] = useState({ name: '', price: '', quantity: 1, note: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const lastCancelBy = useSelector((state) => state.booking.lastCancelBy);
    const [showAdditionalPopup, setShowAdditionalPopup] = useState(false);
    const [additionalItems, setAdditionalItems] = useState([]);
    const [additionalReason, setAdditionalReason] = useState('');

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchDetailsBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingId || !user?._id) {
                // setAuthError("Missing booking ID or user information");
                setIsAuthorized(false);
                setIsChecking(true);
                return;
            }

            const { isAuthorized, error } = await checkBookingAccess(dispatch, bookingId, user._id, user.role.name);

            setIsAuthorized(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
        };

        verifyAccess();
    }, [dispatch, bookingId, user?._id]);

    useEffect(() => {
        if (isChecking) return;
        if (isAuthorized === false) {

            // Redirect to the original page or default to '/'
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthorized, isChecking, navigate]);

    useEffect(() => {
        const unsubscribe = onBookingStatusUpdate((data) => {
            if (data.bookingId === bookingId && data.status === 'CANCELLED') {
                // Nếu user hiện tại là người vừa bấm hủy thì KHÔNG hiện modal
                if (lastCancelBy === user._id) return;
                setShowCancelModal(true);
            }
            if (data.bookingId === bookingId) {
                dispatch(fetchDetailsBookingById(bookingId));
            }
        });
        return unsubscribe;
    }, [bookingId, dispatch, user._id, lastCancelBy]);

    const handleComfirm = () => {
        if (!bookingId) {
            alert("Thiếu thông tin booking hoặc kỹ thuật viên!");
            return;
        }

        if (detailsBooking?.booking?.status !== 'WAITING_CONFIRM') {
            alert("Bạn cần đợi kỹ thuật viên xác nhận hoàn thành trước khi tiến hành thanh toán");
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
            // Sửa item
            dispatch(updateItem({ index: editIndex, item: newItem }));
            setEditIndex(null);
        } else {
            // Thêm mới
            dispatch(addItem(newItem));
        }

        setModalItem({ name: '', price: '', quantity: 1, note: '' });

        // Đóng modal bằng Bootstrap 5
        const modal = document.getElementById('add_card');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    };

    // Xử lý nhấn nút sửa
    const handleEdit = (idx) => {
        setModalItem(items[idx]);
        setEditIndex(idx);

        // Mở modal bằng Bootstrap 5
        const modal = document.getElementById('add_card');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    };

    // Xử lý nhấn nút xóa
    const handleDelete = (idx) => {
        if (window.confirm('Bạn có chắc muốn xóa hạng mục này?')) {
            dispatch(removeItem(idx));
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
                alert('Đã xác nhận hoàn thành!');
                navigate(`/`);
            } else {
                alert('Xác nhận hoàn thành thất bại: ' + (res?.data?.message || 'Lỗi không xác định'));
            }
        } catch (err) {
            alert('Xác nhận hoàn thành thất bại: ' + (err?.response?.data?.message || err.message));
        }
    };

    // Technician gửi yêu cầu phát sinh
    const handleSendAdditionalRequest = () => {
        if (!bookingId || items.length === 0) {
            alert('Vui lòng thêm thiết bị phát sinh trước khi gửi!');
            return;
        }
        dispatch(proposeAdditionalItemsThunk({ bookingId, items, reason: '' }))
            .unwrap()
            .then(() => {
                alert('Đã gửi yêu cầu phát sinh đến khách hàng!');
            })
            .catch((err) => {
                alert('Gửi yêu cầu thất bại: ' + err);
            });
    };

    // Customer accept/reject
    const handleAcceptAdditional = () => {
        dispatch(approveAdditionalItemsThunk({ bookingId, reason: '' }))
            .unwrap()
            .then(() => {
                setShowAdditionalPopup(false);
                alert('Bạn đã đồng ý chi phí phát sinh!');
            })
            .catch((err) => {
                alert('Xác nhận thất bại: ' + err);
            });
    };

    const handleRejectAdditional = () => {
        dispatch(rejectAdditionalItemsThunk({ bookingId, reason: '' }))
            .unwrap()
            .then(() => {
                setShowAdditionalPopup(false);
                alert('Bạn đã từ chối chi phí phát sinh!');
            })
            .catch((err) => {
                alert('Từ chối thất bại: ' + err);
            });
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
                                {user?.role?.name === 'CUSTOMER' && (
                                    <TechnicianProfile technician={detailsBooking?.booking?.technicianId} />
                                )}

                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg-8">
                                {/* Gắn chat component ở đây */}
                                {detailsBooking?.booking?.isChatAllowed && detailsBooking?.booking?.isVideoCallAllowed ? (
                                    <MessageBox bookingId={bookingId} />
                                ) : (
                                    <div className="alert alert-warning">
                                        You can't chat or call video.
                                    </div>
                                )}

                                <div style={{ marginTop: 15 }}>
                                    <BookingItems bookingItems={detailsBooking?.bookingItems} />
                                </div>

                                {items.length > 0 && (
                                    <div className="table-responsive" style={{ marginBottom: 15 }}>
                                        <h4 style={{ marginBottom: 10 }} >Thiết bị phát sinh</h4>
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

                            </div>
                        </div>
                    </div>

                    <div className="text-end">
                        {user?.role?.name === 'CUSTOMER'
                            // && booking.status === 'WAITING_CONFIRM'
                            && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleComfirm}
                                >
                                    Xác nhận và Thanh toán
                                </button>
                            )}

                        {user?.role?.name === 'TECHNICIAN'
                            && detailsBooking?.booking.status === 'IN_PROGRESS'
                            && (
                                <>
                                    {items.length > 0 && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSendAdditionalRequest}
                                        >
                                            Gửi yêu cầu
                                        </button>
                                    )}

                                    <button
                                        style={{ marginLeft: 10 }}
                                        className="btn btn-primary"
                                        data-bs-toggle="modal" data-bs-target="#add_card"
                                    >
                                        Yêu cầu phát sinh
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
                <div className="modal-dialog modal-dialog-centered modal-lg">
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

            {showAdditionalPopup && (
                <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi phí phát sinh</h5>
                            </div>
                            <div className="modal-body">
                                <p>Có chi phí phát sinh từ kỹ thuật viên:</p>
                                {additionalReason && <p><b>Lý do:</b> {additionalReason}</p>}
                                <table className="table table-center table-hover">
                                    <thead>
                                        <tr>
                                            <th>Tên thiết bị</th>
                                            <th>Giá tiền</th>
                                            <th>Số lượng</th>
                                            <th>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {additionalItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>{item.price.toLocaleString()}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-success" onClick={handleAcceptAdditional}>Đồng ý</button>
                                <button className="btn btn-danger" onClick={handleRejectAdditional}>Từ chối</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BookingProcessing;