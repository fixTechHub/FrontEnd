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
import { Button, Modal } from "react-bootstrap";
import BookingWarrantySchedule from "./BookingWarrantySchedule";

function BookingWarranty() {
    const styles = {

        modalHeader: {
            background: 'rgb(0, 0, 0)',
            padding: '16px 24px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        modalTitleH4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#f8f9fa',
        },
        closeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
        },
        closeBtnHover: {
            color: '#f8f9fa',
        },
        modalBody: {
            padding: '24px',
            background: '#f8f9fa',
        },
        modalFormGroup: {
            marginBottom: '20px',
        },
        formLabel: {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#343a40',
            marginBottom: '8px',
            display: 'block',
        },
        textarea: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'vertical',
            transition: 'border-color 0.2s ease',
        },
        textareaFocus: {
            outline: 'none',
            borderColor: '#007bff',
            boxShadow: '0 0 5px rgba(0, 123, 255, 0.3)',
        },
        modalBtnGroup: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
        },
        btn: {
            padding: '10px 20px',
            fontSize: '1rem',
            fontWeight: 500,
            borderRadius: '8px',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
        },
        btnPrimary: {
            backgroundColor: '#007bff',
            border: 'none',
            color: '#fff',
        },
        btnPrimaryHover: {
            backgroundColor: '#0056b3',
            transform: 'translateY(-1px)',
        },
        btnSecondary: {
            backgroundColor: '#6c757d',
            border: 'none',
            color: '#fff',
        },
        btnSecondaryHover: {
            backgroundColor: '#5a6268',
            transform: 'translateY(-1px)',
        },

    };
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { bookingWarrantyId, stepsForCurrentUser } = useBookingWarrantyParams();
    const { user } = useSelector((state) => state.auth);
    const { warranty, loading, error } = useSelector((state) => state.warranty);
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const [solutionNote, setSolutionNote] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);


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
        if (isChecking && isAuthorized === false) {
            const redirectPath = location.state?.from?.pathname || '/';
            toast.warn(` ${authError || 'Bạn không có quyền truy cập trang này.'}`, {
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
                dispatch(getWarrantyInformationThunk(bookingWarrantyId));

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

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!bookingWarrantyId) {
            toast.error('Thiếu thông tin booking hoặc kỹ thuật viên!', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }
        try {
            const formData = { status: 'DONE' };
            await dispatch(confirmWarrantyThunk({ bookingWarrantyId, formData })).unwrap();
            toast.success('Bảo hành đã được đánh dấu là hoàn tất!', {
                position: 'top-right',
                autoClose: 5000,
            });
            setShowResolveModal(false);
            setSolutionNote('');
            handleWarrantyUpdated();
        } catch (error) {
            toast.error(`Lỗi khi xác nhận giải quyết bảo hành: ${error || 'Đã xảy ra lỗi'}`, {
                position: 'top-right',
                autoClose: 5000,
            });
        }

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
            setShowResolveModal(false);
            setSolutionNote('');
            handleWarrantyUpdated();
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
                    <BookingWizard steps={stepsForCurrentUser} activeStep={4} />
                    <div className="booking-detail-info">
                        <div className={`row ${!warranty?.bookingId?._id || !(warranty?.bookingId?.isChatAllowed && warranty?.bookingId?.isVideoCallAllowed) ? 'equal-height-row' : ''}`}>
                            <div className="col-lg-6">
                                <BookingWarrantyDetails
                                    bookingWarrantyId={bookingWarrantyId}
                                    onWarrantyUpdated={handleWarrantyUpdated}
                                />
                                {(warranty?.bookingId?._id && (warranty?.bookingId?.isChatAllowed && warranty?.bookingId?.isVideoCallAllowed)) && (
                                    <BookingWarrantySchedule
                                        bookingWarrantyId={bookingWarrantyId}
                                        onWarrantyUpdated={handleWarrantyUpdated}
                                    />
                                )}
                            </div>
                            <div className="col-lg-6">
                                {warranty?.bookingId?._id && (warranty?.bookingId?.isChatAllowed && warranty?.bookingId?.isVideoCallAllowed) ? (
                                    <MessageBox
                                        bookingId={warranty?.bookingId._id}
                                        bookingWarrantyId={bookingWarrantyId}
                                    />
                                ) : (
                                    <BookingWarrantySchedule
                                        bookingWarrantyId={bookingWarrantyId}
                                        onWarrantyUpdated={handleWarrantyUpdated}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-end my-4">
                        {user?.role?.name === 'CUSTOMER' && warranty.proposedSchedule && warranty.confirmedSchedule && warranty.status === 'CONFIRMED' && (
                            <button
                                className="btn btn-primary me-2"
                                onClick={handleConfirm}
                            >
                                Xác nhận bảo hành thành công
                            </button>
                        )}
                        {user?.role?.name === 'TECHNICIAN' && warranty.status === 'DONE' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowResolveModal(true)}
                            >
                                Đánh dấu bảo hành hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for resolving warranty */}
            <Modal
                show={showResolveModal}
                onHide={() => {
                    setShowResolveModal(false);
                    setSolutionNote('');
                }}
                centered
            >
                <Modal.Header style={styles.modalHeader}>
                    <Modal.Title style={styles.modalTitleH4}>Đánh dấu bảo hành hoàn tất</Modal.Title>
                    <Button
                        variant="link"
                        style={styles.closeBtn}
                        onClick={() => {
                            setShowResolveModal(false);
                            setSolutionNote('');
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = styles.closeBtnHover.color)}
                        onMouseOut={(e) => (e.currentTarget.style.color = styles.closeBtn.color)}
                    >
                        <i className="ti ti-x fs-16"></i>
                    </Button>
                </Modal.Header>
                <Modal.Body style={styles.modalBody}>
                    <form onSubmit={handleResolveWarranty}>
                        <div style={styles.modalFormGroup}>
                            <label style={styles.formLabel}>
                                Ghi chú giải pháp <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <textarea
                                style={styles.textarea}
                                value={solutionNote}
                                onChange={(e) => setSolutionNote(e.target.value)}
                                placeholder="Mô tả giải pháp đã thực hiện..."
                                rows="4"

                                onFocus={(e) => Object.assign(e.target.style, styles.textareaFocus)}
                                onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
                            />
                        </div>
                        <div style={styles.modalBtnGroup}>
                            <Button
                                style={{ ...styles.btn, ...styles.btnSecondary }}
                                onClick={() => {
                                    setShowResolveModal(false);
                                    setSolutionNote('');
                                }}
                                onMouseOver={(e) => Object.assign(e.target.style, styles.btnSecondaryHover)}
                                onMouseOut={(e) => Object.assign(e.target.style, styles.btnSecondary)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                                onMouseOver={(e) => Object.assign(e.target.style, styles.btnPrimaryHover)}
                                onMouseOut={(e) => Object.assign(e.target.style, styles.btnPrimary)}
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default BookingWarranty;