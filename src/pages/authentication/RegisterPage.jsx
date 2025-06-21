import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { googleLoginThunk, updateRegistrationData } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { validateEmail, validatePhone, validatePasswordStrength } from '../../utils/validation';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import '../../styles/auth.css';

function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        emailOrPhone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    });
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        }

        if (!formData.emailOrPhone) {
            newErrors.emailOrPhone = 'Vui lòng nhập email hoặc số điện thoại';
        } else if (formData.emailOrPhone.includes('@')) {
            if (!validateEmail(formData.emailOrPhone)) {
                newErrors.emailOrPhone = 'Email không hợp lệ';
            }
        } else {
            if (!validatePhone(formData.emailOrPhone)) {
                newErrors.emailOrPhone = 'Số điện thoại không hợp lệ';
            }
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (!validatePasswordStrength(formData.password)) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Dispatch data to Redux store instead of calling API
        dispatch(updateRegistrationData({
            fullName: formData.fullName.trim(),
            emailOrPhone: formData.emailOrPhone.trim().toLowerCase(),
            password: formData.password,
        }));

        // Navigate to the next step
        navigate('/choose-role');
    };

    const handleGoogleLogin = async () => {
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: 'email profile',
                callback: async (response) => {
                    if (response.error) return;
                    
                    try {
                        const result = await dispatch(googleLoginThunk(response.access_token)).unwrap();
                        
                        if (result.user.role.name === 'PENDING') {
                            navigate('/choose-role');
                        } else if (result.user.role.name === 'ADMIN') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/');
                        }
                    } catch (error) {
                        toast.error(error.message || 'Đăng nhập Google thất bại');
                    }
                },
            });

            client.requestAccessToken();
        } catch (error) {
            toast.error('Không thể khởi tạo đăng nhập Google');
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
                            <h1 className="text-center mb-4 text-dark">Đăng Ký</h1>
                            <p className="text-center text-secondary mb-4">
                                Chúng tôi sẽ gửi mã xác nhận tới email hoặc số điện thoại của bạn.
                            </p>

                            <form onSubmit={handleSubmit} className="needs-validation">
                                <div className="input-block mb-3">
                                    <label className="form-label text-dark">
                                        Họ và tên <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative">
                                        <span className="position-absolute top-50 translate-middle-y ps-3">
                                            <FaUser className="text-secondary" />
                                        </span>
                                        <input 
                                            type="text" 
                                            className={`form-control ps-5 bg-white ${errors.fullName ? 'is-invalid' : ''}`}
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                        />
                                        {errors.fullName && (
                                            <div className="invalid-feedback">{errors.fullName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="input-block mb-3">
                                    <label className="form-label text-dark">
                                        Email / Số điện thoại <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative" style={{ marginBottom: errors.emailOrPhone ? '24px' : '0' }}>
                                        <span className="position-absolute top-50 translate-middle-y ps-3">
                                            <FaEnvelope className="text-secondary" />
                                        </span>
                                        <input 
                                            type="text" 
                                            className={`form-control ps-5 bg-white ${errors.emailOrPhone ? 'is-invalid' : ''}`}
                                            name="emailOrPhone"
                                            value={formData.emailOrPhone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập email hoặc số điện thoại"
                                        />
                                        {errors.emailOrPhone && (
                                            <div className="invalid-feedback position-absolute" style={{ top: '100%' }}>{errors.emailOrPhone}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="input-block mb-3">
                                    <label className="form-label text-dark">
                                        Mật khẩu <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative" style={{ marginBottom: errors.password ? '24px' : '0' }}>
                                        <span className="position-absolute top-50 translate-middle-y ps-3" style={{ zIndex: 2 }}>
                                            <FaLock className="text-secondary" />
                                        </span>
                                        <input 
                                            type={showPassword.password ? "text" : "password"}
                                            className={`form-control ps-5 pe-5 bg-white ${errors.password ? 'is-invalid' : ''}`}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mật khẩu"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                                            onClick={() => togglePasswordVisibility('password')}
                                            style={{ zIndex: 2 }}
                                        >
                                            {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && (
                                            <div className="invalid-feedback position-absolute" style={{ top: '100%' }}>
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`input-block ${errors.confirmPassword ? 'mb-5' : 'mb-4'}`}>
                                    <label className="form-label text-dark">
                                        Xác nhận mật khẩu <span className="text-danger">*</span>
                                    </label>
                                    <div className="position-relative" style={{ marginBottom: errors.confirmPassword ? '24px' : '0' }}>
                                        <span className="position-absolute top-50 translate-middle-y ps-3" style={{ zIndex: 2 }}>
                                            <FaLock className="text-secondary" />
                                        </span>
                                        <input 
                                            type={showPassword.confirmPassword ? "text" : "password"}
                                            className={`form-control ps-5 pe-5 bg-white ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Nhập lại mật khẩu"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            style={{ zIndex: 2 }}
                                        >
                                            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.confirmPassword && (
                                            <div className="invalid-feedback position-absolute" style={{ top: '100%' }}>
                                                {errors.confirmPassword}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 btn-size mb-4"
                                >
                                    TIẾP TỤC
                                </button>

                                <div className="text-center mb-4">
                                    <p className="text-secondary mb-0">Hoặc</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="btn btn-outline-secondary w-100 mb-4"
                                >
                                    <span className="d-flex justify-content-center align-items-center">
                                        <img src="/img/icons/google.svg" alt="Google" className="me-2" style={{ width: '20px' }} />
                                        <span>Đăng nhập với Google</span>
                                    </span>
                                </button>

                                <div className="text-center">
                                    <span className="text-dark">Bạn đã có tài khoản?</span> <a className="text-primary fw-bold" href="/login">Đăng nhập</a>
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

export default RegisterPage;