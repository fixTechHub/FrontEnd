import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingWizard from "../booking/common/BookingHeader";
import { checkAuthThunk,setAuthLoading } from '../../features/auth/authSlice';


const PaymentFail = () => {
    const dispatch = useDispatch();

    const  { loading } = useSelector(state => state.auth.loading);
  
    useEffect(() => {
        dispatch(setAuthLoading(true)); // Set loading to true immediately
        dispatch(checkAuthThunk()).finally(() => {
        });
      }, [dispatch]);
    
     
    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState('');

    const error = searchParams.get('error');

    useEffect(() => {
        setErrorMessage(error || 'Thanh toán thất bại');
    }, [error]);

    const handleRetryPayment = () => {
        // In a real app, you would redirect back to the checkout page
        // or implement a retry mechanism
        toast.info('Đang chuyển hướng đến trang thanh toán...');
        // You could navigate back to checkout or implement retry logic
    };



    return (
        <>
            <Header />
            <BreadcrumbBar title='Thanh toán thất bại' />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard activeStep={5} />
                    <div className="booking-detail-info pt-0">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div className="booking-information-card text-center">
                                        <div className="booking-info-head">
                                            <span className="text-danger">
                                                <i className="bx bx-x-circle" style={{ fontSize: '4rem' }}></i>
                                            </span>
                                            <h3 className="text-danger mt-3 mb-4">Thanh toán thất bại!</h3>
                                        </div>
                                        <div className="booking-info-body">
                                            <div className="error-message mb-5">
                                                <p className="lead text-danger mb-3">Rất tiếc, thanh toán của bạn không thể hoàn tất.</p>
                                                <p className="text-muted">Vui lòng kiểm tra lại thông tin và thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                                            </div>

                                            <div className="error-details mb-5">
                                                <div className="alert alert-danger">
                                                    <strong>Lỗi:</strong> {errorMessage}
                                                </div>
                                            </div>

                                            <div className="possible-reasons mb-5">
                                                <h5 className="mb-4">Có thể do các nguyên nhân sau:</h5>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-credit-card text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Thông tin thẻ</h6>
                                                            <p className="small text-muted">Thông tin thẻ không chính xác hoặc thẻ đã hết hạn</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-wallet text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Số dư không đủ</h6>
                                                            <p className="small text-muted">Tài khoản không đủ số dư để thực hiện giao dịch</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-server text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Hệ thống ngân hàng</h6>
                                                            <p className="small text-muted">Hệ thống ngân hàng đang bảo trì hoặc gặp sự cố</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-wifi text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Kết nối mạng</h6>
                                                            <p className="small text-muted">Kết nối mạng không ổn định</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="support-info mb-5">
                                                <div className="alert alert-info">
                                                    <h5><i className="bx bx-support me-2"></i>Bạn cần hỗ trợ?</h5>
                                                    <p className="mb-3">Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi:</p>
                                                    <div className="row">
                                                        <div className="col-md-4 mb-2">
                                                            <i className="bx bx-phone me-2"></i>Hotline: 0814035790
                                                        </div>
                                                        <div className="col-md-4 mb-2">
                                                            <i className="bx bx-envelope me-2"></i>Email: levietduydng@gmail.com
                                                        </div>
                                                        <div className="col-md-4 mb-2">
                                                            <i className="bx bx-message-square me-2"></i>Chat trực tuyến: Có sẵn 24/7
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
                                                <Link to="/" className="btn btn-secondary btn-lg me-3">
                                                    <i className="bx bx-home me-2"></i>
                                                    Về trang chủ
                                                </Link>
                                                <Link to="/contact" className="btn btn-outline-primary btn-lg">
                                                    <i className="bx bx-support me-2"></i>
                                                    Liên hệ hỗ trợ
                                                </Link>
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

export default PaymentFail;
