import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearVerificationStatus, logoutThunk } from './authSlice';

const AuthVerification = () => {
    const { verificationStatus, user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const prevStepRef = useRef(null);
    const completedRef = useRef(false);
    const lastPathRef = useRef(location.pathname);

    useEffect(() => {
        // Reset refs khi không có user hoặc chưa đăng nhập
        if (!isAuthenticated || !user) {
            prevStepRef.current = null;
            completedRef.current = false;
            return;
        }

        // Danh sách các trang xác thực
        const authPages = ['/choose-role', '/verify-email', '/verify-otp', '/technician/complete-profile'];
        
        // Kiểm tra nếu người dùng đang cố gắng thoát khỏi trang xác thực
        const wasOnAuthPage = authPages.some(page => lastPathRef.current.includes(page));
        const isOnHomePage = location.pathname === '/';
        
        if (wasOnAuthPage && isOnHomePage) {
            console.log('User manually left auth page, logging out...');
            dispatch(logoutThunk());
            return;
        }

        // Cập nhật lastPathRef
        lastPathRef.current = location.pathname;

        // Kiểm tra trạng thái xác thực của người dùng
        let nextStep = null;
        let redirectTo = null;

        // Kiểm tra các bước theo thứ tự ưu tiên
        if (user.role?.name === 'PENDING') {
            nextStep = 'CHOOSE_ROLE';
            redirectTo = '/choose-role';
        } else if (user.email && !user.emailVerified) {
            nextStep = 'VERIFY_EMAIL';
            redirectTo = '/verify-email';
        } else if (user.phone && !user.phoneVerified) {
            nextStep = 'VERIFY_PHONE';
            redirectTo = '/verify-otp';
        } else if (user.role?.name === 'TECHNICIAN' && (!user.status || user.status === 'PENDING')) {
            nextStep = 'COMPLETE_PROFILE';
            redirectTo = '/technician/complete-profile';
        }

        // Nếu có bước tiếp theo và khác với bước trước đó
        if (nextStep && prevStepRef.current !== nextStep) {
            prevStepRef.current = nextStep;
            completedRef.current = false;

            // Hiển thị thông báo tương ứng
            switch (nextStep) {
                case 'CHOOSE_ROLE':
                    toast.info('Vui lòng chọn vai trò của bạn để tiếp tục');
                    break;
                case 'VERIFY_EMAIL':
                    toast.info('Vui lòng xác thực email của bạn để tiếp tục');
                    break;
                case 'VERIFY_PHONE':
                    toast.info('Vui lòng xác thực số điện thoại của bạn để tiếp tục');
                    break;
                case 'COMPLETE_PROFILE':
                    toast.info('Vui lòng hoàn thành hồ sơ của bạn để tiếp tục');
                    break;
                default:
                    break;
            }

            // Chỉ chuyển hướng nếu không phải đang ở trang chủ sau khi thoát khỏi trang xác thực
            if (redirectTo && location.pathname !== redirectTo && !isOnHomePage) {
                navigate(redirectTo);
            }
        } else if (!nextStep && !completedRef.current) {
            // Nếu không có bước tiếp theo và chưa đánh dấu là đã hoàn thành
            completedRef.current = true;
            
            // Nếu đang ở trang xác thực và đã hoàn thành tất cả các bước
            if (authPages.includes(location.pathname)) {
                // Chuyển về homepage bằng navigate
                navigate('/', { replace: true });
            }
        }

        // Cleanup function
        return () => {
            if (verificationStatus) {
                dispatch(clearVerificationStatus());
            }
        };
    }, [user, isAuthenticated, verificationStatus, navigate, dispatch, location]);

    return null;
};

export default AuthVerification; 