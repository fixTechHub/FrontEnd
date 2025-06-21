import React, { useEffect} from 'react';
import {  Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RingLoader } from 'react-spinners';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import BookingWizard from "../booking/BookingHeader";
import { checkAuthThunk } from '../../features/auth/authSlice';

const PaymentSuccess = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(checkAuthThunk());
    }, [dispatch]);

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
            <BreadcrumbBar title='Thanh toán thành công' />
            
            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard activeStep={5} />
                    <div className="booking-detail-info pt-0">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div className="booking-information-card text-center">
                                        <div className="booking-info-head">
                                            <span className="text-success">
                                                <i className="bx bx-check-circle" style={{ fontSize: '4rem' }}></i>
                                            </span>
                                            <h3 className="text-success mt-3 mb-4">Thanh toán thành công!</h3>
                                        </div>
                                        <div className="booking-info-body">
                                            <div className="success-message mb-5">
                                                <p className="lead mb-3">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                                                <p className="text-muted">Đơn hàng của bạn đã được xử lý thành công và đang được chuẩn bị.</p>
                                            </div>

                                            <div className="next-steps mb-5">
                                                <h5 className="mb-4">Các bước tiếp theo:</h5>
                                                <div className="row">
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-envelope text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Email xác nhận</h6>
                                                            <p className="small text-muted">Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-phone text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Liên hệ kỹ thuật viên</h6>
                                                            <p className="small text-muted">Kỹ thuật viên sẽ liên hệ với bạn trong thời gian sớm nhất</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 mb-3">
                                                        <div className="text-center">
                                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                                                <i className="bx bx-list-check text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <h6>Theo dõi đơn hàng</h6>
                                                            <p className="small text-muted">Bạn có thể theo dõi trạng thái đơn hàng trong phần Dashboard của mình</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="action-buttons">
                                                <Link to="/" className="btn btn-secondary btn-lg me-3">
                                                    <i className="bx bx-home me-2"></i>
                                                    Về trang chủ
                                                </Link>
                                                <Link to="/bookings" className="btn btn-primary btn-lg">
                                                    <i className="bx bx-list-ul me-2"></i>
                                                    Xem lịch đặt của tôitôi
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

export default PaymentSuccess;
