import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyEmailThunk, resendEmailCodeThunk, logoutThunk, clearVerificationStatus } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaEnvelope } from 'react-icons/fa';

function VerifyEmailPage() {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [activeInput, setActiveInput] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // Bắt đầu với 0 để có thể gửi ngay
    const [isResending, setIsResending] = useState(false);
    const [codeExpiryTime, setCodeExpiryTime] = useState(300); // 5 phút cho mã xác thực
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user, isAuthenticated, verificationStatus } = useSelector((state) => state.auth);

    // Tạo timer cho thời gian chờ gửi lại
    const startResendTimer = useCallback(() => {
        setTimeLeft(60); // 60 giây cho thời gian chờ gửi lại
        return setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }, []);

    // Tạo timer cho thời gian hết hạn mã
    const startExpiryTimer = useCallback(() => {
        setCodeExpiryTime(300); // 5 phút cho mã xác thực
        return setInterval(() => {
            setCodeExpiryTime((prevTime) => {
                if (prevTime <= 1) {
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }, []);

    // Xử lý khi component unmount hoặc user không còn authenticated
    useEffect(() => {
        return () => {
            if (!isAuthenticated) {
                dispatch(clearVerificationStatus());
            }
        };
    }, [isAuthenticated, dispatch]);

    // Theo dõi thay đổi của verificationStatus để redirect
    useEffect(() => {
        console.log('=== DEBUG VerifyEmailPage verificationStatus ===');
        console.log('verificationStatus:', verificationStatus);
        console.log('user:', user);
        console.log('current pathname:', window.location.pathname);
        
        // Chỉ redirect nếu verificationStatus yêu cầu chuyển đến trang khác
        // và không phải trang hiện tại
        if (verificationStatus?.redirectTo && 
            verificationStatus.redirectTo !== '/verify-email' &&
            verificationStatus.redirectTo !== window.location.pathname) {
            console.log('Redirecting to:', verificationStatus.redirectTo);
            navigate(verificationStatus.redirectTo);
        }
    }, [verificationStatus, navigate]);

    useEffect(() => {
        if (!user?.email) {
            dispatch(clearVerificationStatus());
            navigate('/login');
            return;
        }

        // Khởi tạo timer cho thời gian hết hạn mã
        const expiryTimer = startExpiryTimer();

        // Cleanup timer khi component unmount
        return () => {
            clearInterval(expiryTimer);
        };
    }, [user, navigate, startExpiryTimer, dispatch]);

    const handleInputChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            setActiveInput(index + 1);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            setActiveInput(index - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const code = verificationCode.join('');
            if (code.length !== 6) {
                toast.error('Vui lòng nhập đủ 6 chữ số');
                return;
            }

            const result = await dispatch(verifyEmailThunk(code)).unwrap();
            console.log('=== DEBUG VerifyEmailPage handleSubmit ===');
            console.log('Backend response:', result);
            console.log('User after verification:', result.user);
            console.log('VerificationStatus from backend:', result.verificationStatus);
            
            toast.success('Xác thực email thành công!');
            
            // Không cần clear verification status và navigate
            // Logic verificationStatus sẽ tự động redirect
        } catch (error) {
            console.error('Verification error details:', error);
            toast.error(error.message || 'Xác thực thất bại');
        }
    };

    // Xử lý khi user muốn thoát
    const handleBack = async () => {
        // Chỉ clear status nếu user chưa hoàn thành xác thực
        if (verificationStatus && verificationStatus.step !== 'COMPLETED') {
            dispatch(clearVerificationStatus());
        }
        // Điều hướng về home
        navigate('/');
    };

    const handleResendCode = async () => {
        if (isResending || timeLeft > 0) return;
        
        try {
            setIsResending(true);
            const result = await dispatch(resendEmailCodeThunk()).unwrap();
            
            // Khởi động timer cho thời gian chờ gửi lại
            const resendTimer = startResendTimer();
            
            // Reset timer cho thời gian hết hạn mã
            startExpiryTimer();
            
            toast.success(result.message || 'Mã xác thực mới đã được gửi');

            // Cleanup resend timer sau khi hoàn thành
            return () => clearInterval(resendTimer);
        } catch (error) {
            toast.error(error.message || 'Không thể gửi lại mã xác thực');
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="main-wrapper login-body">
            <header className="log-header">
                <a href="/" onClick={(e) => {
                    e.preventDefault();
                    handleBack();
                }}>
                    <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
                </a>
            </header>

            <div className="login-wrapper">
                <div className="loginbox">
                    <div className="login-auth">
                        <div className="login-auth-wrap">
                            <div className="text-center mb-4">
                                <div className="mb-4">
                                    <FaEnvelope size={50} className="text-primary" />
                                </div>
                                <h3 className="mb-2 text-dark">Xác thực Email</h3>
                                <p className="text-secondary">
                                    Vui lòng nhập mã xác thực đã được gửi đến email<br />
                                    <strong className="text-dark">{user?.email}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="verification-form">
                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            className="form-control text-center fw-bold fs-5"
                                            style={{ 
                                                width: '45px', 
                                                height: '45px',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #ced4da'
                                            }}
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            ref={input => {
                                                if (input && index === activeInput) {
                                                    input.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 btn-size mb-3"
                                    disabled={loading || verificationCode.join('').length !== 6}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ĐANG XỬ LÝ...</>
                                    ) : 'XÁC THỰC'}
                                </button>

                                <div className="text-center">
                                    <p className="mb-2 text-dark">
                                        Mã xác thực còn hiệu lực: <strong>{formatTime(codeExpiryTime)}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        className="btn btn-link text-primary fw-medium"
                                        onClick={handleResendCode}
                                        disabled={isResending || timeLeft > 0}
                                    >
                                        {isResending ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ĐANG GỬI...</>
                                        ) : timeLeft > 0 ? (
                                            `Gửi lại mã sau ${timeLeft}s`
                                        ) : 'Gửi lại mã xác thực'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="log-footer">
                <div className="container-fluid">
                    <div className="copyright">
                        <div className="copyright-text">
                            <p>© 2024 FixTech. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default VerifyEmailPage; 