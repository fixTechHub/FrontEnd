import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateRegistrationData, finalizeRegistrationThunk, clearRegistrationData, checkAuthThunk, updateUserState } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaTools, FaCheck } from 'react-icons/fa';
import authAPI from '../../features/auth/authAPI';

function ChooseRole() {
    const [selectedRole, setSelectedRole] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, user } = useSelector((state) => state.auth);
    const { items: roles } = useSelector((state) => state.roles);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (!selectedRole) {
            toast.error('Vui lòng chọn vai trò của bạn');
            return;
        }

        // Case 1: User đã đăng nhập (đăng ký Google) và cần cập nhật role
        if (user && (user.role?.name === 'PENDING' || !user.role)) {
            try {
                const response = await authAPI.updateRole(selectedRole);

                // 1. Cập nhật Redux state ngay lập tức với role mới
                dispatch(updateUserState(response.user));

                // 2. Xác định role mới để điều hướng sớm, tránh PrivateRoute của trang hiện tại can thiệp
                const newRole = response.user.role?.name || selectedRole;

                // 3. Điều hướng ngay sang trang tương ứng
                if (newRole === 'TECHNICIAN') {
                    navigate('/choose-account-type', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }

                // 4. Sau khi đã điều hướng, đồng bộ lại với backend (lấy technician profile, v.v.)
                await dispatch(checkAuthThunk());

                // 5. Thông báo thành công
                toast.success('Cập nhật vai trò thành công!');
            } catch (error) {
                toast.error(error.message || 'Cập nhật vai trò thất bại');
            }
            return;
        }

        // Case 2: Người dùng đang hoàn tất đăng ký thường (email/phone)
        dispatch(updateRegistrationData({ role: selectedRole }));

        // Nếu chọn TECHNICIAN, chuyển đến ChooseAccountType trước khi finalize
        if (selectedRole === 'TECHNICIAN') {
            navigate('/choose-account-type');
            return;
        }

        try {
            const result = await dispatch(finalizeRegistrationThunk()).unwrap();
            
            if (result.requiresVerification) {
                toast.success(result.message || 'Đăng ký hoàn tất! Vui lòng kiểm tra email để xác thực.');

                // Lấy thông tin user ngay để PrivateRoute cho phép vào trang xác thực
                await dispatch(checkAuthThunk());

                navigate('/verify-email');
            } else {
                toast.success('Đăng ký hoàn tất! Vui lòng đăng nhập để tiếp tục.');
                dispatch(clearRegistrationData());
                navigate('/login');
            }

        } catch (error) {
            toast.error(`Đăng ký thất bại: ${error.message || 'Lỗi không xác định'}`);
            navigate('/register');
        }
    };

    // Handle user going back
    const handleBack = () => {
        // Just navigate back, the data is still in Redux
        navigate('/register');
    };

    // Map mô tả & icon cho từng role
    const roleMeta = {
        CUSTOMER: {
            title: 'Khách hàng',
            icon: <FaUser size={40} />,
            description: 'Đặt dịch vụ sửa chữa, gửi yêu cầu kỹ thuật',
            benefits: [
                'Tìm kiếm kỹ thuật viên phù hợp',
                'Đặt lịch và theo dõi tiến độ',
                'Đánh giá và phản hồi dịch vụ'
            ]
        },
        TECHNICIAN: {
            title: 'Kỹ thuật viên',
            icon: <FaTools size={40} />,
            description: 'Nhận và thực hiện các yêu cầu sửa chữa',
            benefits: [
                'Quản lý công việc linh hoạt',
                'Nhận thanh toán an toàn',
                'Xây dựng hồ sơ chuyên môn'
            ]
        },
    };

    // Tạo danh sách roleCards dựa trên roles lấy từ BE (nếu có)
    const roleCards = useMemo(() => {
        if (Array.isArray(roles) && roles.length > 0) {
            return roles
                .filter(r => roleMeta[r.name])
                .map(r => ({ id: r.name, ...roleMeta[r.name] }));
        }
        // Fallback khi roles chưa tải – dùng hai role mặc định
        return ['CUSTOMER','TECHNICIAN'].map(id => ({ id, ...roleMeta[id] }));
    }, [roles]);

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
                                    disabled={loading || !selectedRole}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>ĐANG HOÀN TẤT...</>
                                    ) : 'XÁC NHẬN VAI TRÒ'}
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

            <style>{`
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
