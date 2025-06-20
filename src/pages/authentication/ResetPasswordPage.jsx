import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaLock, FaInfoCircle } from 'react-icons/fa';
import authAPI from '../../features/auth/authAPI';
import Swal from 'sweetalert2';
import '../../styles/auth.css';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        newPassword: false,
        confirmPassword: false
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePasswords = () => {
        if (formData.newPassword.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;
        
        setLoading(true);
        try {
            await authAPI.resetPassword(token, formData.newPassword);
            
            await Swal.fire({
                title: 'Thành công!',
                text: 'Mật khẩu của bạn đã được đặt lại',
                icon: 'success',
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#3085d6'
            });

            navigate('/login');
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.toString() || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="main-wrapper login-body">
                <div className="login-wrapper">
                    <div className="loginbox">
                        <div className="login-auth">
                            <div className="login-auth-wrap">
                                <h1 className="text-center mb-4 text-dark">Liên kết không hợp lệ</h1>
                                <p className="text-center text-secondary">
                                    Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                                    Vui lòng thử lại quá trình đặt lại mật khẩu.
                                </p>
                                <a href="/forgot-password" className="btn btn-primary w-100">
                                    Quay lại trang quên mật khẩu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-center mb-4 text-dark">Đặt lại mật khẩu</h1>
                            <p className="text-center text-secondary mb-4">
                                Nhập mật khẩu mới cho tài khoản của bạn
                            </p>

                            <div className="alert alert-info mb-4">
                                <FaInfoCircle className="me-2" />
                                <strong>Yêu cầu mật khẩu:</strong>
                                <ul className="mb-0 mt-2">
                                    <li>Ít nhất 8 ký tự</li>
                                    <li>Ít nhất một chữ hoa (A-Z)</li>
                                    <li>Ít nhất một chữ thường (a-z)</li>
                                    <li>Ít nhất một số (0-9)</li>
                                    <li>Ít nhất một ký tự đặc biệt (@$!%*?&)</li>
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit} className="needs-validation">
                                <div className="input-block mb-3">
                                    <label className="form-label text-dark">
                                        Mật khẩu mới <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 translate-middle-y ps-3">
                                            <FaLock className="text-secondary" />
                                        </span>
                                        <input 
                                            type={showPassword.newPassword ? "text" : "password"}
                                            className="form-control ps-5 pe-5 bg-white"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                        >
                                            {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="input-block mb-4">
                                    <label className="form-label text-dark">
                                        Xác nhận mật khẩu <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 translate-middle-y ps-3">
                                            <FaLock className="text-secondary" />
                                        </span>
                                        <input 
                                            type={showPassword.confirmPassword ? "text" : "password"}
                                            className="form-control ps-5 pe-5 bg-white"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Xác nhận mật khẩu mới"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                        >
                                            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        <a href="/login" className="text-primary fw-medium">
                                            Quay lại trang đăng nhập
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

export default ResetPasswordPage; 