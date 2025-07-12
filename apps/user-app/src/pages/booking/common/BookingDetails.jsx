import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelBooking, fetchDetailsBookingById, setLastCancelBy } from "../../../features/bookings/bookingSlice";
import { formatDateOnly, formatTimeOnly } from "../../../utils/formatDate";
import { BOOKING_STATUS_CONFIG } from "../../../constants/bookingConstants";
import { useNavigate } from "react-router-dom";
import { Image } from "react-bootstrap";

function BookingDetails({ bookingId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = useState(null);
    const { detailsBooking, status: bookingStatusState } = useSelector((state) => state.booking);
    // console.log('--- BOOKING DETAILS ---', detailsBooking);
    // console.log('--- USER ---', user);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchDetailsBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    console.log('--- BOOKING DETAILS ---', detailsBooking);

    const statusConfig = BOOKING_STATUS_CONFIG[detailsBooking?.booking?.status] || BOOKING_STATUS_CONFIG.default;
    // console.log('--- IMAGE BOOKING DETAIL ---', booking?.images);

    const handleCancel = async () => {
        if (!bookingId) return;

        const reason = window.prompt("Vui lòng nhập lý do huỷ đơn:");
        if (!reason) {
            alert("Bạn phải nhập lý do để huỷ đơn.");
            return;
        }

        try {
            dispatch(setLastCancelBy(user._id));
            const res = await dispatch(cancelBooking({ bookingId, reason })).unwrap();

            alert(res.message);

            navigate('/');
        } catch (error) {
            alert("Hủy đơn thất bại: " + error);
            console.log('--- CANCEL LOG ---', error);
        }
    };

    return (
        <div className="booking-sidebar">
            <div className="booking-sidebar-card">
                <div className="booking-sidebar-head">
                    <h5>
                        Chi tiết đơn hàng
                    </h5>
                </div>
                <div className="booking-sidebar-body">
                    <div className="booking-car-detail">
                        <div
                            className="d-flex flex-nowrap overflow-auto py-2"
                            style={{ gap: "0.5rem" }}
                        >
                            {detailsBooking?.booking?.images?.map((image) => (
                                <Image
                                    key={image}
                                    src={image}
                                    thumbnail
                                    onClick={() => setSelectedImage(image)}
                                    style={{ maxHeight: 120, width: "auto", objectFit: "contain" }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="booking-vehicle-rates">
                        <ul>
                            <li>
                                <h6><span>Loại dịch vụ:</span> {detailsBooking?.booking?.serviceId?.serviceName || 'Đang cập nhật..'}</h6>
                            </li>
                            <li>
                                <h6><span>Địa chỉ:</span> {detailsBooking?.booking?.location?.address || 'Đang cập nhật..'}</h6>
                            </li>
                            <li>
                                <h6><span>Tình trạng:</span> {detailsBooking?.booking?.description || 'Đang cập nhật..'}</h6>
                            </li>
                            <li>
                                <h6><span>Ngày đặt lịch:</span> {formatDateOnly(detailsBooking?.booking?.schedule?.startTime) || 'Đang cập nhật..'}</h6>
                            </li>
                            <li>
                                <h6><span>Thời gian:</span> {detailsBooking?.booking?.schedule?.startTime && detailsBooking?.booking?.schedule?.endTime
                                    ? `${formatTimeOnly(detailsBooking?.booking?.schedule?.startTime)} - ${formatTimeOnly(detailsBooking?.booking?.schedule?.endTime)}`
                                    : 'Thời gian không hợp lệ'}
                                </h6>
                            </li>

                            {detailsBooking?.booking?.status === 'IN_PROGRESS' && (
                                <>
                                    <li>
                                        <h6><span>Giá công: </span> {detailsBooking?.bookingPrice?.laborPrice.toLocaleString() || 'Đang cập nhật..'} VNĐ</h6>
                                    </li>
                                    <li>
                                        <h6>
                                            <span>Giá thiết bị: </span>
                                            {detailsBooking?.bookingItems?.length > 0
                                                ? detailsBooking.bookingItems.reduce(
                                                    (total, item) => total + item.price * item.quantity,
                                                    0
                                                ).toLocaleString() + ' VNĐ'
                                                : "Đang cập nhật.."}
                                        </h6>
                                    </li>
                                    <li>
                                        <h6><span>Thời gian bảo hành: </span> {detailsBooking?.bookingPrice?.warrantiesDuration || 'Đang cập nhật..'}</h6>
                                    </li>
                                </>
                            )}

                            <li>
                                <h6><span>Trạng thái: </span>
                                    <span className={`status-badge ${statusConfig.className}`}>
                                        {statusConfig.text || 'Đang cập nhật..'}
                                    </span>
                                </h6>
                            </li>

                            {detailsBooking?.booking?.status === 'IN_PROGRESS' && (
                                <li className="total-rate">
                                    <h5><span>Tổng tạm tính: </span> {detailsBooking?.bookingPrice?.finalPrice.toLocaleString() || 'Đang cập nhật..'} VNĐ</h5>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            {detailsBooking?.booking?.status !== 'DONE' && (
                <button onClick={handleCancel} className="btn btn-outline-danger" style={{ width: '100%', marginTop: -5 }}>Hủy đơn hàng</button>
            )}

            {selectedImage && (
                <div
                    className="zoom-overlay"
                    onClick={() => setSelectedImage(null)}      // click nền để tắt
                >
                    <img
                        src={selectedImage}
                        className="zoom-img"
                        alt="zoom"
                        onClick={(e) => e.stopPropagation()}     // ngăn sự kiện nổi bọt
                    />
                    <button
                        className="zoom-close"
                        onClick={() => setSelectedImage(null)}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingDetails;
