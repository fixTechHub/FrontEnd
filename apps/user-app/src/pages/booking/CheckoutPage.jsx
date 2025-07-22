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
const CouponModal = ({ show, onHide, coupons, onSelectCoupon }) => {
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const handleSelect = (coupon) => {
        setSelectedCoupon(coupon);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" style={{ fontFamily: 'Arial, sans-serif' }}>
            <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <Modal.Title style={{ color: '#333', fontSize: '18px' }}>Chọn Mã Giảm Giá</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px' }}>
                {coupons.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>Không có mã giảm giá nào khả dụng.</p>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {coupons.map((coupon) => (
                            <Card
                                key={coupon._id}
                                className={selectedCoupon?._id === coupon._id ? 'border-primary' : ''}
                                style={{
                                    marginBottom: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.3s',
                                }}
                                onClick={() => handleSelect(coupon)}
                            >
                                <Card.Body style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h6 style={{ color: '#555', margin: '0 0 5px 0' }}>
                                                <span className="badge bg-primary" style={{ fontSize: '12px' }}>{coupon.code}</span>
                                            </h6>
                                            <p style={{ color: '#3BB143', fontSize: '14px', margin: '0' }}>
                                                {coupon.type === 'PERCENT' ? `${coupon.value}%` : `${formatCurrency(coupon.value)} VND`}
                                            </p>
                                        </div>
                                        <Button
                                            variant={selectedCoupon?._id === coupon._id ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', margin: '10px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectCoupon(coupon);
                                                onHide();
                                            }}

                                        >
                                            Chọn
                                        </Button>
                                    </div>
                                    <div style={{ marginTop: '10px', color: '#666', fontSize: '13px' }}>
                                        <p><strong>Mô tả:</strong> {coupon.description || 'Không có mô tả'}</p>
                                        <p><strong>Giá trị đơn hàng tối thiểu:</strong> <span style={{ color: '#D30000' }}>{coupon.minOrderValue ? `${formatCurrency(coupon.minOrderValue)} VND` : 'Không yêu cầu'}</span> </p>
                                    
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                <Button variant="secondary" onClick={onHide} style={{ padding: '5px 15px', fontSize: '14px' }}>
                    Đóng
                </Button>
                {selectedCoupon && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            onSelectCoupon(selectedCoupon);
                            onHide();
                        }}
                        style={{ padding: '5px 15px', fontSize: '14px' }}
                    >
                        Xác nhận
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};


const CheckoutPage = () => {
    const dispatch = useDispatch();
    const { acceptedBooking, userCoupons, loading: bookingLoading, error: bookingError } = useSelector((state) => state.booking);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('PAYOS'); // Default to PayOS
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
    // console.log(acceptedBooking);

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
            // Redirect to the original page or default to '/'
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


        if (!acceptedBooking || isProcessing) {
            console.log('Early return - booking or isProcessing check failed');
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
                bookingId: bookingId,
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
                                    <div className="booking-information-card">
                                        <div className="booking-info-head">
                                            <span><i className="bx bxs-credit-card"></i></span>
                                            <h5>Thông tin đơn</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            {/* Booking Details with adons-lists style and quantity */}
                                            <ul className="adons-lists">
                                                {acceptedBooking?.quote?.items?.map(item => (
                                                    <li key={item.name}>
                                                        <div className="adons-types">
                                                            <div className="d-flex align-items-center adon-name-info">
                                                                <div className="adon-name">
                                                                    <h6>{item.name}  <span>{item.quantity > 1 ? `(${item.quantity})` : ''}</span>    {item.note && (
                                                                        <i

                                                                            className="bx bx-info-circle me-2"
                                                                            style={{ color: '#ff6200' }}
                                                                            onClick={() => {
                                                                                setExpandedNotes(prev => ({
                                                                                    ...prev,
                                                                                    [item.name]: !prev[item.name]
                                                                                }));
                                                                            }}
                                                                        >


                                                                        </i>
                                                                    )}<span></span></h6>

                                                                </div>
                                                            </div>
                                                            <span className="adon-price">{formatCurrency(item.price * (item.quantity || 1))}</span>
                                                        </div>
                                                        {item.note && expandedNotes[item.name] && (
                                                            <>
                                                                <div className="more-adon-info mt-2 p-2 bg-light rounded ">
                                                                    <div className='d-flex align-items-center adon-name-info'>
                                                                        <span className="adon-price" style={{ color: '#666', fontSize: '14px' }}>{item.note}</span>
                                                                    </div>


                                                                </div>


                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>

                                        </div>
                                    </div>

                                    
                                    <div className="booking-information-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: '20px', margin: '20px 0', fontFamily: 'Arial, sans-serif' }}>
                                        <div className="booking-info-head" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <span><i className="bx bxs-credit-card"></i></span>
                                            <h5 style={{ color: '#333', fontSize: '18px', margin: '0' }}>Thông tin đơn</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            <ul className="adons-lists" style={{ listStyle: 'none', padding: '0' }}>
                                                <li>
                                                    <div className="adons-types" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                                        <div className="adon-name" style={{ color: '#555', fontSize: '14px' }}>Địa Chỉ</div>
                                                        <span style={{ color: '#666', fontSize: '14px' }}>{acceptedBooking?.location?.address}</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="adons-types" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                                        <div className="adon-name" style={{ color: '#555', fontSize: '14px' }}>Ngày Sửa Chửa</div>
                                                        <span style={{ color: '#666', fontSize: '14px' }}>{formatDateOnly(acceptedBooking?.schedule?.startTime)}</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="adons-types" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                                        <div className="adon-name" style={{ color: '#555', fontSize: '14px' }}>Thời Gian Dự Kiến</div>
                                                        <span style={{ color: '#666', fontSize: '14px' }}>{formatTimeOnly(acceptedBooking?.schedule?.startTime)} - {formatTimeOnly(acceptedBooking?.schedule?.expectedEndTime)}</span>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="adons-types" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: 'none', alignItems: 'center' }}>
                                                        <div className="adon-name" style={{ color: '#555', fontSize: '14px' }}>Thời Hạn Bảo Hành</div>
                                                        <span style={{ color: '#666', fontSize: '14px' }}>{acceptedBooking?.quote?.warrantiesDuration || 30} Ngày</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="adons-types" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                                        <div className="adon-name" style={{ color: '#555', fontSize: '14px' }}>
                                                            Ghi Chú
                                                            {acceptedBooking?.description && (
                                                                <i
                                                                    className="bx bx-info-circle"
                                                                    style={{ marginLeft: '5px', cursor: 'pointer', color: '#ff6200' }}
                                                                    onClick={() => {
                                                                        setExpandedNotes2(prev => ({
                                                                            ...prev,
                                                                            ['description']: !prev['description'] // Use a fixed key instead of the dynamic description
                                                                        }));
                                                                    }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {acceptedBooking?.description && expandedNotes2['description'] && (
                                                        <div className="more-adon-info" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                                            <span style={{ color: '#666', fontSize: '14px' }}>{acceptedBooking.description}</span>
                                                        </div>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div className="booking-sidebar-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: '20px', margin: '20px 0', fontFamily: 'Arial, sans-serif' }}>
                                        <div className="booking-info-head" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <span><i className="bx bxs-wallet" style={{ color: '#ff6200', fontSize: '24px', marginRight: '10px' }}></i></span>
                                            <h5 style={{ color: '#333', fontSize: '18px', margin: '0' }}>Phương thức thanh toán</h5>
                                        </div>
                                        <div className="booking-info-body">
                                            <div className="payment-method-options row" style={{ margin: '0 -10px' }}>
                                                <div className="col-md-6 mb-3" style={{ padding: '0 10px' }}>
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'PAYOS' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('PAYOS')}
                                                        style={{ cursor: 'pointer', border: paymentMethod === 'PAYOS' ? '2px solid #ff6200' : '1px solid #ddd', transition: 'border 0.3s' }}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                            <i className="bx bx-credit-card text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                                                            <h6 style={{ color: '#555', fontSize: '14px', margin: '0' }}>Thanh toán trực tuyến</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-3" style={{ padding: '0 10px' }}>
                                                    <div
                                                        className={`card h-100 payment-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                                                        onClick={() => handlePaymentMethodChange('CASH')}
                                                        style={{ cursor: 'pointer', border: paymentMethod === 'CASH' ? '2px solid #28a745' : '1px solid #ddd', transition: 'border 0.3s' }}
                                                    >
                                                        <div className="card-body text-center" style={{ padding: '1rem' }}>
                                                            <i className="bx bx-money text-success mb-3" style={{ fontSize: '2rem' }}></i>
                                                            <h6 style={{ color: '#555', fontSize: '14px', margin: '0' }}>Thanh toán tiền mặt</h6>
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
                                        <div className="custom-accordion-board">
                                            <Accordion.Item eventKey="0" className="booking-sidebar-card accordion-item border-0 mb-4">
                                                <Accordion.Header>
                                                    <h5 style={{ color: '#333', margin: '0' }}>Kỹ Thuật Viên</h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '15px' }}>
                                                    <div className="booking-car-detail" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <span className="car-img">
                                                            <img
                                                                src={acceptedBooking?.technicianId?.userId?.avatar || '/img/profiles/avatar-02.jpg'}
                                                                className="img-fluid rounded-circle"
                                                                alt="Thợ"

                                                            />
                                                        </span>
                                                        <div className="care-more-info">
                                                            <h5 style={{ color: '#555', fontSize: '16px', margin: '0' }}>
                                                                {acceptedBooking?.technicianId?.userId?.fullName || 'Tên Thợ'}
                                                            </h5>
                                                            <div className="rating mt-2" style={{ color: '#ff9800' }}>
                                                                {[...Array(5)].map((_, index) => {
                                                                    const rating = acceptedBooking?.technicianId?.ratingAverage || 0;
                                                                    const fullStars = Math.floor(rating);
                                                                    const hasHalfStar = rating % 1 >= 0.5;
                                                                    if (index < fullStars) {
                                                                        return <i key={index} className="fas fa-star filled"></i>;
                                                                    } else if (index === fullStars && hasHalfStar) {
                                                                        return <i key={index} className="fas fa-star-half-stroke filled"></i>;
                                                                    } else {
                                                                        return <i key={index} className="far fa-star"></i>;
                                                                    }
                                                                })}
                                                                {/* <span style={{ color: '#666', marginLeft: '5px' }}>
                                                                    ({acceptedBooking?.technicianId?.ratingAverage?.toFixed(1) || '0.0'})
                                                                </span> */}
                                                                <span style={{ color: '#666', marginLeft: '5px' }}>
                                                                    {acceptedBooking?.technicianId?.jobCompleted || 0} công việc
                                                                </span>
                                                            </div>
                                                            <div className="technician-info mt-2">
                                                                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                                                                    <strong>Phí khảo sát:</strong> {formatCurrency(acceptedBooking?.technicianId?.rates?.inspectionFee || 0)} VND
                                                                </p>
                                                                <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                                                                    <strong>Kinh nghiệm:</strong> {acceptedBooking?.technicianId?.experienceYears || 0} năm
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>

                                        
                                        <div className="custom-accordion-board">
                                            <Accordion.Item eventKey="1" className="booking-sidebar-card border-0 mb-4">
                                                <Accordion.Header>
                                                    <h5 style={{ color: '#333', margin: '0' }}>Mã Giảm Giá</h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '15px' }}>
                                                    {paymentMethod === 'CASH' ? (
                                                        <div className="alert alert-warning" role="alert" style={{ padding: '10px', fontSize: '14px' }}>
                                                            Mã giảm giá không áp dụng cho phương thức thanh toán tiền mặt.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="dropdown me-2 mb-2">
                                                                <button
                                                                    className="dropdown-toggle btn btn-outline-secondary d-inline-flex align-items-center"
                                                                    onClick={handleApplyCouponModal}
                                                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                                                >
                                                                    <i className="ti ti-filter me-2"></i>
                                                                    {appliedCoupon
                                                                        ? `${appliedCoupon.code}`
                                                                        : selectedCouponId
                                                                            ? `${userCoupons.find(c => c._id === selectedCouponId)?.code}`
                                                                            : 'Chọn mã giảm giá'}
                                                                </button>
                                                            </div>
                                                            <div>
                                                                {appliedCoupon ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger btn-sm mt-2"
                                                                        onClick={handleRemoveCoupon}
                                                                        style={{ padding: '5px 10px', fontSize: '14px' }}
                                                                    >
                                                                        Gỡ
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </>
                                                    )}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                        {/* Place the modal here */}
                                        <CouponModal
                                            show={showCouponModal}
                                            onHide={() => setShowCouponModal(false)}
                                            coupons={userCoupons}
                                            onSelectCoupon={handleSelectCoupon}
                                        />
                                        <div className="custom-accordion-board">
                                            <Accordion.Item eventKey="2" className="booking-sidebar-card border-0 mb-4">
                                                <Accordion.Header>
                                                    <h5 style={{ color: '#333', margin: '0' }}>Giá</h5>
                                                </Accordion.Header>
                                                <Accordion.Body className="booking-sidebar-body" style={{ padding: '15px' }}>
                                                    <ul className="location-address-info" style={{ listStyle: 'none', padding: '0' }}>
                                                        {acceptedBooking?.quote?.laborPrice > 0 && (
                                                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                                                <h6 style={{ color: '#555', fontSize: '14px', margin: '0' }}>Tiền Công</h6>
                                                                <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>{formatCurrency(laborPrice)}</p>
                                                            </li>
                                                        )}
                                                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                                            <h6 style={{ color: '#555', fontSize: '14px', margin: '0' }}>Tổng Tiền</h6>
                                                            <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>{formatCurrency(subTotal)}</p>
                                                        </li>
                                                        {appliedCoupon && (
                                                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#28a745' }}>
                                                                <h6 style={{ fontSize: '14px', margin: '0' }}>
                                                                    Mã Giảm Giá: {appliedCoupon.code}{' '}
                                                                    <small style={{ color: '#666' }}>
                                                                        ({appliedCoupon.type === 'PERCENT' ? `${appliedCoupon.value}%` : `${formatCurrency(appliedCoupon.value)} VND`})
                                                                    </small>
                                                                </h6>
                                                                <p style={{ fontSize: '14px', margin: '0' }}>- {formatCurrency(discount)}</p>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                    </Accordion>
                                    <div className="total-rate-card" style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '15px', marginTop: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <div className="vehicle-total-price" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h5 style={{ color: '#333', fontSize: '16px', margin: '0' }}>Tổng Tạm Tính</h5>
                                            <h6 style={{ color: '#FFFFFF', fontSize: '18px', margin: '0' }}>{formatCurrency(estimatedTotal)}</h6>
                                        </div>
                                    </div>
                                    <div className="booking-info-btns d-flex justify-content-end" style={{ marginTop: '15px' }}>
                                        <button
                                            className="btn btn-primary continue-book-btn"
                                            onClick={handleContinueBooking}
                                            disabled={!acceptedBooking || isProcessing || !paymentMethod}
                                            style={{ padding: '10px 20px', fontSize: '14px' }}
                                            type="submit"
                                        >
                                            {isProcessing ? 'Đang xử lý...' : 'Thanh Toán'}
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
