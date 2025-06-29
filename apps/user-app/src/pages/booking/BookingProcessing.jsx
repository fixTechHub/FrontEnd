import { customerSteps, technicianSteps } from "../../utils/stepsData";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "./common/BookingDetails";
import BookingWizard from "./common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";
import { useBookingParams } from "../../hooks/useBookingParams";
import { checkBookingAccess } from "../../hooks/checkBookingAccess"; 
import { useDispatch,useSelector } from "react-redux";
function BookingProcessing() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { user } = useSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [getBooking, setGetBooking] = useState(null)
    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingId || !user?._id) {
                setAuthError("Missing booking ID or user information");
                setIsAuthorized(false);
                setIsChecking(true);
                return;
            }

            const { booking,isAuthorized, error } = await checkBookingAccess(dispatch, bookingId, user._id,user.role.name);
            setIsAuthorized(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
            setGetBooking(booking)
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

    const handleComfirm = () => {
        if (!bookingId) {
            alert("Thiếu thông tin booking hoặc kỹ thuật viên!");
            return;
        }

        navigate(`/checkout?bookingId=${bookingId}`);
    };
    // if (isAuthorized === null) {
    //     return <div>Loading...</div>;
    // }

    // if (!isAuthorized) {
    //     return <div>Error: {authError}</div>;
    // }
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

                            <div className="col-lg">
                                {/* Gắn chat component ở đây */}
                                <MessageBox bookingId={bookingId} />
                            </div>
                        </div>
                    </div>
                    <div className="text-end my-4">
                        
                        {user?.role?.name === 'CUSTOMER' && getBooking.status==='WAITING_CONFIRM' (
                            <button
                                className="btn btn-primary"
                                onClick={handleComfirm}
                            >
                                Xác nhận và Thanh toán
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookingProcessing;