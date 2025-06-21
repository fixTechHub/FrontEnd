import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelBooking, fetchBookingById } from "../../features/bookings/bookingSlice";
import { formatDate } from "../../utils/formatDate";
import { BOOKING_STATUS_CONFIG } from "../../constants/bookingConstants";
import { useNavigate } from "react-router-dom";

function BookingDetails({ bookingId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { booking, status: bookingStatus } = useSelector((state) => state.booking);
    // console.log('--- BOOKING DETAILS ---', booking);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    const statusConfig = BOOKING_STATUS_CONFIG[booking?.status] || BOOKING_STATUS_CONFIG.default;
    // console.log('--- IMAGE BOOKING DETAIL ---', booking?.images);

    const handleCancel = async () => {
        if (!bookingId) return;

        const reason = window.prompt("Vui lòng nhập lý do huỷ đơn:");
        if (!reason) {
            alert("Bạn phải nhập lý do để huỷ đơn.");
            return;
        }

        // const confirmCancel = window.confirm("Bạn có chắc chắn muốn huỷ đơn này?");
        // if (!confirmCancel) return;

        try {
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
                        {booking?.images?.map((image) => (
                            <span key={image} className="car-img">
                                <img src={image} className="img-fluid" alt="booking-image" />
                            </span>
                        ))}

                        <span className="car-img">
                            <img src={"/img/car-list-4.jpg"} className="img-fluid" alt="Car" />
                        </span>

                        {/* <div className="care-more-info">
                            <h5>Chevrolet Camaro</h5>
                            <p>Miami St, Destin, FL 32550, USA</p>
                            <a href="listing-details.html">View Car Details</a>
                        </div> */}
                    </div>

                    <div className="booking-vehicle-rates">
                        <ul>
                            <li>
                                <h6><span>Loại dịch vụ:</span> {booking?.serviceId?.serviceName || 'Refundable Deposit'}</h6>
                            </li>
                            <li>
                                <h6><span>Địa chỉ:</span> {booking?.location?.address || 'Refundable Deposit'}</h6>
                            </li>
                            <li>
                                <h6><span>Tình trạng:</span> {booking?.description || 'Trip Protection Fees'}</h6>
                            </li>
                            <li>
                                <h6><span>Lịch đặt:</span> {formatDate(booking?.schedule) || 'Convenience Fees'}</h6>
                            </li>
                            <li>
                                <h6><span>Trạng thái: </span>
                                    <span className={`status-badge ${statusConfig.className}`}>
                                        {statusConfig.text}
                                    </span>
                                </h6>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {booking?.status !== 'DONE' && (
                <button onClick={handleCancel} className="btn btn-outline-danger" style={{ width: '100%', marginTop: -5 }}>Hủy đặt thợ</button>
            )}
        </div>
    );
};

export default BookingDetails;
