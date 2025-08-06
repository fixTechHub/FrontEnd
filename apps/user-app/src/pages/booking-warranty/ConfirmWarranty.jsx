import { customerSteps, technicianSteps } from "../../utils/stepsData";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingWarrantyDetails from "./BookingWarrantyDetails";
import BookingWizard from "../booking/common/BookingHeader";
import { useBookingWarrantyParams } from "../../hooks/useBookingParams";
import { checkBookingWarrantyAccess } from "../../hooks/checkBookingAccess";
import { useDispatch, useSelector } from "react-redux";
import { getWarrantyInformationThunk } from "../../features/booking-warranty/warrantySlice";
import { onWarrantyUpdated } from "../../services/socket";
function ConfirmWarranty() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingWarrantyId, stepsForCurrentUser } = useBookingWarrantyParams();
    const { user } = useSelector((state) => state.auth);
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    }, [dispatch, bookingWarrantyId]);

    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingWarrantyId || !user?._id) {
                return;
            }

            const { isAuthorized, error } = await checkBookingWarrantyAccess(
                dispatch,
                bookingWarrantyId,
                user._id,
                user.role.name
            );

            setIsAuthorized(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
        };

        verifyAccess();
    }, [dispatch, bookingWarrantyId, user?._id]);

    useEffect(() => {
        if (isChecking) return;
        if (isAuthorized === false) {
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthorized, isChecking, navigate]);
    useEffect(() => {
        if (!bookingWarrantyId) return;

        const cleanup = onWarrantyUpdated((data) => {
            if (data.bookingWarrantyId === bookingWarrantyId) {
                console.log('Warranty updated via socket, refetching data');
                dispatch(getWarrantyInformationThunk(bookingWarrantyId));
            }
        });

        return () => {
            if (cleanup) cleanup();
        };
    }, [dispatch, bookingWarrantyId]);
    const handleWarrantyUpdated = () => {
        // Refetch warranty data when the child notifies of an update
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    };

   

    if (!isAuthorized) {
        return authError ? <div>Error: {authError}</div> : null;
    }
    return (
        <>
            <Header />

            <BreadcrumbBar title={'Thông tin chi tiết'} subtitle={'Booking Warranties'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={2} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-4">
                                <BookingWarrantyDetails
                                    bookingWarrantyId={bookingWarrantyId}
                                    onWarrantyUpdated={handleWarrantyUpdated} // Pass callback to child
                                />
                            </div>

                            <div className="col-lg">
                                
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    );
}

export default ConfirmWarranty;