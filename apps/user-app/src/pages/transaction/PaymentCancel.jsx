import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingWizard from "../booking/common/BookingHeader";
import { checkAuthThunk } from '../../features/auth/authSlice';

const PaymentCancel = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(checkAuthThunk());
    }, [dispatch]);

    const handleRetryPayment = () => {
        // Navigate back to checkout page with the same booking details
        toast.info('Đang chuyển hướng đến trang thanh toán...');
        navigate('/');
    };

    const handleBackToCheckout = () => {
        // In a real app, you would navigate back to the checkout page
        // with the preserved booking details
        toast.info('Đang chuyển hướng đến trang thanh toán...');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <RingLoader color={"#1977F3"} loading={loading} size={100} />
            </div>
        );
    }

    return (
        <>
            <Header />
            <BreadcrumbBar title='Thanh toán đã hủy' />
            
            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard activeStep={5} />
                    <div className="booking-detail-info pt-0">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div className="booking-information-card text-center">
                                        <div className="booking-info-head">
                                            <span className="text-warning">
                                                <i className="bx bx-time" style={{ fontSize: '4rem' }}></i>
                                            </span>
                                            <h3 className="text-warning mt-3 mb-4">Thanh toán đã bị hủy</h3>
                                        </div>
                                        <div className="booking-info-body">
                                            <div className="cancel-message mb-5">
                                                <p className="lead mb-3">Bạn đã hủy quá trình thanh toán.</p>
                                                <p className="text-muted">Đơn hàng của bạn vẫn được lưu và bạn có thể thử lại bất cứ lúc nào.</p>
                                            </div>

                                            <div className="what-happens-next mb-5">
                                                <h5 className="mb-4">Điều gì xảy ra tiếp theo?</h5>
                                                <div className="row">
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-save text-info" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Đơn hàng được lưu</h6>
                                                            <p className="small text-muted">Đơn hàng của bạn vẫn được giữ nguyên trong hệ thống</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-refresh text-info" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Thử lại bất cứ lúc nào</h6>
                                                            <p className="small text-muted">Bạn có thể thử lại thanh toán bất cứ lúc nào</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-calendar text-info" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Báo giá có hiệu lực</h6>
                                                            <p className="small text-muted">Báo giá vẫn có hiệu lực trong 24 giờ</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="payment-options mb-5">
                                                <h5 className="mb-4">Tùy chọn thanh toán:</h5>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="card h-100">
                                                            <div className="card-body text-center">
                                                                <i className="bx bx-credit-card text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                                                                <h6>Thanh toán trực tuyến</h6>
                                                                <p className="small text-muted">Thẻ tín dụng, chuyển khoản ngân hàng</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="card h-100">
                                                            <div className="card-body text-center">
                                                                <i className="bx bx-money text-success mb-3" style={{ fontSize: '2.5rem' }}></i>
                                                                <h6>Thanh toán tiền mặt</h6>
                                                                <p className="small text-muted">Thanh toán khi hoàn thành dịch vụ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="action-buttons">
                                                <button 
                                                    onClick={handleRetryPayment}
                                                    className="btn btn-primary btn-lg me-3"
                                                >
                                                    <i className="bx bx-refresh me-2"></i>
                                                    Thử lại thanh toán
                                                </button>
                                                <button 
                                                    onClick={handleBackToCheckout}
                                                    className="btn btn-outline-primary btn-lg me-3"
                                                >
                                                    <i className="bx bx-arrow-back me-2"></i>
                                                    Quay lại trang thanh toán
                                                </button>
                                                <Link to="/" className="btn btn-secondary btn-lg">
                                                    <i className="bx bx-home me-2"></i>
                                                    Về trang chủ
                                                </Link>
                                            </div>

                                            <div className="support-info mt-5">
                                                <div className="alert alert-light">
                                                    <h6 className="mb-2">
                                                        <i className="bx bx-help-circle me-2"></i>
                                                        <strong>Bạn cần hỗ trợ?</strong>
                                                    </h6>
                                                    <p className="small mb-0">
                                                        Liên hệ với chúng tôi qua hotline <strong>0814035790</strong> 
                                                        hoặc email <strong>levietduydng@gmail.com</strong>
                                                    </p>
                                                </div>
                                            </div>
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

export default PaymentCancel;
