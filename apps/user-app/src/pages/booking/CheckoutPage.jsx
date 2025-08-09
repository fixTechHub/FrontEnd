import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { finalizeBookingThunk } from '../../features/transactions/transactionSlice'
import { fetchBookingById, getAcceptedBookingThunk } from '../../features/bookings/bookingSlice';
import { toast } from 'react-toastify';
import Accordion from 'react-bootstrap/Accordion';
import BookingWizard from "./common/BookingHeader";
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { checkOutCustomerAccess } from "../../hooks/checkBookingAccess";
import { formatCurrency } from '../../utils/formatDuration';
import { formatDateOnly, formatDate, formatTimeOnly } from '../../utils/formatDate';
import { Modal, Button, Card } from 'react-bootstrap';
import { useBookingParams } from '../../hooks/useBookingParams';
const CouponModal = ({ show, onHide, coupons, onSelectCoupon, subTotal }) => {
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const handleSelect = (coupon) => {
        setSelectedCoupon(coupon);
    };

    const getDiscountExplanation = (coupon) => {
        if (coupon.type === 'PERCENT' && coupon.maxDiscount) {
            const potentialDiscount = subTotal * (coupon.value / 100);
            if (potentialDiscount > coupon.maxDiscount) {
                return `Discount capped at ${formatCurrency(coupon.maxDiscount)} VND (original ${coupon.value}% would be ${formatCurrency(potentialDiscount)} VND)`;
            }
        }
        return null;
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            style={{
                fontFamily: 'Arial, sans-serif',
                backdropFilter: 'blur(5px)'
            }}
        >
            <Modal.Header
                closeButton
                style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #ff6200',
                    borderRadius: '10px 10px 0 0'
                }}
            >
                <Modal.Title style={{
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <i className="bx bxs-coupon" style={{ color: '#ff6200', fontSize: '24px' }}></i>
                    Chọn Mã Giảm Giá
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
                padding: '25px',
                backgroundColor: '#fafafa'
            }}>
                {coupons?.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '2px dashed #ddd'
                    }}>
                        <i className="bx bx-info-circle" style={{ fontSize: '48px', color: '#ccc', marginBottom: '15px' }}></i>
                        <p style={{ color: '#666', fontSize: '16px', margin: '0' }}>Không có mã giảm giá nào khả dụng.</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                        {coupons?.map((coupon) => (
                            <Card
                                key={coupon._id}
                                className={selectedCoupon?._id === coupon._id ? 'border-primary shadow-sm' : 'border-light'}
                                style={{
                                    marginBottom: '15px',
                                    borderRadius: '12px',
                                    border: selectedCoupon?._id === coupon._id ? '2px solid #ff6200' : '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: selectedCoupon?._id === coupon._id ? 'translateY(-2px)' : 'none',
                                    boxShadow: selectedCoupon?._id === coupon._id ? '0 8px 25px rgba(255, 98, 0, 0.15)' : '0 2px 10px rgba(0,0,0,0.08)',
                                    background: selectedCoupon?._id === coupon._id ? 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)' : '#ffffff'
                                }}
                                onClick={() => handleSelect(coupon)}
                                onMouseEnter={(e) => {
                                    if (selectedCoupon?._id !== coupon._id) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedCoupon?._id !== coupon._id) {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                                    }
                                }}
                            >
                                <Card.Body style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: '#ff6200',
                                                        color: 'white',
                                                        fontSize: '13px',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontWeight: '600',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {coupon.code}
                                                </span>
                                                {selectedCoupon?._id === coupon._id && (
                                                    <i className="bx bx-check-circle" style={{ color: '#28a745', fontSize: '20px' }}></i>
                                                )}
                                            </div>
                                            <p style={{
                                                color: '#28a745',
                                                fontSize: '18px',
                                                margin: '0',
                                                fontWeight: '700'
                                            }}>
                                                Giảm {coupon.type === 'PERCENT' ? `${coupon.value}%` : `${formatCurrency(coupon.value)} VND`}
                                            </p>
                                        </div>
                                        <Button
                                            variant={selectedCoupon?._id === coupon._id ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '25px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                backgroundColor: selectedCoupon?._id === coupon._id ? '#ff6200' : 'transparent',
                                                borderColor: '#ff6200',
                                                color: selectedCoupon?._id === coupon._id ? 'white' : '#ff6200',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectCoupon(coupon);
                                                onHide();
                                            }}
                                        >
                                            {selectedCoupon?._id === coupon._id ? 'Đã chọn' : 'Chọn'}
                                        </Button>
                                    </div>
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '15px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong style={{ color: '#495057', fontSize: '13px' }}>Mô tả:</strong>
                                            <span style={{ color: '#6c757d', fontSize: '13px', marginLeft: '5px' }}>
                                                {coupon.description || 'Không có mô tả'}
                                            </span>
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong style={{ color: '#495057', fontSize: '13px' }}>Giá trị đơn hàng tối thiểu:</strong>
                                            <span style={{
                                                color: coupon.minOrderValue ? '#dc3545' : '#28a745',
                                                fontSize: '13px',
                                                marginLeft: '5px',
                                                fontWeight: '600'
                                            }}>
                                                {coupon.minOrderValue ? `${formatCurrency(coupon.minOrderValue)} VND` : 'Không yêu cầu'}
                                            </span>
                                        </div>
                                        {getDiscountExplanation(coupon) && (
                                            <div style={{ marginBottom: '8px' }}>
                                                <strong style={{ color: '#495057', fontSize: '13px' }}>Lưu ý:</strong>
                                                <span style={{ color: '#dc3545', fontSize: '13px', marginLeft: '5px' }}>
                                                    {getDiscountExplanation(coupon)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={{
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #dee2e6',
                borderRadius: '0 0 10px 10px',
                padding: '20px'
            }}>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        borderRadius: '25px',
                        fontWeight: '600'
                    }}
                >
                    Đóng
                </Button>
                {selectedCoupon && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            onSelectCoupon(selectedCoupon);
                            onHide();
                        }}
                        style={{
                            padding: '8px 20px',
                            fontSize: '14px',
                            borderRadius: '25px',
                            fontWeight: '600',
                            backgroundColor: '#ff6200',
                            borderColor: '#ff6200'
                        }}
                    >
                        Xác nhận
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

