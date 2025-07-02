import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAcceptedBookingPriceThunk } from '../../features/booking-prices/bookingPriceSlice';
import { finalizeBookingThunk } from '../../features/transactions/transactionSlice'
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { toast } from 'react-toastify';
import { useBookingParams } from '../../hooks/useBookingParams';
import Accordion from 'react-bootstrap/Accordion';
import BookingWizard from "./common/BookingHeader";
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { checkOutCustomerAccess } from "../../hooks/checkBookingAccess";
const CheckoutPage = () => {
    const dispatch = useDispatch();
    const { acceptedBookingPrice, bookingItem, userCoupons, loading, error } = useSelector(state => state.bookingPrice);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('PAYOS'); // Default to PayOS
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { booking, status: bookingStatus, error: bookingError } = useSelector((state) => state.booking);
    const [showCouponDropdown, setShowCouponDropdown] = useState(false);
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [authError, setAuthError] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingById(bookingId));
        }
    }, [dispatch, bookingId]);

    useEffect(() => {
        const verifyAccess = async () => {
            if (!bookingId || !user?._id) {
                setAuthError("Missing booking ID or user information");
                setIsAuthorized(false);
                setIsChecking(true);
                return;
            }

            const { booking,isAuthorized, error } = await checkOutCustomerAccess(dispatch, bookingId, user._id);
            setIsAuthorized(isAuthorized);
            setAuthError(error);
            setIsChecking(true);
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

    useEffect(() => {
        if (bookingId && booking?.technicianId?._id) {
            dispatch(getAcceptedBookingPriceThunk({ bookingId, technicianId: booking.technicianId._id }));
        }
    }, [dispatch, bookingId, booking?.technicianId?._id]);

    const itemsTotal = bookingItem.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const laborPrice = acceptedBookingPrice?.laborPrice || 0;
    const subTotal = acceptedBookingPrice?.finalPrice || (laborPrice + itemsTotal);

    const handleApplyCoupon = (e) => {
        e.preventDefault();

        const coupon = userCoupons.find(c => c._id === selectedCouponId);
        if (!coupon) {
            toast.error('Mã giảm giá không hợp lệ.');
            return;
        }
        if (subTotal < (coupon.minOrderValue || 0)) {
            toast.error(`Đơn hàng phải có giá trị tối thiểu $${coupon.minOrderValue} để sử dụng mã giảm giá này.`);
            return;
        }
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


        if (!acceptedBookingPrice || isProcessing) {
            console.log('Early return - bookingPrice or isProcessing check failed');
            return;
        }

        setIsProcessing(true);

        let discount = 0;
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
                bookingPriceId: acceptedBookingPrice._id,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discountValue: discount,
                finalPrice: newFinalPrice,
                paymentMethod: paymentMethod
            })).unwrap();

            console.log('finalizeBookingThunk result:', resultAction);

            // Handle response based on payment method
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
                // For cash payments, the backend already handles everything
                // Just show success message and redirect
                toast.success('Đặt hàng thành công! Vui lòng thanh toán bằng tiền mặt.');
                navigate('/payment-success');
            }

        } catch (err) {
            console.error('Payment error:', err);
            toast.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    let discount = 0;
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

    const estimatedTotal = subTotal - discount;



    if (error) {
        return <div className="text-center py-5">Error: {error}</div>;
    }



    return (
        <>
            <Header />

            <BreadcrumbBar title='Thanh toán' />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={4} />

                    <div className="booking-detail-info pt-0">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div className="booking-information-card">
                                        <div className="booking-info-head">
                                            <span><i className="bx bxs-credit-card"></i></span>
                                            <h5>Thông tin đơn</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            {/* Booking Details with adons-lists style and quantity */}
                                            <ul className="adons-lists">
                                                {bookingItem.map(item => (
                                                    <li key={item._id}>
                                                        <div className="adons-types">
                                                            <div className="d-flex align-items-center adon-name-info">
                                                                <div className="adon-name">
                                                                    <h6>{item.name}  <span>{item.quantity > 1 ? `(${item.quantity})` : ''}</span></h6>
                                                                    {item.description && (
                                                                        <a href="javascript:void(0);" className="d-inline-flex align-items-center adon-info-btn">
                                                                            <i className="bx bx-info-circle me-2"></i>More information
                                                                            <i className="bx bx-chevron-down ms-2 arrow-icon"></i>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="adon-price">{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                                        </div>
                                                        {item.description && (
                                                            <div className="more-adon-info">
                                                                <p>{item.description}</p>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>

                                        </div>
                                    </div>
                                    <div className="booking-information-card">
                                        <div className="booking-info-head">
                                            <span><i className="bx bxs-purchase-tag"></i></span>
                                            <h5>Mã Giảm Giá</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            {paymentMethod === 'CASH' ? (
                                                <div className="alert alert-warning" role="alert">
                                                    Mã giảm giá không áp dụng cho phương thức thanh toán tiền mặt.
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="dropdown me-2 mb-2">
                                                        <a
                                                            href="#"
                                                            className="dropdown-toggle btn  d-inline-flex align-items-center"
                                                            data-bs-toggle="dropdown"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                setShowCouponDropdown(!showCouponDropdown);
                                                            }}
                                                        >
                                                            <i className="ti ti-filter me-2"></i>
                                                            {appliedCoupon
                                                                ? `${appliedCoupon.code}`
                                                                : selectedCouponId
                                                                    ? `${userCoupons.find(c => c._id === selectedCouponId)?.code}`
                                                                    : 'Chọn mã giảm giá'}
                                                        </a>
                                                        <ul className={`dropdown-menu dropdown-menu-end p-2${showCouponDropdown ? ' show' : ''}`}>
                                                            {userCoupons.length === 0 && (
                                                                <li>
                                                                    <span className="dropdown-item text-muted">Không có mã giảm giá nào khả dụng.</span>
                                                                </li>
                                                            )}
                                                            {userCoupons.map(coupon => (
                                                                <li key={coupon._id}>
                                                                    <a
                                                                        href="#"
                                                                        className={`dropdown-item rounded-1${selectedCouponId === coupon._id ? ' active' : ''}`}
                                                                        onClick={e => {
                                                                            e.preventDefault();
                                                                            if (!appliedCoupon) setSelectedCouponId(coupon._id);
                                                                            setShowCouponDropdown(false);
                                                                        }}
                                                                    >
                                                                        <span className="badge bg-primary me-2">{coupon.code}</span>
                                                                        {coupon.type === 'PERCENT' ? `${coupon.value}%` : `₫${coupon.value}`}
                                                                        {coupon.minOrderValue ? ` (Min ₫${coupon.minOrderValue})` : ''}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {/* Sử dụng/Gỡ button */}
                                                    <div>
                                                        {appliedCoupon ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm mt-2"
                                                                onClick={handleRemoveCoupon}
                                                            >
                                                                Gỡ
                                                            </button>
                                                        ) : selectedCouponId ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm mt-2"
                                                                onClick={handleApplyCoupon}
                                                            >
                                                                Sử dụng
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="booking-information-card">
                                        <div className="booking-info-head">
                                            <span><i className="bx bx-wallet"></i></span>
                                            <h5>Phương thức thanh toán</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            <div className="payment-method-options row">
                                                <div className="col-md-6 mb-3">
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'PAYOS' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('PAYOS')}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                            <i className="bx bx-credit-card text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                                                            <h6>Thanh toán trực tuyến</h6>
                                                            <p className="small text-muted mb-0">Thẻ, Chuyển khoản</p>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="col-md-6 mb-3">
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('CASH')}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                            <i className="bx bx-money text-success mb-3" style={{ fontSize: '2rem' }}></i>
                                                            <h6>Thanh toán tiền mặt</h6>
                                                            <p className="small text-muted mb-0">Khi hoàn thành dịch vụ</p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="booking-info-btns d-flex justify-content-end">
                                                <a href="listing-details.html" className="btn btn-secondary">Trở về</a>
                                                <button className="btn btn-primary continue-book-btn"
                                                    onClick={handleContinueBooking}
                                                    disabled={!acceptedBookingPrice || isProcessing || (!paymentMethod)}
                                                    type="submit">{isProcessing ? 'Đang xử lý...' : 'Thanh Toán'}</button>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                            <div className="col-lg-4 theiaStickySidebar">
                                <div className="booking-sidebar">
                                    <Accordion defaultActiveKey="0" alwaysOpen className="custom-accordion">
                                        <div className='custom-accordion-board'>
                                            <Accordion.Item eventKey="0" className="booking-sidebar-card accordion-item border-0 mb-4">
                                                <Accordion.Header>
                                                    <h5> Kỹ Thuật Viên</h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body">
                                                    <div className="booking-car-detail">
                                                        <span className="car-img">
                                                            <img src={acceptedBookingPrice?.technicianId?.userId?.avatar || '/img/profiles/avatar-02.jpg'} className="img-fluid" alt="Thợ" />
                                                        </span>
                                                        <div className="care-more-info">
                                                            <h5>{acceptedBookingPrice?.technicianId?.userId?.fullName || 'Tên Thợ'}</h5>
                                                        </div>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                        <div className='custom-accordion-board'>
                                            <Accordion.Item eventKey="1" className="booking-sidebar-card border-0 mb-4">
                                                <Accordion.Header>
                                                    <h5>Giá</h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body">
                                                    <ul className="location-address-info">
                                                        {acceptedBookingPrice?.laborPrice > 0 && (
                                                            <li>
                                                                <h6>Tiền Công</h6>
                                                                <p>{laborPrice.toFixed(2)}</p>
                                                            </li>
                                                        )}
                                                        <li>
                                                            <h6>Tổng Tiền</h6>
                                                            <p>{subTotal.toFixed(2)}</p>
                                                        </li>
                                                        {appliedCoupon && (
                                                            <li className="text-success">
                                                                <h6>Mã Giảm Giá: {appliedCoupon.code} <small>({appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`})</small></h6>
                                                                <p className='text-success'>- {discount.toFixed(2)}</p>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                    </Accordion>
                                    <div className="total-rate-card">
                                        <div className="vehicle-total-price">
                                            <h5>Tổng Tạm Tính</h5>
                                            <h6>{estimatedTotal.toFixed(2)}</h6>
                                        </div>
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
