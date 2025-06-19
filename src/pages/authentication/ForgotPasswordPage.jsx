import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import authAPI from '../../features/auth/authAPI';
import Swal from 'sweetalert2';
import '../../styles/auth.css';

function ForgotPasswordPage() {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyMethod, setVerifyMethod] = useState('email'); // 'email' or 'phone'
    const navigate = useNavigate();

    const validateInput = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (verifyMethod === 'email' && !emailRegex.test(emailOrPhone)) {
            toast.error('Email không hợp lệ');
            return false;
        }

        if (verifyMethod === 'phone' && !phoneRegex.test(emailOrPhone)) {
            toast.error('Số điện thoại không hợp lệ (phải có 10 chữ số)');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInput()) return;
        
        setLoading(true);
        try {
            const response = await authAPI.forgotPassword(emailOrPhone);
            
            // Lưu email/phone để sử dụng ở trang xác thực
            if (verifyMethod === 'phone') {
                localStorage.setItem('resetPasswordPhone', emailOrPhone);
            }
            
            // Hiển thị thông báo thành công
            await Swal.fire({
                title: verifyMethod === 'email' ? 'Đã gửi email!' : 'Đã gửi mã OTP!',
                text: verifyMethod === 'email' 
                    ? 'Vui lòng kiểm tra email của bạn để nhận link đặt lại mật khẩu'
                    : 'Vui lòng kiểm tra tin nhắn để lấy mã OTP',
                icon: 'success',
                confirmButtonText: 'Đã hiểu',
                confirmButtonColor: '#3085d6'
            });

            // Nếu là số điện thoại, chuyển đến trang nhập OTP
            if (verifyMethod === 'phone') {
                navigate('/verify-otp?type=reset-password');
            } else {
                // Nếu là email, để người dùng check email
                navigate('/login');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            // Hiển thị thông báo lỗi từ server
            toast.error(error.toString() || 'Có lỗi xảy ra khi gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-wrapper login-body">
            <header className="log-header">
                <a href="/">
                    <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
                </a>
            </header>

            <div className="login-wrapper">
                <div className="loginbox">
                    <div className="login-auth">
                        <div className="login-auth-wrap">
                            <h1 className="text-center mb-4 text-dark">Quên Mật Khẩu?</h1>
                            <p className="text-center text-secondary mb-4">
                                Nhập email hoặc số điện thoại của bạn để nhận hướng dẫn đặt lại mật khẩu
                            </p>

                            <form onSubmit={handleSubmit} className="needs-validation">
                                <div className="mb-4">
                                    <div className="btn-group w-100" role="group">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="verifyMethod"
                                            id="emailMethod"
                                            checked={verifyMethod === 'email'}
                                            onChange={() => {
                                                setVerifyMethod('email');
                                                setEmailOrPhone('');
                                            }}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="emailMethod">
                                            <FaEnvelope className="me-2" />
                                            Email
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="verifyMethod"
                                            id="phoneMethod"
                                            checked={verifyMethod === 'phone'}
                                            onChange={() => {
                                                setVerifyMethod('phone');
                                                setEmailOrPhone('');
                                            }}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="phoneMethod">
                                            <FaPhone className="me-2" />
                                            Số điện thoại
                                        </label>
                                    </div>
                                </div>

                                <div className="input-block mb-4">
                                    <label className="form-label text-dark">
                                        {verifyMethod === 'email' ? 'Email' : 'Số điện thoại'} <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 translate-middle-y ps-3">
                                            {verifyMethod === 'email' ? <FaEnvelope className="text-secondary" /> : <FaPhone className="text-secondary" />}
                                        </span>
                                        <input 
                                            type={verifyMethod === 'email' ? "email" : "tel"}
                                            className="form-control ps-5 bg-white"
                                            value={emailOrPhone}
                                            onChange={(e) => setEmailOrPhone(e.target.value)}
                                            placeholder={verifyMethod === 'email' ? "Nhập email của bạn" : "Nhập số điện thoại của bạn"}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Đã nhớ mật khẩu? {' '}
                                        <a href="/login" className="text-primary fw-medium">
                                            Đăng nhập
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage; 