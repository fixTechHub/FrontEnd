import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeRegistrationThunk, logoutThunk } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaTools, FaCheck } from 'react-icons/fa';

function ChooseRole() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user } = useSelector((state) => state.auth);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (!selectedRole) {
            toast.error('Vui lòng chọn vai trò của bạn');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await dispatch(completeRegistrationThunk(selectedRole)).unwrap();
            toast.success('Đã chọn vai trò thành công!');
            
            // Nếu cần xác minh thêm, điều hướng đến bước tiếp theo
            if (!user.emailVerified && user.email) {
                navigate('/verify-email');
            } else if (!user.phoneVerified && user.phone) {
                navigate('/verify-otp');
            } else {
                // Nếu đã hoàn thành mọi bước, đăng xuất và yêu cầu đăng nhập lại
                await dispatch(logoutThunk());
                toast.info('Vui lòng đăng nhập lại để tiếp tục.');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.message || 'Không thể chọn vai trò');
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleCards = [
        {
            id: 'CUSTOMER',
            title: 'Khách hàng',
            icon: <FaUser size={40} />,
            description: 'Đặt dịch vụ sửa chữa, gửi yêu cầu kỹ thuật',
            benefits: [
                'Tìm kiếm kỹ thuật viên phù hợp',
                'Đặt lịch và theo dõi tiến độ',
                'Đánh giá và phản hồi dịch vụ'
            ]
        },
        {
            id: 'TECHNICIAN',
            title: 'Kỹ thuật viên',
            icon: <FaTools size={40} />,
            description: 'Nhận và thực hiện các yêu cầu sửa chữa',
            benefits: [
                'Quản lý công việc linh hoạt',
                'Nhận thanh toán an toàn',
                'Xây dựng hồ sơ chuyên môn'
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
                                <h3 className="mb-2 text-dark">Chọn vai trò của bạn</h3>
                                <p className="text-secondary">Bạn muốn sử dụng nền tảng với tư cách nào?</p>
                        </div>

                            <div className="row g-4">
                                {roleCards.map((role) => (
                                    <div key={role.id} className="col-md-6">
                                        <div
                                            className={`card role-card h-100 ${selectedRole === role.id ? 'selected' : ''}`}
                                            onClick={() => handleRoleSelect(role.id)}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                transform: selectedRole === role.id ? 'scale(1.02)' : 'scale(1)',
                                                border: selectedRole === role.id ? '2px solid #007bff' : '1px solid #dee2e6',
                                                backgroundColor: selectedRole === role.id ? '#f8f9fa' : '#ffffff'
                                            }}
                                        >
                                            <div className="card-body">
                                                <div className="text-center mb-3">
                                                    <div
                                                        className={`icon-circle mb-3 ${selectedRole === role.id ? 'bg-primary text-white' : 'bg-light'}`}
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
                                                        {role.icon}
                                                    </div>
                                                    <h5 className="card-title text-dark">{role.title}</h5>
                                                    <p className="card-text text-secondary">{role.description}</p>
                                                </div>
                                                <ul className="list-unstyled">
                                                    {role.benefits.map((benefit, index) => (
                                                        <li key={index} className="mb-2 text-dark">
                                                            <FaCheck className="text-success me-2" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {selectedRole === role.id && (
                                                <div className="selected-badge position-absolute top-0 end-0 m-2">
                                                    <span className="badge bg-primary">
                                                        <FaCheck /> Đã chọn
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <button
                                    className="btn btn-primary w-100 btn-size"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedRole}
                                >
                                    {isSubmitting ? (
                                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ĐANG XỬ LÝ...</>
                                    ) : 'XÁC NHẬN'}
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

            <style jsx>{`
                .role-card {
                    transition: all 0.3s ease;
                }
                .role-card:hover {
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .role-card.selected {
                    background-color: #f8f9fa;
                }
                .selected-badge {
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            </div>
    );
}

export default ChooseRole;
