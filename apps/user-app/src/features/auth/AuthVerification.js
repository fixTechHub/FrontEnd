import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthVerification = () => {
    const { user, isAuthenticated, verificationStatus } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    // Ref to track the last known location to detect manual navigation
    const lastPathRef = useRef(location.pathname);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            return;
        }

        const nextStep = verificationStatus?.step || 'COMPLETED';
        const redirectTo = verificationStatus?.redirectTo;

        // Cập nhật lastPathRef
        lastPathRef.current = location.pathname;


        // Nếu có bước xác thực chưa hoàn thành và có redirectTo, chuyển hướng
        if (nextStep !== 'COMPLETED' && redirectTo && location.pathname !== redirectTo) {
            navigate(redirectTo);
             return;
         }

        // Nếu đã hoàn thành tất cả bước xác thực và không ở trang home, chuyển về home
        // Nhưng không redirect nếu đang ở các trang mà user có quyền truy cập
        if (nextStep === 'COMPLETED' && location.pathname !== '/') {
            // Chỉ redirect về home nếu đang ở các trang xác thực hoặc trang lỗi
            // Các trang cần redirect: /login, /register, /verify-email, /verify-otp, /choose-role, /forgot-password, /reset-password
            const authPages = [
                '/login', 
                '/register', 
                '/verify-email', 
                '/verify-otp', 
                '/choose-role', 
                '/forgot-password', 
                '/reset-password'
            ];
            
            const isAuthPage = authPages.some(path => location.pathname.startsWith(path));
            
            if (isAuthPage) {
                navigate('/');
            }
        }

        // Loại bỏ tự động điều hướng để tránh làm kẹt người dùng.
        // Component này hiện chỉ giữ chỗ để có thể hiển thị thông báo nếu cần.

    }, [isAuthenticated, user, verificationStatus, location.pathname, navigate]);

    return null; // This component does not render anything.
};

export default AuthVerification; 