// Status color mapping function
const getStatusColor = (status) => {
    const statusColors = {
        'PENDING': '#ffc107',
        'CONFIRMED': '#17a2b8',
        'IN_PROGRESS': '#fd7e14',
        'COMPLETED': '#28a745',
        'CANCELLED': '#dc3545',
        'ACCEPTED': '#20c997',
        'REJECTED': '#FF0000',
        'QUOTE_PROVIDED': '#0d6efd',
        'AWAITING_PAYMENT': '#e83e8c',
        'PAID': '#198754'
    };
    return statusColors[status] || '#6c757d';
};

// Status badge component
const CheckoutPage = () => {
    const dispatch = useDispatch();
    const { acceptedBooking, userCoupons, loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('PAYOS');
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const [showCouponDropdown, setShowCouponDropdown] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState({});
    const [expandedNotes2, setExpandedNotes2] = useState({});
    const [showCouponModal, setShowCouponModal] = useState(false);
    const navigate = useNavigate();
    const [isAuthorize, setIsAuthorize] = useState(null);
    const [authError, setAuthError] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    let discount = 0;

    useEffect(() => {
        const fetchBookingData = async () => {
            if (!bookingId) return;

            try {
                await dispatch(getAcceptedBookingThunk(bookingId)).unwrap();
            } catch (error) {
                toast.error(error.message || 'Có lỗi xảy ra khi tải thông tin đặt lịch');
            }
        };

        fetchBookingData();
    }, [dispatch, bookingId]);

    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingId || !user?._id) {
                setAuthError("Missing booking ID or user information");
                setIsAuthorize(false);
                setIsChecking(true);
                return;
            }

            const { acceptedBooking, isAuthorized, error } = await checkOutCustomerAccess(dispatch, bookingId, user._id);
            setIsAuthorize(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
        };

        verifyAccess();
    }, [dispatch, bookingId, user?._id]);

    useEffect(() => {
        if (isChecking) return;
        if (isAuthorize === false) {
            toast.error("Bạn không có quyền truy cập trang này.");
            const redirectPath = location.state?.from?.pathname || '/';
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthorize, isChecking, navigate]);

    const itemsTotal = acceptedBooking?.quote?.items?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;
    const laborPrice = acceptedBooking?.quote?.laborPrice || 0;
    const subTotal = acceptedBooking?.quote?.totalAmount || (laborPrice + itemsTotal);

    const handleApplyCouponModal = (e) => {
        e.preventDefault();
        if (paymentMethod === 'CASH') {
            toast.info('Mã giảm giá không áp dụng cho thanh toán tiền mặt.');
            return;
        }
        setShowCouponModal(true);
    };

    const handleSelectCoupon = (coupon) => {
        if (subTotal < (coupon.minOrderValue || 0)) {
            toast.error(`Đơn hàng phải có giá trị tối thiểu ${formatCurrency(coupon.minOrderValue)} VND để sử dụng mã giảm giá này.`);
            return;
        }
        setSelectedCouponId(coupon._id);
        setAppliedCoupon(coupon);
        toast.success('Mã giảm giá đã được áp dụng thành công!');
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setSelectedCouponId('');
        toast.info('Mã giảm giá đã được xóa.');
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method === 'CASH') {
            if (appliedCoupon) {
                setAppliedCoupon(null);
                setSelectedCouponId('');
                toast.info('Mã giảm giá đã được gỡ bỏ vì không áp dụng cho thanh toán tiền mặt.');
            } else if (selectedCouponId) {
                setSelectedCouponId('');
                toast.info('Lựa chọn mã giảm giá đã được hủy vì không áp dụng cho thanh toán tiền mặt.');
            }
        }
    };

    const handleContinueBooking = async () => {
        if (!acceptedBooking || isProcessing) {
            console.log('Early return - booking or isProcessing check failed');
            return;
        }

        setIsProcessing(true);

        if (appliedCoupon) {
            if (appliedCoupon.type === 'PERCENT') {
                discount = subTotal * (appliedCoupon.value / 100);
                if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                    discount = appliedCoupon.maxDiscount;
                }
            } else if (appliedCoupon.type === 'FIXED') {
                discount = appliedCoupon.value;
            }
        }

        const newFinalPrice = subTotal - discount;

        try {
            const resultAction = await dispatch(finalizeBookingThunk({
                bookingId: bookingId,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discountValue: discount,
                finalPrice: newFinalPrice,
                paymentMethod: paymentMethod
            })).unwrap();

            console.log('finalizeBookingThunk result:', resultAction);

            if (paymentMethod === 'PAYOS') {
                const paymentUrl = resultAction.data.paymentUrl;
                if (paymentUrl) {
                    console.log('Redirecting to PayOS URL:', paymentUrl);
                    window.location.href = paymentUrl;
                } else {
                    console.error('No payment URL received from PayOS');
                    toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
                }
            } else if (paymentMethod === 'CASH') {
                toast.success('Thanh toán bằng tiền mặt thành công! Vui lòng đánh giá kỹ thuật viên.');
                navigate(`/feedback/submit/${bookingId}`);
            }

        } catch (err) {
            console.error('Payment error:', err);
            toast.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (appliedCoupon) {
        if (appliedCoupon.type === 'PERCENT') {
            discount = subTotal * (appliedCoupon.value / 100);
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
                discount = appliedCoupon.maxDiscount;
            }
        } else if (appliedCoupon.type === 'FIXED') {
            discount = appliedCoupon.value;
        }
    }

    const getDiscountExplanation = () => {
        if (appliedCoupon && appliedCoupon.type === 'PERCENT' && appliedCoupon.maxDiscount) {
            const potentialDiscount = subTotal * (appliedCoupon.value / 100);
            if (potentialDiscount > appliedCoupon.maxDiscount) {
                return `Giảm giá bị giới hạn ở ${formatCurrency(appliedCoupon.maxDiscount)} VND (giá trị giảm ${appliedCoupon.value}% ban đầu sẽ là ${formatCurrency(potentialDiscount)} VND)`;
            }
        }
        return null;
    };

    const estimatedTotal = subTotal - discount;

    if (bookingLoading || !isChecking || isAuthorize === false) {
        return null;
    }

    if (bookingError) {
        return <div className="alert alert-danger">Error: {bookingError}</div>;
    }

    return (
        <>
            <Header />
            <BreadcrumbBar title='Thanh toán' subtitle={'Payment'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={4} />

                    <div className="booking-detail-info pt-0">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    {/* Enhanced Booking Items Card */}
                                    <div
                                        className="booking-information-card"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '15px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #f0f0f0',
                                            marginBottom: '25px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <div
                                            className="booking-info-head"
                                            style={{
                                                background: '#FFA633',
                                                padding: '20px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px'
                                            }}
                                        >
                                            <span style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                padding: '10px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="bx bxs-package" style={{ fontSize: '24px' }}></i>
                                            </span>
                                            <h5 style={{ margin: '0', fontSize: '20px', fontWeight: '600' }}>Vật liệu</h5>
                                        </div>
                                        <div className="booking-info-body" style={{ padding: '25px' }}>
                                            <ul className="adons-lists" style={{ listStyle: 'none', padding: '0', margin: '0' }}>

                                                {acceptedBooking?.quote?.items?.length > 0 ? (
                                                    acceptedBooking.quote.items.map((item, index) => (
                                                        <li
                                                            key={item.name}
                                                            style={{
                                                                marginBottom: '20px',
                                                                padding: '20px',
                                                                backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                                                                borderRadius: '12px',
                                                                border: '1px solid #e9ecef',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#f0f8ff';
                                                                e.currentTarget.style.borderColor = '#ff6200';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#ffffff';
                                                                e.currentTarget.style.borderColor = '#e9ecef';
                                                            }}
                                                        >
                                                            <div className="adons-types">
                                                                <div className="d-flex align-items-center adon-name-info justify-content-between">
                                                                    <div className="adon-name" style={{ flex: 1 }}>
                                                                        <h6 style={{
                                                                            margin: '0 0 8px 0',
                                                                            color: '#2c3e50',
                                                                            fontSize: '16px',
                                                                            fontWeight: '600',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '10px'
                                                                        }}>
                                                                            <i className="bx bx-wrench" style={{ color: '#ff6200', fontSize: '18px' }}></i>
                                                                            {item.name}
                                                                            {item.quantity > 1 && (
                                                                                <span style={{
                                                                                    backgroundColor: '#ff6200',
                                                                                    color: 'white',
                                                                                    padding: '2px 8px',
                                                                                    borderRadius: '12px',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: '600'
                                                                                }}>
                                                                                    x{item.quantity}
                                                                                </span>
                                                                            )}
                                                                            {item.note && (
                                                                                <i
                                                                                    className="bx bx-info-circle"
                                                                                    style={{
                                                                                        color: '#17a2b8',
                                                                                        cursor: 'pointer',
                                                                                        fontSize: '18px',
                                                                                        transition: 'color 0.3s ease'
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        setExpandedNotes(prev => ({
                                                                                            ...prev,
                                                                                            [item.name]: !prev[item.name]
                                                                                        }));
                                                                                    }}
                                                                                    onMouseEnter={(e) => e.target.style.color = '#ff6200'}
                                                                                    onMouseLeave={(e) => e.target.style.color = '#17a2b8'}
                                                                                />
                                                                            )}
                                                                        </h6>
                                                                        {item.status && (
                                                                            <span
                                                                                className="badge"
                                                                                style={{
                                                                                    backgroundColor: getStatusColor(item.status),
                                                                                    color: 'white',
                                                                                    fontSize: '11px',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: '12px',
                                                                                    fontWeight: '600',
                                                                                    marginLeft: '8px',
                                                                                    textTransform: 'uppercase',
                                                                                    letterSpacing: '0.5px'
                                                                                }}
                                                                            >
                                                                                {{
                                                                                    PENDING: 'Đang chờ',
                                                                                    CONFIRMED: 'Xác nhận',
                                                                                    IN_PROGRESS: 'Đang thực hiện',
                                                                                    COMPLETED: 'Hoàn thành',
                                                                                    CANCELLED: 'Hủy',
                                                                                    ACCEPTED: 'Đồng ý',
                                                                                    REJECTED: 'Từ chối',
                                                                                    QUOTE_PROVIDED: 'Đã báo giá',
                                                                                    AWAITING_PAYMENT: 'Chờ thanh toán',
                                                                                    PAID: 'Đã thanh toán'
                                                                                }[item.status] || item.status}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        className="adon-price"
                                                                        style={{
                                                                            fontSize: '18px',
                                                                            fontWeight: '700',
                                                                            color: item.status === 'REJECTED' ? '#dc3545' : '#28a745',
                                                                            backgroundColor: item.status === 'REJECTED' ? '#f8d7da' : '#e8f5e8',
                                                                            padding: '8px 15px',
                                                                            borderRadius: '25px',
                                                                            textDecoration: item.status === 'REJECTED' ? 'line-through' : 'none'
                                                                        }}
                                                                    >
                                                                        {formatCurrency(item.price * (item.quantity || 1))} VND
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {item.note && expandedNotes[item.name] && (
                                                                <div
                                                                    className="more-adon-info mt-3"
                                                                    style={{
                                                                        padding: '15px',
                                                                        backgroundColor: '#e3f2fd',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #2196f3',
                                                                        animation: 'fadeIn 0.3s ease'
                                                                    }}
                                                                >
                                                                    <div className='d-flex align-items-center'>
                                                                        <i className="bx bx-note" style={{ color: '#2196f3', marginRight: '8px' }}></i>
                                                                        <span style={{
                                                                            color: '#1565c0',
                                                                            fontSize: '14px',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            {item.note}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <p style={{ color: '#999', fontStyle: 'italic' }}>Không có</p>
                                                )}

                                            </ul>
                                        </div>
                                    </div>

                                    {/* Enhanced Booking Details Card */}
                                    <div
                                        className="booking-information-card"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '15px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #f0f0f0',
                                            marginBottom: '25px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <div
                                            className="booking-info-head"
                                            style={{
                                                background: ' #FFA633',
                                                padding: '20px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px'
                                            }}
                                        >
                                            <span style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                padding: '10px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="bx bxs-credit-card" style={{ fontSize: '24px' }}></i>
                                            </span>
                                            <h5 style={{ margin: '0', fontSize: '20px', fontWeight: '600' }}>Thông tin đơn</h5>
                                        </div>
                                        <div className="booking-info-body" style={{ padding: '25px' }}>
                                            <ul className="adons-lists" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                                                <li>
                                                    <div
                                                        className="adons-types"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '15px 0',
                                                            borderBottom: '1px solid #eee',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div className="adon-name" style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                                                            <i className="bx bx-map" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                            Địa Chỉ
                                                        </div>
                                                        <span style={{ color: '#495057', fontSize: '14px' }}>{acceptedBooking?.location?.address || 'Chưa có thông tin'}</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className="adons-types"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '15px 0',
                                                            borderBottom: '1px solid #eee',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div className="adon-name" style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                                                            <i className="bx bx-calendar" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                            Ngày Sửa Chửa
                                                        </div>
                                                        <span style={{ color: '#495057', fontSize: '14px' }}>{formatDateOnly(acceptedBooking?.schedule?.startTime) || 'Chưa xác định'}</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className="adons-types"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '15px 0',
                                                            borderBottom: '1px solid #eee',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div className="adon-name" style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                                                            <i className="bx bx-time" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                            Thời Gian Dự Kiến
                                                        </div>
                                                        <span style={{ color: '#495057', fontSize: '14px' }}>
                                                            {formatTimeOnly(acceptedBooking?.schedule?.startTime)} - {formatTimeOnly(acceptedBooking?.schedule?.expectedEndTime) || 'Chưa xác định'}
                                                        </span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className="adons-types"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '15px 0',
                                                            borderBottom: '1px solid #eee',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div className="adon-name" style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                                                            <i className="bx bx-shield" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                            Thời Hạn Bảo Hành
                                                        </div>
                                                        <span style={{ color: '#495057', fontSize: '14px' }}>{acceptedBooking?.quote?.warrantiesDuration || 30} Tháng</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className="adons-types"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '15px 0',
                                                            borderBottom: 'none',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div className="adon-name" style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                                                            <i className="bx bx-note" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                            Ghi Chú
                                                            {acceptedBooking?.description && (
                                                                <i
                                                                    className="bx bx-info-circle"
                                                                    style={{
                                                                        marginLeft: '8px',
                                                                        cursor: 'pointer',
                                                                        color: '#17a2b8',
                                                                        fontSize: '18px',
                                                                        transition: 'color 0.3s ease'
                                                                    }}
                                                                    onClick={() => {
                                                                        setExpandedNotes2(prev => ({
                                                                            ...prev,
                                                                            ['description']: !prev['description']
                                                                        }));
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.color = '#ff6200'}
                                                                    onMouseLeave={(e) => e.target.style.color = '#17a2b8'}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {acceptedBooking?.description && expandedNotes2['description'] && (
                                                        <div
                                                            className="more-adon-info mt-3"
                                                            style={{
                                                                padding: '15px',
                                                                backgroundColor: '#e3f2fd',
                                                                borderRadius: '8px',
                                                                borderLeft: '4px solid #2196f3',
                                                                animation: 'fadeIn 0.3s ease'
                                                            }}
                                                        >
                                                            <span style={{ color: '#1565c0', fontSize: '14px' }}>{acceptedBooking.description}</span>
                                                        </div>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Enhanced Payment Method Card */}
                                    <div
                                        className="booking-sidebar-card"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '15px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #f0f0f0',
                                            marginBottom: '25px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <div
                                            className="booking-info-head"
                                            style={{
                                                background: '#FFA633',
                                                padding: '20px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '15px'
                                            }}
                                        >
                                            <span style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                padding: '10px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="bx bxs-wallet" style={{ fontSize: '24px' }}></i>
                                            </span>
                                            <h5 style={{ margin: '0', fontSize: '20px', fontWeight: '600' }}>Phương thức thanh toán</h5>
                                        </div>
                                        <div className="booking-info-body" style={{ padding: '25px' }}>
                                            <div className="payment-method-options row" style={{ margin: '0 -10px' }}>
                                                <div className="col-md-6 mb-3" style={{ padding: '0 10px' }}>
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'PAYOS' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('PAYOS')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            border: paymentMethod === 'PAYOS' ? '2px solid #ff6200' : '1px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: paymentMethod === 'PAYOS' ? '0 4px 15px rgba(255, 98, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.08)',
                                                            background: paymentMethod === 'PAYOS' ? 'linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)' : '#ffffff'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (paymentMethod !== 'PAYOS') {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.12)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (paymentMethod !== 'PAYOS') {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
                                                            }
                                                        }}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '20px' }}>
                                                            <i className="bx bx-credit-card mb-3" style={{ fontSize: '2.5rem', color: '#ff6200' }}></i>
                                                            <h6 style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600', margin: '0' }}>Thanh toán trực tuyến</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3" style={{ padding: '0 10px' }}>
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('CASH')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            border: paymentMethod === 'CASH' ? '2px solid #28a745' : '1px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: paymentMethod === 'CASH' ? '0 4px 15px rgba(40, 167, 69, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.08)',
                                                            background: paymentMethod === 'CASH' ? 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)' : '#ffffff'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (paymentMethod !== 'CASH') {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.12)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (paymentMethod !== 'CASH') {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
                                                            }
                                                        }}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '20px' }}>
                                                            <i className="bx bx-money mb-3" style={{ fontSize: '2.5rem', color: '#28a745' }}></i>
                                                            <h6 style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600', margin: '0' }}>Thanh toán tiền mặt</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 theiaStickySidebar">
                                <div className="booking-sidebar" style={{ fontFamily: 'Arial, sans-serif' }}>
                                    <Accordion defaultActiveKey="0" alwaysOpen className="custom-accordion">
                                        {/* Technician Information */}
                                        <div className="custom-accordion-board">
                                            <Accordion.Item
                                                eventKey="0"
                                                className="booking-sidebar-card border-0 mb-4"
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '15px',
                                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                                    border: '1px solid #f0f0f0',
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                                }}
                                            >
                                                <Accordion.Header>
                                                    <h5 style={{
                                                        color: '#2c3e50',
                                                        margin: '0',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px'
                                                    }}>
                                                        <i className="bx bx-user" style={{ color: '#ff6200', fontSize: '20px' }}></i>
                                                        Kỹ Thuật Viên
                                                    </h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '20px' }}>
                                                    <div className="booking-car-detail" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <span className="car-img">
                                                            <img
                                                                src={acceptedBooking?.technicianId?.userId?.avatar || '/img/profiles/avatar-02.jpg'}
                                                                className="img-fluid rounded-circle"
                                                                alt="Thợ"
                                                                style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #ff6200' }}
                                                            />
                                                        </span>
                                                        <div className="care-more-info">
                                                            <h5 style={{ color: '#2c3e50', fontSize: '16px', fontWeight: '600', margin: '0' }}>
                                                                {acceptedBooking?.technicianId?.userId?.fullName || 'Tên Thợ'}
                                                            </h5>
                                                            <div className="rating mt-2" style={{ color: '#ff9800' }}>
                                                                {[...Array(5)].map((_, index) => {
                                                                    const rating = acceptedBooking?.technicianId?.ratingAverage || 0;
                                                                    const fullStars = Math.floor(rating);
                                                                    const hasHalfStar = rating % 1 >= 0.5;
                                                                    if (index < fullStars) {
                                                                        return <i key={index} className="fas fa-star filled" style={{ fontSize: '14px' }}></i>;
                                                                    } else if (index === fullStars && hasHalfStar) {
                                                                        return <i key={index} className="fas fa-star-half-stroke filled" style={{ fontSize: '14px' }}></i>;
                                                                    } else {
                                                                        return <i key={index} className="far fa-star" style={{ fontSize: '14px' }}></i>;
                                                                    }
                                                                })}
                                                                <span style={{ color: '#6c757d', fontSize: '13px', marginLeft: '5px' }}>
                                                                    {acceptedBooking?.technicianId?.jobCompleted || 0} công việc
                                                                </span>
                                                            </div>
                                                            <div className="technician-info mt-2">
                                                                {!acceptedBooking?.quote?.totalAmount && (
                                                                    <p style={{ color: '#495057', fontSize: '14px', margin: '5px 0' }}>
                                                                        <strong>Phí khảo sát:</strong> {formatCurrency(acceptedBooking?.technicianId?.inspectionFee || 0)} VND
                                                                    </p>
                                                                )}
                                                                <p style={{ color: '#495057', fontSize: '14px', margin: '5px 0' }}>
                                                                    <strong>Kinh nghiệm:</strong> {acceptedBooking?.technicianId?.experienceYears || 0} năm
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>

                                        {/* Coupon Section */}
                                        <div className="custom-accordion-board">
                                            <Accordion.Item
                                                eventKey="1"
                                                className="booking-sidebar-card border-0 mb-4"
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '15px',
                                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                                    border: '1px solid #f0f0f0',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Accordion.Header>
                                                    <h5 style={{
                                                        color: '#2c3e50',
                                                        margin: '0',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px'
                                                    }}>
                                                        <i className="bx bxs-coupon" style={{ color: '#ff6200', fontSize: '20px' }}></i>
                                                        Mã Giảm Giá
                                                    </h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '20px' }}>
                                                    {paymentMethod === 'CASH' ? (
                                                        <div
                                                            className="alert alert-warning"
                                                            role="alert"
                                                            style={{
                                                                padding: '15px',
                                                                fontSize: '14px',
                                                                backgroundColor: '#fff3cd',
                                                                borderColor: '#ffecb5',
                                                                borderRadius: '8px'
                                                            }}
                                                        >
                                                            Mã giảm giá không áp dụng cho phương thức thanh toán tiền mặt.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="dropdown me-2 mb-2">
                                                                <button
                                                                    className="dropdown-toggle btn btn-outline-secondary d-inline-flex align-items-center"
                                                                    onClick={handleApplyCouponModal}
                                                                    style={{
                                                                        padding: '8px 15px',
                                                                        fontSize: '14px',
                                                                        borderRadius: '25px',
                                                                        borderColor: '#ff6200',
                                                                        color: '#ff6200',
                                                                        fontWeight: '600',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.backgroundColor = '#ff6200';
                                                                        e.target.style.color = 'white';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.backgroundColor = 'transparent';
                                                                        e.target.style.color = '#ff6200';
                                                                    }}
                                                                >
                                                                    <i className="bx bxs-coupon me-2" style={{ fontSize: '16px' }}></i>
                                                                    {appliedCoupon
                                                                        ? `${appliedCoupon.code}`
                                                                        : selectedCouponId
                                                                            ? `${userCoupons.find(c => c._id === selectedCouponId)?.code}`
                                                                            : 'Chọn mã giảm giá'}
                                                                </button>
                                                            </div>
                                                            {appliedCoupon && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm mt-2"
                                                                    onClick={handleRemoveCoupon}
                                                                    style={{
                                                                        padding: '8px 15px',
                                                                        fontSize: '14px',
                                                                        borderRadius: '25px',
                                                                        fontWeight: '600'
                                                                    }}
                                                                >
                                                                    Gỡ
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>

                                        {/* Coupon Modal */}
                                        <CouponModal
                                            show={showCouponModal}
                                            onHide={() => setShowCouponModal(false)}
                                            coupons={userCoupons}
                                            onSelectCoupon={handleSelectCoupon}
                                            subTotal={subTotal}
                                        />

                                        {/* Price Summary */}
                                        <div className="custom-accordion-board">
                                            <Accordion.Item
                                                eventKey="2"
                                                className="booking-sidebar-card border-0 mb-4"
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '15px',
                                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                                    border: '1px solid #f0f0f0',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Accordion.Header>
                                                    <h5 style={{
                                                        color: '#2c3e50',
                                                        margin: '0',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px'
                                                    }}>
                                                        <i className="bx bx-wallet" style={{ color: '#ff6200', fontSize: '20px' }}></i>
                                                        Giá
                                                    </h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '20px' }}>
                                                    <ul className="location-address-info" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                                                        {acceptedBooking?.quote?.laborPrice > 0 && (
                                                            <li style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '10px 0',
                                                                borderBottom: '1px solid #e9ecef',
                                                                alignItems: 'center'
                                                            }}>
                                                                <h6 style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600', margin: '0' }}>
                                                                    <i className="bx bx-wrench" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                                    Tiền Công
                                                                </h6>
                                                                <p style={{ color: '#495057', fontSize: '14px', fontWeight: '600', margin: '0' }}>
                                                                    {formatCurrency(laborPrice)} VND
                                                                </p>
                                                            </li>
                                                        )}
                                                        <li style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            padding: '10px 0',
                                                            borderBottom: '1px solid #e9ecef',
                                                            alignItems: 'center'
                                                        }}>
                                                            <h6 style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600', margin: '0' }}>
                                                                <i className="bx bx-cart" style={{ color: '#ff6200', marginRight: '8px' }}></i>
                                                                Tổng Tiền
                                                            </h6>
                                                            <p style={{ color: '#495057', fontSize: '14px', fontWeight: '600', margin: '0' }}>
                                                                {formatCurrency(subTotal)} VND
                                                            </p>
                                                        </li>
                                                        {appliedCoupon && (
                                                            <>
                                                                <li style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    padding: '10px 0',
                                                                    color: '#28a745',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <h6 style={{ fontSize: '15px', fontWeight: '600', margin: '0' }}>
                                                                        <i className="bx bxs-coupon" style={{ marginRight: '8px' }}></i>
                                                                        Mã Giảm Giá: {appliedCoupon.code}
                                                                    </h6>
                                                                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '0' }}>
                                                                        -{appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.value}%` : `${formatCurrency(appliedCoupon.value)} VND`}
                                                                    </p>
                                                                </li>
                                                                {getDiscountExplanation() && (
                                                                    <li style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        padding: '10px 0',
                                                                        color: '#dc3545',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <p style={{ fontSize: '13px', margin: '0' }}>
                                                                            {getDiscountExplanation()}
                                                                        </p>
                                                                    </li>
                                                                )}
                                                            </>
                                                        )}
                                                    </ul>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                    </Accordion>

                                    {/* Total Price Card */}
                                    <div
                                        className="total-rate-card"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '15px',
                                            padding: '20px',
                                            marginTop: '20px',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <h5 style={{
                                                color: '#2c3e50',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                margin: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <i className="bx bx-wallet" style={{ color: '#ff6200', fontSize: '20px' }}></i>
                                                Tổng Tạm Tính
                                            </h5>
                                            <h6 style={{
                                                color: '#ff6200',
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                margin: '0',
                                                backgroundColor: '#fff5f0',
                                                padding: '8px 15px',
                                                borderRadius: '25px'
                                            }}>
                                                {formatCurrency(estimatedTotal)} VND
                                            </h6>
                                        </div>
                                    </div>

                                    {/* Continue Booking Button */}
                                    <div
                                        className="booking-info-btns d-flex justify-content-end"
                                        style={{ marginTop: '20px' }}
                                    >
                                        <button
                                            className="btn btn-primary continue-book-btn"
                                            onClick={handleContinueBooking}
                                            disabled={!acceptedBooking || isProcessing || !paymentMethod}
                                            style={{
                                                padding: '12px 25px',
                                                fontSize: '15px',
                                                borderRadius: '25px',
                                                backgroundColor: '#FFA633',
                                                borderColor: '#ff6200',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#e65b00';
                                                e.target.style.borderColor = '#e65b00';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#ff6200';
                                                e.target.style.borderColor = '#ff6200';
                                            }}
                                            type="submit"
                                        >
                                            {isProcessing ? (
                                                <span>
                                                    <i className="bx bx-loader-alt bx-spin me-2"></i>
                                                    Đang xử lý...
                                                </span>
                                            ) : (
                                                'Thanh Toán'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CheckoutPage;