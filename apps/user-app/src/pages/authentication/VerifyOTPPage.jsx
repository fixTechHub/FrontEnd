import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import authAPI from '../../features/auth/authAPI';
import { clearVerificationStatus, logoutThunk } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';
import '../../styles/auth.css';
import { FaMobileAlt } from 'react-icons/fa';

function VerifyOTPPage() {
    const [searchParams] = useSearchParams();
    const isResetPassword = searchParams.get('type') === 'reset-password';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [activeInput, setActiveInput] = useState(0);
    const STORAGE_PREFIX = 'verifyOTP_';
    const identifier = user?.phone || localStorage.getItem('resetPasswordPhone') || 'unknown';
    const storageKey = STORAGE_PREFIX + identifier;

    const readTS = (key, def) => {
        const v = localStorage.getItem(key);
        return v ? parseInt(v, 10) : def;
    };

    const [timeLeft, setTimeLeft] = useState(0);
    const [codeExpiryTime, setCodeExpiryTime] = useState(300);
    const [isLoading, setIsLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, user, isAuthenticated, verificationStatus } = useSelector((state) => state.auth);

    // Theo dõi thay đổi của verificationStatus để redirect
    useEffect(() => {
        if (verificationStatus?.redirectTo && verificationStatus.redirectTo !== '/verify-otp') {
            navigate(verificationStatus.redirectTo);
        }
    }, [verificationStatus, navigate]);

    // Khởi tạo timers từ localStorage
    useEffect(() => {
        const now = Date.now();
        const resendEnd = readTS(storageKey + '_resend', 0);
        const expireEnd = readTS(storageKey + '_expire', now + 300000);

        setTimeLeft(Math.max(0, Math.floor((resendEnd - now)/1000)));
        setCodeExpiryTime(Math.max(0, Math.floor((expireEnd - now)/1000)));

        const interval = setInterval(() => {
            setTimeLeft(prev => (prev>0?prev-1:0));
            setCodeExpiryTime(prev => (prev>0?prev-1:0));
        },1000);
        return ()=> clearInterval(interval);
    }, [storageKey]);

    // Xử lý khi component unmount hoặc user không còn authenticated
    useEffect(() => {
        return () => {
            if (!isAuthenticated) {
                dispatch(clearVerificationStatus());
            }
        };
    }, [isAuthenticated, dispatch]);

    const handleInputChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(pastedData)) return;

        const newOtp = pastedData.split('').slice(0, 6);
        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error('Vui lòng nhập đủ 6 số');
            return;
        }

        setIsLoading(true);
        try {
            if (isResetPassword) {
                // Xử lý xác thực OTP cho đặt lại mật khẩu
                await authAPI.resetPassword(otpValue);
                
                await Swal.fire({
                    title: 'Xác thực thành công!',
                    text: 'Vui lòng đặt mật khẩu mới cho tài khoản của bạn',
                    icon: 'success',
                    confirmButtonText: 'Tiếp tục',
                    confirmButtonColor: '#3085d6'
                });

                navigate(`/reset-password?token=${otpValue}`);
            } else {
                // Xử lý xác thực OTP bình thường
                const result = await authAPI.verifyOTP(otpValue);
                
                await Swal.fire({
                    title: 'Xác thực thành công!',
                    text: result.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Điều hướng tùy vai trò sau khi xác thực
                if (result.verificationStatus?.step === 'COMPLETE_PROFILE' || (result.user?.role?.name === 'TECHNICIAN')) {
                    navigate('/technician/complete-profile');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi xác thực OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi user muốn thoát
    const handleBack = async () => {
        // Đầu tiên điều hướng về home
        navigate('/');
        // Sau đó mới clear status
        dispatch(clearVerificationStatus());
    };

    const startResendTimer = useCallback(() => {
        const end = Date.now() + 60 * 1000;
        localStorage.setItem(storageKey + '_resend', end.toString());
        setTimeLeft(60);
    }, [storageKey]);

    const startExpiryTimer = useCallback(() => {
        const end = Date.now() + 300 * 1000;
        localStorage.setItem(storageKey + '_expire', end.toString());
        setCodeExpiryTime(300);
    }, [storageKey]);

    const handleResendOTP = async () => {
        if (timeLeft>0) return;
        setIsLoading(true);
        try {
            startResendTimer();
            startExpiryTimer();
            const phone = localStorage.getItem('resetPasswordPhone');
            if (isResetPassword && phone) {
                await authAPI.forgotPassword(phone);
                toast.success('Mã xác thực mới đã được gửi');
            } else {
                await authAPI.resendOTP();
                toast.success('Mã xác thực mới đã được gửi');
            }
            setResendDisabled(true);
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi gửi lại mã');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
    };

    const isCodeExpired = codeExpiryTime === 0;

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
                                    <FaMobileAlt size={50} className="text-primary" />
                                </div>
                                <h3 className="mb-2 text-dark">Xác thực Số điện thoại</h3>
                                <p className="text-secondary">
                                    Vui lòng nhập mã OTP đã được gửi đến số điện thoại<br />
                                    <strong className="text-dark">{formatPhoneNumber(localStorage.getItem('resetPasswordPhone'))}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="needs-validation">
                                <div className="input-block mb-4">
                                    <label className="form-label text-dark">
                                        Mã OTP <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex gap-2 justify-content-between">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                className="form-control text-center"
                                                value={digit}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                maxLength={1}
                                                style={{ width: '3rem' }}
                                                required
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 mb-3"
                                    disabled={isLoading || loading || otp.join('').length !== 6 || isCodeExpired}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        className="btn btn-link text-primary"
                                        onClick={handleResendOTP}
                                        disabled={timeLeft>0 || isLoading}
                                    >
                                        {isCodeExpired && timeLeft===0 ? 'Gửi lại mã': timeLeft>0?`Gửi lại mã sau ${timeLeft}s`:'Gửi lại mã'}
                                    </button>
                                </div>

                                {isCodeExpired ? (
                                    <p className="text-danger mt-2">Mã xác thực đã hết hạn. Vui lòng nhấn "Gửi lại mã".</p>
                                ): timeLeft>0 && (
                                    <p className="text-secondary mt-2">Bạn có thể gửi lại mã sau {timeLeft} giây</p>
                                )}
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

export default VerifyOTPPage;