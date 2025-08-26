import { Spinner } from "react-bootstrap";
import BookingWizard from "../booking/common/BookingHeader";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "../booking/common/BookingDetails";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById } from "../../features/bookings/bookingSlice";

function TechnicianIncome() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { booking, status: bookingStatus } = useSelector((state) => state.booking);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Hoàn thành công việc'} subtitle={'Job Completed'} />

            <div className="booking-new-module">
                <div className="container">
                    <div className="booking-detail-info">
                        <div className="row">
                            <div style={{ display: 'flex', alignItems: 'center' }} className="card your-card">
                                {bookingStatus === 'loading' ? (
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <Spinner animation="border" variant="primary" />
                                        <p style={{ marginTop: '1rem' }}>Đang tải thông tin...</p>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem' }}>
                                            ✓
                                        </div>

                                        <h4 style={{ marginBottom: '1rem', color: '#28a745' }}>Công việc đã hoàn thành!</h4>

                                        <p style={{ marginBottom: '1rem' }}>Bạn đã xác nhận hoàn thành công việc cho đơn #{booking?.bookingCode}.</p>

                                        {booking && (
                                            <>
                                                <p style={{ marginBottom: '1rem' }}>
                                                    <strong>Dịch vụ:</strong> {booking.serviceId?.serviceName}
                                                </p>
                                                <p style={{ marginBottom: '1rem' }}>
                                                    <strong>Khách hàng:</strong> {booking.customerId?.fullName}
                                                </p>
                                                {booking.quote && (
                                                    <p style={{ marginBottom: '1rem' }}>
                                                        <strong>Tổng tiền:</strong> {booking.quote.totalAmount?.toLocaleString()} VNĐ
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        <p style={{ marginBottom: '1rem' }}>Hệ thống sẽ tự động xử lý thanh toán và cập nhật trạng thái đơn hàng.</p>

                                        <p style={{ marginBottom: '2rem' }}>Cảm ơn bạn đã cung cấp dịch vụ chất lượng!</p>

                                        <div className="mt-30 mb-20">
                                            <button
                                                onClick={() => navigate('/')}
                                                className="btn btn-primary"
                                            >
                                                Đi đến trang chủ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TechnicianIncome;