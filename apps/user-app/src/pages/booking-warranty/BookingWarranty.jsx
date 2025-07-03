import { customerWarrantySteps, technicianWarrantySteps } from "../../utils/stepsData";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingWarrantyDetails from "./BookingWarrantyDetails";
import BookingWizard from "../booking/common/BookingHeader";
import MessageBox from "../../components/message/MessageBox";
import { useBookingWarrantyParams } from "../../hooks/useBookingParams";
import { checkBookingWarrantyAccess } from "../../hooks/checkBookingAccess";
import { getWarrantyInformationThunk, confirmWarrantyThunk } from "../../features/booking-warranty/warrantySlice";
import { onWarrantyUpdated } from "../../services/socket";

function BookingWarranty() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingWarrantyId, stepsForCurrentUser } = useBookingWarrantyParams();
    const { user } = useSelector((state) => state.auth);
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [solutionNote, setSolutionNote] = useState('');

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
            toast.warn(`Access denied: ${authError || 'You are not authorized to view this warranty.'}`, {
                position: 'top-right',
                autoClose: 5000,
            });
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthorized, isChecking, navigate, authError]);

    useEffect(() => {
        if (!bookingWarrantyId) return;

        const cleanup = onWarrantyUpdated((data) => {
            if (data.bookingWarrantyId === bookingWarrantyId) {
                console.log('Warranty updated via socket, refetching data:', data);
                dispatch(getWarrantyInformationThunk(bookingWarrantyId));
                toast.info(`Warranty status updated to ${data.status || 'unknown'}.`, {
                    position: 'top-right',
                    autoClose: 5000,
                });
            }
        });

        return () => {
            if (cleanup) {
                console.log('Cleaning up warrantyUpdated listener');
                cleanup();
            }
        };
    }, [dispatch, bookingWarrantyId]);

    const handleWarrantyUpdated = () => {
        if (bookingWarrantyId) {
            dispatch(getWarrantyInformationThunk(bookingWarrantyId));
        }
    };

    const handleConfirm = () => {
        if (!bookingWarrantyId) {
            toast.error('Thiếu thông tin booking hoặc kỹ thuật viên!', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }
        navigate(`/warranty/resolve?bookingWarrantyId=${bookingWarrantyId}`);
    };

    const handleResolveWarranty = async (e) => {
        e.preventDefault();
        if (!bookingWarrantyId || !solutionNote.trim()) {
            toast.error('Vui lòng cung cấp ghi chú giải pháp!', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }

        try {
            const formData = { status: 'RESOLVED', solutionNote };
            await dispatch(confirmWarrantyThunk({ bookingWarrantyId, formData })).unwrap();
            toast.success('Bảo hành đã được đánh dấu là hoàn tất!', {
                position: 'top-right',
                autoClose: 5000,
            });
            // Close modal
            document.querySelector('#resolve_warranty .btn-close').click();
            setSolutionNote('');

            handleWarrantyUpdated()
        } catch (error) {
            toast.error(`Lỗi khi xác nhận giải quyết bảo hành: ${error.message || 'Đã xảy ra lỗi'}`, {
                position: 'top-right',
                autoClose: 5000,
            });
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
                    <BookingWizard steps={stepsForCurrentUser} activeStep={1} />
                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-4">
                                <BookingWarrantyDetails
                                    bookingWarrantyId={bookingWarrantyId}
                                    onWarrantyUpdated={handleWarrantyUpdated}
                                />
                            </div>
                            <div className="col-lg">
                                {warranty?.bookingId?._id && (warranty?.bookingId?.isChatAllowed && warranty?.bookingId?.isVideoCallAllowed) ? (
                                    <MessageBox
                                        bookingId={warranty?.bookingId._id}
                                        bookingWarrantyId={bookingWarrantyId}
                                    />
                                ) : (
                                    <div className="alert alert-warning">
                                        You can't chat or call video.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-end my-4">
                        {user?.role?.name === 'CUSTOMER' && warranty.status === 'RESOLVED' && (
                            <button
                                className="btn btn-primary me-2"
                                onClick={handleConfirm}
                            >
                                Xác nhận bảo hành thành công
                            </button>
                        )}
                        {user?.role?.name === 'TECHNICIAN' && warranty.status === 'CONFIRMED' && (
                            <button
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#resolve_warranty"
                            >
                                Đánh dấu bảo hành hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for resolving warranty */}
            <div className="modal fade" id="resolve_warranty">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="mb-0">Đánh dấu bảo hành hoàn tất</h4>
                            <button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
                                <i className="ti ti-x fs-16"></i>
                            </button>
                        </div>
                        <div className="modal-body pb-1">
                            <form onSubmit={handleResolveWarranty}>
                                <div className="mb-3">
                                    <label className="form-label">Ghi chú giải pháp <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        value={solutionNote}
                                        onChange={(e) => setSolutionNote(e.target.value)}
                                        placeholder="Mô tả giải pháp đã thực hiện..."
                                        required
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <div></div> {/* Empty div for spacing */}
                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-light me-3" data-bs-dismiss="modal">Hủy</button>
                                    <button className="btn btn-primary" onClick={handleResolveWarranty}>Lưu thay đổi</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookingWarranty;