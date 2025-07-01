import { Spinner } from "react-bootstrap";
import BookingWizard from "../booking/common/BookingHeader";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "../booking/common/BookingDetails";
import { useBookingParams } from "../../hooks/useBookingParams";
import { useNavigate } from "react-router-dom";

function WaitingConfirm() {
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const navigate = useNavigate();

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Chờ xác nhận'} subtitle={'Waiting customer confirm'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={2} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-5">
                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg-7">
                                <div style={{ display: 'flex', alignItems: 'center' }} className="card your-card">
                                    <Spinner animation="border" variant="warning"
                                        style={{ width: '14rem', height: '14rem', borderWidth: '1em', marginTop: 60 }}
                                    />

                                    <h6 style={{ marginTop: 60 }}>Báo giá của bạn đã được gửi đi. Hãy đợi khách xác nhận nhé !</h6>

                                    <p style={{ marginTop: 10 }}>Bạn có thể kiểm tra lại thông tin báo giá trong phần "Thông tin chi tiết" của booking.</p>

                                    <p style={{ marginTop: 10 }}>Bạn sẽ nhận được thông báo khi khách hàng xác nhận báo giá của bạn.</p>

                                    <p style={{ marginTop: 10 }}>Bạn có thể đợi hoặc di chuyển đến trang chủ để tìm kiếm những cơ hội khác !!!</p>

                                    <div className="mt-30 mb-20">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="btn btn-primary"
                                        >
                                            Đi đến trang chủ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WaitingConfirm;