import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAcceptedBookingPriceThunk } from '../../features/booking-prices/bookingPriceSlice';
import { finalizeBookingThunk } from '../../features/transactions/transactionSlice'
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import Accordion from 'react-bootstrap/Accordion';
import BookingWizard from "./common/BookingHeader";
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useBookingParams } from '../../hooks/useBookingParams';

const CheckoutPage = () => {
    const { bookingId, technicianId } = useParams();
    const dispatch = useDispatch();
    const { bookingPrice, bookingItem, userCoupons, loading, error } = useSelector(state => state.bookingPrice);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('PAYOS'); // Default to PayOS
    const { stepsForCurrentUser } = useBookingParams();

    const navigate = useNavigate();

    useEffect(() => {
        if (bookingId && technicianId) {
            dispatch(getAcceptedBookingPriceThunk({ bookingId, technicianId }));
        }
    }, [dispatch, bookingId, technicianId]);

    const itemsTotal = bookingItem.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const laborPrice = bookingPrice?.laborPrice || 0;
    const subTotal = bookingPrice?.finalPrice || (laborPrice + itemsTotal);

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

    const handleContinueBooking = async () => {


        if (!bookingPrice || isProcessing) {
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
            console.log('Dispatching finalizeBookingThunk with:', {
                bookingPriceId: bookingPrice._id,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discountValue: discount,
                finalPrice: newFinalPrice,
                paymentMethod: paymentMethod
            });

            const resultAction = await dispatch(finalizeBookingThunk({
                bookingPriceId: bookingPrice._id,
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

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <RingLoader color={"#1977F3"} loading={loading} size={100} />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-5">Error: {error}</div>;
    }

    // Debug section - remove this in production
    const debugInfo = {
        bookingPrice: !!bookingPrice,
        paymentMethod: paymentMethod,
        isProcessing: isProcessing,
        buttonEnabled: !!bookingPrice && !!paymentMethod && !isProcessing
    };

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
                                            <form onSubmit={handleApplyCoupon}>
                                                <div className="d-flex align-items-center">
                                                    <div className="form-custom flex-fill">
                                                        <select
                                                            className="form-control mb-0"
                                                            value={selectedCouponId}
                                                            onChange={e => setSelectedCouponId(e.target.value)}
                                                            disabled={!!appliedCoupon}
                                                        >
                                                            <option value="">Select a coupon</option>
                                                            {userCoupons.map(coupon => (
                                                                <option key={coupon._id} value={coupon._id}>
                                                                    {coupon.code} - {coupon.type === 'PERCENT' ? `${coupon.value}%` : `$${coupon.value}`} {coupon.minOrderValue ? `(Min $${coupon.minOrderValue})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {!appliedCoupon ? (
                                                        <button type="submit" className="btn btn-secondary apply-coupon-btn d-flex align-items-center ms-2">Sử dụng<i className="feather-arrow-right ms-2"></i></button>
                                                    ) : (
                                                        <button type="button" className="btn btn-danger ms-2" onClick={handleRemoveCoupon}>Gỡ</button>
                                                    )}
                                                </div>
                                            </form>
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
                                                        onClick={() => setPaymentMethod('PAYOS')}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                            <i className="bx bx-credit-card text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                                                            <h6>Thanh toán trực tuyến</h6>
                                                            <p className="small text-muted mb-0">Thẻ, Chuyển khoản</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {bookingPrice?.bookingId?.status === 'WAITING_CONFIRM' && (
                                                    <div className="col-md-6 mb-3">
                                                        <div 
                                                            className={`card h-100 payment-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                                                            onClick={() => setPaymentMethod('CASH')}
                                                        >
                                                            <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                                <i className="bx bx-money text-success mb-3" style={{ fontSize: '2rem' }}></i>
                                                                <h6>Thanh toán tiền mặt</h6>
                                                                <p className="small text-muted mb-0">Khi hoàn thành dịch vụ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="booking-info-btns d-flex justify-content-end">
                                                <a href="listing-details.html" className="btn btn-secondary">Trở về</a>
                                                <button className="btn btn-primary continue-book-btn"
                                                    onClick={handleContinueBooking}
                                                    disabled={!bookingPrice || isProcessing || (!paymentMethod)}
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
                                                            <img src={bookingPrice?.technicianId?.userId?.avatar || '/img/profiles/avatar-02.jpg'} className="img-fluid" alt="Thợ" />
                                                        </span>
                                                        <div className="care-more-info">
                                                            <h5>{bookingPrice?.technicianId?.userId?.fullName || 'Tên Thợ'}</h5>
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
                                                        {bookingPrice?.laborPrice > 0 && (
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