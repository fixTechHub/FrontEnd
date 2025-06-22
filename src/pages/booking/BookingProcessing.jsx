import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "./common/BookingDetails";
import BookingWizard from "./common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";

function BookingProcessing() {
    const [searchParams] = useSearchParams();
    const [bookingId, setBookingId] = useState(null);
    
    useEffect(() => {
        const id = searchParams.get('bookingId');
        setBookingId(id);

        console.log('--- BOOKING PROCESSING ---', id);

    }, [searchParams]);

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
                </div>
            </div>
        </>
    );
}

export default BookingProcessing;