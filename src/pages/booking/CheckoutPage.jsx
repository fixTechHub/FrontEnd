import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getAcceptedBookingPriceThunk } from '../../features/booking-price/bookingPriceSlice';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
    const { bookingId, technicianId } = useParams();
    const dispatch = useDispatch();
    const { bookingPrice, bookingItem, userCoupons, loading, error } = useSelector(state => state.bookingPrice);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        const date = new Date(dateString);
        const formattedDate = `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}/${date.getFullYear()}`;
        const formattedTime = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
        return { date: formattedDate, time: formattedTime };
    };

    const { date: appointmentDate, time: appointmentTime } = formatDate(bookingPrice?.booking?.appointmentDate);

    useEffect(() => {
        if (bookingId && technicianId) {
            dispatch(getAcceptedBookingPriceThunk({ bookingId, technicianId }));
        }
    }, [dispatch, bookingId, technicianId]);

    const itemsTotal = bookingItem.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const laborPrice = bookingPrice?.laborPrice || 0;
    const subTotal = bookingPrice?.finalPrice || (laborPrice + itemsTotal);

    console.log(bookingItem);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        setAppliedCoupon(null);

        if (!couponCode) {
            toast.warn('Please enter a coupon code.');
            return;
        }

        const coupon = userCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());

        if (!coupon) {
            toast.error('Invalid coupon code.');
            return;
        }

        if (subTotal < (coupon.minOrderValue || 0)) {
            toast.error(`Order must be at least $${coupon.minOrderValue} to use this coupon.`);
            return;
        }

        setAppliedCoupon(coupon);
        toast.success('Coupon applied successfully!');
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

    return (
        <>
            <div className="breadcrumb-bar">
                <div className="container">
                    <div className="row align-items-center text-center">
                        <div className="col-md-12 col-12">
                            <h2 className="breadcrumb-title">Checkout</h2>
                            <nav aria-label="breadcrumb" className="page-breadcrumb">
                                {/* <ol className="breadcrumb">
                                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Checkout</li>
                                </ol> */}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div className="booking-new-module">
                <div className="container">
                    <div className="booking-detail-info pt-0">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div className="booking-information-card">
                                        <div className="booking-info-head">
                                            <span><i className="bx bxs-credit-card"></i></span>
                                            <h5>Payment Information</h5>
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
                                            <h5>Coupon</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            <form onSubmit={handleApplyCoupon}>
                                                <div className="d-flex align-items-center">
                                                    <div className="form-custom flex-fill">
                                                        <input type="text" className="form-control mb-0" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                                    </div>
                                                    <button type="submit" className="btn btn-secondary apply-coupon-btn d-flex align-items-center ms-2">Apply<i className="feather-arrow-right ms-2"></i></button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 theiaStickySidebar">
                                <div className="booking-sidebar">
                                    <div className="booking-sidebar-card">
                                        <div className="accordion-item border-0 mb-4">
                                            <div className="accordion-header">
                                                <div className="accordion-button" role="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_one">
                                                    <div className="booking-sidebar-head">
                                                        <h5>Technician<i className="fas fa-chevron-down"></i></h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="accordion_collapse_one" className="accordion-collapse collapse show">
                                                <div className="booking-sidebar-body">
                                                    <div className="booking-car-detail">
                                                        <span className="car-img">
                                                            <img src={bookingPrice?.technicianId?.userId?.avatar || '/img/profiles/avatar-02.jpg'} className="img-fluid" alt="Technician" />
                                                        </span>
                                                        <div className="care-more-info">
                                                            <h5>{bookingPrice?.technicianId?.userId?.fullName || 'Technician Name'}</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-sidebar-card">
                                        <div className="accordion-item border-0 mb-4">
                                            <div className="accordion-header p-3 d-flex align-center justify-content-between">
                                                <div className="accordion-button collapsed" role="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_three" aria-expanded="true">
                                                    <div className="booking-sidebar-head p-0 d-flex justify-content-between align-items-center">
                                                        <h5>Price<i className="fas fa-chevron-down"></i></h5>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="accordion_collapse_three" className="accordion-collapse collapse">
                                                <div className="booking-sidebar-body">
                                                    <ul className="location-address-info">
                                                        {bookingPrice?.laborPrice > 0 && (
                                                            <li>
                                                                <h6>Labor Price</h6>
                                                                <p>{laborPrice.toFixed(2)}</p>
                                                            </li>
                                                        )}
                                                        <li>
                                                            <h6>Subtotal</h6>
                                                            <p>{subTotal.toFixed(2)}</p>
                                                        </li>
                                                        {appliedCoupon && (
                                                            <li className="text-success">
                                                                <h6>Coupon: {appliedCoupon.code} <small>({appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`})</small></h6>
                                                                <h5 className='text-success'>- {discount.toFixed(2)}</h5>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="total-rate-card">
                                        <div className="vehicle-total-price">
                                            <h5>Estimated Total</h5>
                                            <span>{estimatedTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CheckoutPage; 