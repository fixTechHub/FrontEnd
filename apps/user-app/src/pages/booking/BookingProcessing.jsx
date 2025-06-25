import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "./common/BookingDetails";
import BookingWizard from "./common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";
import { useNavigate } from "react-router-dom";
function BookingProcessing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState(null);
    const [technicianId, setTechnicianId] = useState(null)
    useEffect(() => {
        const bookingId = searchParams.get('bookingId');
        setBookingId(bookingId);

        console.log('--- BOOKING PROCESSING ---', bookingId);
        const technicianId = searchParams.get('technicianId')
        setTechnicianId(technicianId)
        console.log('--- BOOKING PROCESSING ---', technicianId);

    }, [searchParams]);
    const handleComfirm = () => {
        if (!bookingId || !technicianId) {
            alert("Thiếu thông tin booking hoặc kỹ thuật viên!");
            return;
        }

        navigate(`/checkout/${bookingId}/${technicianId}`);
    };
    return (
        <>
            <Header />

            <BreadcrumbBar title={'Thông tin chi tiết'} subtitle={'Booking Details'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard activeStep={3} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-4">
                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg">
                                {/* Gắn chat component ở đây */}
                                <MessageBox bookingId={bookingId} />
                            </div>
                        </div>
                    </div>
                    <div className="text-end my-4">
                        <button className="btn btn-primary" onClick={handleComfirm}>
                            Xác nhận và Thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookingProcessing;