import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelBooking, fetchBookingById, setLastCancelBy, technicianConfirmBookingThunk, technicianRejectBookingThunk } from "../../../features/bookings/bookingSlice";
import { formatDateOnly, formatTimeOnly } from "../../../utils/formatDate";
import { BOOKING_STATUS_CONFIG } from "../../../constants/bookingConstants";
import { useNavigate } from "react-router-dom";
import { Image } from "react-bootstrap";
import { toast } from 'react-toastify';

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

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    console.log('--- BOOKING DETAILS ---', booking);

    const statusConfig = BOOKING_STATUS_CONFIG[booking?.status] || BOOKING_STATUS_CONFIG.default;
    // console.log('--- IMAGE BOOKING DETAIL ---', booking?.images);

    // Kiểm tra xem technician có thể hủy đơn hàng không (chỉ sau khi đã được chấp nhận)
    const canTechnicianCancel = () => {
        if (user?.role?.name !== 'TECHNICIAN') return false;
        
        // Các status sau khi đã được chấp nhận: IN_PROGRESS, WAITING_CUSTOMER_CONFIRM_ADDITIONAL, CONFIRM_ADDITIONAL, AWAITING_DONE, DONE
        const statusesAfterAcceptance = ['IN_PROGRESS', 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL', 'CONFIRM_ADDITIONAL', 'AWAITING_DONE', 'DONE'];
        return statusesAfterAcceptance.includes(booking?.status);
    };

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

    const handleTechnicianConfirm = async () => {
        if (!bookingId) return;
        setConfirming(true);
        try {
            const resultAction = await dispatch(technicianConfirmBookingThunk(bookingId));
            console.log('--- TECHNICIAN CONFIRM RESULT ---', resultAction);

            if (technicianConfirmBookingThunk.fulfilled.match(resultAction)) {
                toast.success('Bạn đã xác nhận nhận đơn!');
                dispatch(fetchBookingById(bookingId));
            } else {
                // Hiển thị message lỗi cụ thể từ backend thay vì "Request failed with status code 400"
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                console.log('--- ERROR MESSAGE ---', errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            // Xử lý lỗi network hoặc lỗi khác
            console.log('--- CATCH ERROR ---', error);
            const errorMessage = error?.message || 'Có lỗi xảy ra!';
            toast.error(errorMessage);
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
                // Hiển thị message lỗi cụ thể từ backend
                const errorMessage = resultAction.payload || 'Có lỗi xảy ra!';
                console.log('--- ERROR MESSAGE ---', errorMessage);
                console.log('--- ERROR DETAILS ---', {
                    type: resultAction.type,
                    payload: resultAction.payload,
                    error: resultAction.error
                });
                toast.error(errorMessage);
            }
        } catch (error) {
            // Xử lý lỗi network hoặc lỗi khác
            console.log('--- CATCH ERROR ---', error);
            console.log('--- CATCH ERROR DETAILS ---', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            const errorMessage = error?.message || 'Có lỗi xảy ra!';
            toast.error(errorMessage);
        } finally {
            setRejecting(false);
        }
    };

    return (
        // <div className="booking-sidebar">
        //     <div className="booking-sidebar-card">
        //         <div className="booking-sidebar-head">
        //             <h5>
        //                 Chi tiết đơn hàng
        //             </h5>
        //         </div>
        //         <div className="booking-sidebar-body">
        //             <div className="booking-car-detail">
        //                 <div
        //                     className="d-flex flex-nowrap overflow-auto py-2"
        //                     style={{ gap: "0.5rem" }}
        //                 >
        //                     {booking?.images?.map((image) => (
        //                         <Image
        //                             key={image}
        //                             src={image}
        //                             thumbnail
        //                             onClick={() => setSelectedImage(image)}
        //                             style={{ maxHeight: 120, width: "auto", objectFit: "contain" }}
        //                         />
        //                     ))}
        //                 </div>
        //             </div>

        //             <div className="booking-vehicle-rates">
        //                 <Container>
        //                     <Row>
        //                         <Col>
        //                             <ul>
        //                                 <li>
        //                                     <h6><span>Loại dịch vụ:</span> {booking?.serviceId?.serviceName || 'Đang cập nhật..'}</h6>
        //                                 </li>
        //                                 <li>
        //                                     <h6><span>Loại đặt lịch:</span> {booking?.isUrgent ? 'Đặt ngay' : 'Đặt lịch' || 'Đang cập nhật..'}</h6>
        //                                 </li>
        //                                 <li>
        //                                     <h6><span>Địa chỉ:</span> {booking?.location?.address || 'Đang cập nhật..'}</h6>
        //                                 </li>
        //                                 <li>
        //                                     <h6><span>Mô tả:</span> {booking?.description || 'Đang cập nhật..'}</h6>
        //                                 </li>
        //                                 <li>
        //                                     <h6><span>Ngày đặt lịch:</span> {formatDateOnly(booking?.schedule?.startTime) || 'Đang cập nhật..'}</h6>
        //                                 </li>
        //                                 <li>
        //                                     <h6><span>Thời gian:</span> {booking?.schedule?.startTime && booking?.schedule?.expectedEndTime
        //                                         ? `${formatTimeOnly(booking?.schedule?.startTime)} - ${formatTimeOnly(booking?.schedule?.expectedEndTime)}`
        //                                         : 'Thời gian không hợp lệ'}
        //                                     </h6>
        //                                 </li>
        //                             </ul>
        //                         </Col>
        //                         <Col>
        //                             <ul>
        //                                 {booking?.status === 'IN_PROGRESS' && (
        //                                     <>
        //                                         <li>
        //                                             <h6><span>Giá công: </span> {booking?.bookingPrice?.laborPrice.toLocaleString() || 'Đang cập nhật..'} VNĐ</h6>
        //                                         </li>
        //                                         <li>
        //                                             <h6>
        //                                                 <span>Giá thiết bị: </span>
        //                                                 {booking?.bookingItems?.length > 0
        //                                                     ? booking.bookingItems.reduce(
        //                                                         (total, item) => total + item.price * item.quantity,
        //                                                         0
        //                                                     ).toLocaleString() + ' VNĐ'
        //                                                     : "Đang cập nhật.."}
        //                                             </h6>
        //                                         </li>
        //                                         <li>
        //                                             <h6><span>Thời gian bảo hành: </span> {booking?.bookingPrice?.warrantiesDuration || 'Đang cập nhật..'}</h6>
        //                                         </li>
        //                                     </>
        //                                 )}

        //                                 <li>
        //                                     <h6><span>Trạng thái: </span>
        //                                         <span className={`status-badge ${statusConfig.className}`}>
        //                                             {statusConfig.text || 'Đang cập nhật..'}
        //                                         </span>
        //                                     </h6>
        //                                 </li>


        //                             </ul>
        //                         </Col>
        //                     </Row>
        //                     <ul>
        //                         {booking?.booking?.status === 'IN_PROGRESS' && (
        //                             <li className="total-rate">
        //                                 <h5>
        //                                     <span>Tổng tạm tính: </span>
        //                                     <span>{booking?.bookingPrice?.finalPrice.toLocaleString() || 'Đang cập nhật..'} VNĐ</span>
        //                                 </h5>
        //                             </li>
        //                         )}
        //                     </ul>

        //                 </Container>
        //                 <ul>



        //                 </ul>
        //             </div>
        //         </div>
        //     </div>
        //     {booking?.booking?.status !== 'DONE' && (
        //         <button onClick={handleCancel} className="btn btn-outline-danger" style={{ width: '100%', marginTop: -5 }}>Hủy đơn hàng</button>
        //     )}

        //     {selectedImage && (
        //         <div
        //             className="zoom-overlay"
        //             onClick={() => setSelectedImage(null)}      // click nền để tắt
        //         >
        //             <img
        //                 src={selectedImage}
        //                 className="zoom-img"
        //                 alt="zoom"
        //                 onClick={(e) => e.stopPropagation()}     // ngăn sự kiện nổi bọt
        //             />
        //             <button
        //                 className="zoom-close"
        //                 onClick={() => setSelectedImage(null)}
        //             >
        //                 &times;
        //             </button>
        //         </div>
        //     )}
        // </div>
        <div className="booking-sidebar">
            <div className="booking-sidebar-card">
                <div className="accordion-item border-0 mb-4">
                    <div className="accordion-header">
                        <div>
                            <div className="booking-sidebar-head">
                                <h5>
                                    Thông tin chi tiết
                                    {/* <i className="fas fa-chevron-down" /> */}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="booking-sidebar-body">
                        {Array.isArray(booking?.images) && booking.images.length > 0 && (
                            <div className="booking-car-detail">
                                <div
                                    className="d-flex flex-nowrap overflow-auto py-2"
                                    style={{ gap: "0.5rem" }}
                                >
                                    {booking.images.map((image) => (
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
                        )}
                        <div className="booking-vehicle-rates">
                            <ul>
                                {/* <li>
                                    <div className="rental-charge">
                                        <h6>
                                            Rental Charges Rate <span> (1 day )</span>
                                        </h6>
                                        <span className="text-danger">(This does not include fuel)</span>
                                    </div>
                                    <h5>+ $300</h5>
                                </li> */}
                                <li>
                                    <h6>Loại dịch vụ:</h6>
                                    <h5>{booking?.serviceId?.serviceName || 'Đang cập nhật..'}</h5>
                                </li>
                                <li>
                                    <h6>Loại đặt lịch:</h6>
                                    <h5>{booking?.isUrgent ? 'Đặt ngay' : 'Đặt lịch' || 'Đang cập nhật..'}</h5>
                                </li>
                                <li>
                                    <h6>Địa chỉ:</h6>
                                    <h5 style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '200px',
                                        lineHeight: '1.4'
                                    }}>
                                        {booking?.location?.address || 'Đang cập nhật..'}
                                    </h5>
                                </li>
                                <li>
                                    <h6>Mô tả:</h6>
                                    <h5 style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        maxWidth: '200px',
                                        lineHeight: '1.4'
                                    }}>
                                        {booking?.description || 'Đang cập nhật..'}
                                    </h5>
                                </li>
                                {!booking?.isUrgent && (
                                    <>
                                        <li>
                                            <h6>Ngày đặt lịch:</h6>
                                            <h5>{formatDateOnly(booking?.schedule?.startTime) || 'Đang cập nhật..'}</h5>
                                        </li>
                                        <li>
                                            <h6>Thời gian:</h6>
                                            <h5>
                                                {booking?.schedule?.startTime && booking?.schedule?.expectedEndTime
                                                    ? `${formatTimeOnly(booking?.schedule?.startTime)} - ${formatTimeOnly(booking?.schedule?.expectedEndTime)}`
                                                    : 'Thời gian không hợp lệ'}
                                            </h5>
                                        </li>
                                    </>
                                )}
                                <li>
                                    <h6>Trạng thái: </h6>
                                    <h5 className={`status-badge ${statusConfig.className}`}>
                                        {statusConfig.text || 'Đang cập nhật..'}
                                    </h5>
                                </li>
                                
                                {/* Hiển thị giá công và thời gian bảo hành nếu đã có quote và khách đã accept */}
                                {booking?.quote && booking?.status !== 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL' && (
                                    <>
                                        <li>
                                            <h6>Giá công:</h6>
                                            <h5>{booking.quote.laborPrice?.toLocaleString() || 0} VNĐ</h5>
                                        </li>
                                        <li>
                                            <h6>Thời gian bảo hành:</h6>
                                            <h5>{booking.quote.warrantiesDuration || 1} tháng</h5>
                                        </li>
                                        <li>
                                            <h6>Tổng tiền hiện tại:</h6>
                                            <h5>{booking?.finalPrice?.toLocaleString() || 0} VNĐ</h5>
                                        </li>
                                    </>
                                )}

                                {/* <li className="total-rate">
                                    <h6>Subtotal</h6>
                                    <h5>+$1604</h5>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nút hủy đơn hàng - chỉ hiển thị cho customer hoặc technician sau khi đã chấp nhận */}
            {booking?.status !== 'DONE' && (
                (user?.role?.name === 'CUSTOMER') || 
                (user?.role?.name === 'TECHNICIAN' && canTechnicianCancel())
            ) && (
                <button onClick={handleCancel} className="btn btn-outline-danger" style={{ width: '100%', marginTop: -5 }}>Hủy đơn hàng</button>
            )}
            
            {/* Nút chấp nhận yêu cầu cho technician */}
            {user?.role?.name === 'TECHNICIAN' && booking?.status === 'AWAITING_CONFIRM' && !booking?.technicianId && (
                <button
                    className="btn btn-outline-success"
                    style={{ width: '100%', marginTop: 5 }}
                    disabled={confirming}
                    onClick={handleTechnicianConfirm}
                >
                    {confirming ? 'Đang xác nhận...' : 'Chấp nhận yêu cầu'}
                </button>
            )}
            
            {/* Nút từ chối yêu cầu cho technician */}
            {user?.role?.name === 'TECHNICIAN' && booking?.status === 'AWAITING_CONFIRM' && !booking?.technicianId && (
                <button
                    className="btn btn-outline-warning"
                    style={{ width: '100%', marginTop: 5 }}
                    disabled={rejecting}
                    onClick={handleTechnicianReject}
                >
                    {rejecting ? 'Đang từ chối...' : 'Từ chối yêu cầu'}
                </button>
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
