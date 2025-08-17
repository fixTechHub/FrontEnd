import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateRegistrationData, finalizeRegistrationThunk, checkAuthThunk } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaBuilding, FaCheck, FaUserTie, FaStore } from 'react-icons/fa';
import authAPI from '../../features/auth/authAPI';

function ChooseAccountType() {
    const [selectedType, setSelectedType] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user } = useSelector((state) => state.auth);

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleSubmit = async () => {
        if (!selectedType) {
            toast.error('Vui lòng chọn loại tài khoản');
            return;
        }

        // Case 1: User đã đăng nhập (đăng ký Google) và cần cập nhật accountType
        if (user && user.role?.name === 'TECHNICIAN') {
            try {
                // Cập nhật accountType qua API
                const response = await authAPI.updateAccountType(selectedType);
                
                // Cập nhật Redux state với user có accountType mới
                await dispatch(checkAuthThunk());
                
                // Navigate to complete profile
                navigate('/technician/complete-profile', { replace: true });
                
                toast.success('Cập nhật loại tài khoản thành công!');
            } catch (error) {
                toast.error(error.message || 'Cập nhật loại tài khoản thất bại');
            }
            return;
        }

        // Case 2: Đang trong quá trình đăng ký thường
        dispatch(updateRegistrationData({ accountType: selectedType }));

        try {
            const result = await dispatch(finalizeRegistrationThunk()).unwrap();
            
            if (result.requiresVerification) {
                toast.success(result.message || 'Đăng ký hoàn tất! Vui lòng kiểm tra email để xác thực.');

                // Lấy thông tin user ngay để PrivateRoute cho phép vào trang xác thực
                await dispatch(checkAuthThunk());

                navigate('/verify-email');
            } else {
                // Đăng ký thành công, chuyển đến complete profile
                await dispatch(checkAuthThunk());
                navigate('/technician/complete-profile');
            }

        } catch (error) {
            toast.error(`Đăng ký thất bại: ${error.message || 'Lỗi không xác định'}`);
            navigate('/register');
        }
    };



    const accountTypes = [
        {
            id: 'INDIVIDUAL',
            name: 'Cá nhân', 
            description: 'Đăng ký dưới tên cá nhân với CCCD',
            icon: FaUserTie,
            benefits: [
                'Đăng ký nhanh chóng, đơn giản',
                'Sử dụng CCCD để xác thực',
                'Phù hợp với thợ tự do, freelancer',
                'Linh hoạt trong công việc'
            ]
        },
        {
            id: 'BUSINESS',
            name: 'Doanh nghiệp',
            description: 'Đăng ký dưới tên công ty/doanh nghiệp',
            icon: FaStore,
            benefits: [
                'Uy tín cao với khách hàng',
                'Có thể xuất hóa đơn VAT',
                'Phù hợp với công ty, cửa hàng',
                'Mở rộng quy mô kinh doanh'
            ]
        }
    ];

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
                            <div className="text-center mb-4">
                                <h3 className="mb-2 text-dark">Chọn Loại Tài Khoản</h3>
                            </div>
                            
                            <p className="text-center text-secondary mb-4">
                                Bạn muốn đăng ký dưới danh nghĩa cá nhân hay doanh nghiệp?
                            </p>

                            <div className="row g-4">
                                {accountTypes.map((type) => {
                                    const IconComponent = type.icon;
                                    const isSelected = selectedType === type.id;
                                    
                                    return (
                                        <div key={type.id} className="col-md-6">
                                            <div
                                                className={`card role-card h-100 ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleTypeSelect(type.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    border: isSelected ? '2px solid #007bff' : '1px solid #dee2e6',
                                                    backgroundColor: isSelected ? '#f8f9fa' : '#ffffff'
                                                }}
                                            >
                                                <div className="card-body">
                                                    <div className="text-center mb-3">
                                                        <div
                                                            className={`icon-circle mb-3 ${isSelected ? 'bg-primary text-white' : 'bg-light'}`}
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                borderRadius: '50%',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <IconComponent size={40} />
                                                        </div>
                                                        <h5 className="card-title text-dark">{type.name}</h5>
                                                        <p className="card-text text-secondary">{type.description}</p>
                                                    </div>
                                                    <ul className="list-unstyled">
                                                        {type.benefits.map((benefit, index) => (
                                                            <li key={index} className="mb-2 text-dark">
                                                                <FaCheck className="text-success me-2" />
                                                                {benefit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {isSelected && (
                                                    <div className="selected-badge position-absolute top-0 end-0 m-2">
                                                        <span className="badge bg-primary">
                                                            <FaCheck /> Đã chọn
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4">
                                <button
                                    className="btn btn-primary w-100 btn-size"
                                    onClick={handleSubmit}
                                    disabled={!selectedType || loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'TIẾP TỤC'
                                    )}
                                </button>
                            </div>


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

export default ChooseAccountType;
