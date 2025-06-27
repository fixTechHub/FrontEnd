import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyEmailThunk, resendEmailCodeThunk, logoutThunk, clearVerificationStatus } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaEnvelope } from 'react-icons/fa';

function VerifyEmailPage() {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [activeInput, setActiveInput] = useState(0);
    const { loading, user, isAuthenticated, verificationStatus, registrationData, registrationToken } = useSelector((state) => state.auth);

    const STORAGE_PREFIX = 'verifyEmail_';
    const storageKey = STORAGE_PREFIX + (user?.email || registrationData?.emailOrPhone || 'unknown');

    const readTimestamp = (key, def) => {
        const v = localStorage.getItem(key);
        return v ? parseInt(v, 10) : def;
    };

    const [timeLeft, setTimeLeft] = useState(0); // resend cooldown
    const [isResending, setIsResending] = useState(false);
    const [codeExpiryTime, setCodeExpiryTime] = useState(300);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [error, setError] = useState('');
    const [expireMsg, setExpireMsg] = useState('');

    // Tạo timer cho thời gian chờ gửi lại
    const startResendTimer = useCallback(() => {
        const end = Date.now() + 60 * 1000;
        localStorage.setItem(storageKey + '_resend', end.toString());
        setTimeLeft(60);
    }, [storageKey]);

    // Tạo timer cho thời gian hết hạn mã
    const startExpiryTimer = useCallback(() => {
        const end = Date.now() + 300 * 1000;
        localStorage.setItem(storageKey + '_expire', end.toString());
        setCodeExpiryTime(300);
    }, [storageKey]);

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
        if (verificationStatus?.step === 'VERIFY_EMAIL') {
            setShowVerificationForm(true);
        }
    }, [verificationStatus]);

    useEffect(() => {
        // Điều kiện dữ liệu
        if (!user?.email && !registrationToken) {
            dispatch(clearVerificationStatus());
            navigate('/login');
            return;
        }

        // Thiết lập giá trị ban đầu cho timers từ localStorage
        const now = Date.now();
        const resendEndStored = readTimestamp(storageKey + '_resend', 0);
        const expireEndStored = readTimestamp(storageKey + '_expire', 0);

        const resendEnd = resendEndStored;
        const expireEnd = expireEndStored || (async () => { const end = now + 300000; localStorage.setItem(storageKey + '_expire', end.toString()); return end; })();

        setTimeLeft(Math.max(0, Math.floor((resendEnd - now) / 1000)));
        Promise.resolve(expireEnd).then(eEnd=> setCodeExpiryTime(Math.max(0, Math.floor((eEnd - now) / 1000))));

        // Start interval to update expiry countdown
        const interval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
            setCodeExpiryTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [user, registrationToken, navigate, dispatch, storageKey]);

    // Thông báo khi mã hết hạn
    useEffect(() => {
        if (codeExpiryTime === 0) {
            setExpireMsg('Mã xác thực đã hết hạn. Vui lòng nhấn "Gửi lại mã" để lấy mã mới.');
        } else if (expireMsg) {
            setExpireMsg('');
        }
    }, [codeExpiryTime, expireMsg]);

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
        setError('');

        try {
            const result = await dispatch(verifyEmailThunk(verificationCode.join(''))).unwrap();
            toast.success('Xác thực email thành công!');

            // Điều hướng tùy vai trò
            if (result?.verificationStatus?.step === 'COMPLETE_PROFILE' || (result?.user?.role?.name === 'TECHNICIAN')) {
                navigate('/technician/complete-profile');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.message || 'Có lỗi xảy ra khi xác thực email');
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
            await dispatch(resendEmailCodeThunk()).unwrap();
            
            // reset timers and persist
            startResendTimer();
            startExpiryTimer();
            
            toast.success('Mã xác thực mới đã được gửi');
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

    // Disable verify if code expired
    const isCodeExpired = codeExpiryTime === 0;

    // Nếu không có user hoặc email, hiển thị loading
    if (!user?.email) {
        if (!registrationToken) {
            return (
                <div className="main-wrapper login-body">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Lấy email từ user hoặc registration data
    const emailToDisplay = user?.email || registrationData?.emailOrPhone;

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
                                    <strong className="text-dark">{emailToDisplay}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="verification-form">
                                {error && (
                                    <div className="alert alert-danger mb-3" role="alert">
                                        {error}
                                    </div>
                                )}
                                
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
                                    disabled={loading || verificationCode.join('').length !== 6 || isCodeExpired}
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
                                        ) : isCodeExpired ? (
                                            'Gửi lại mã'
                                        ) : timeLeft > 0 ? (
                                            `Gửi lại mã sau ${timeLeft}s`
                                        ) : 'Gửi lại mã xác thực'}
                                    </button>
                                </div>

                                {expireMsg && (
                                    <p className="text-danger mb-0 text-center">{expireMsg}</p>
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

export default VerifyEmailPage; 