import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMemo, useRef } from 'react';

const ProtectedRoute = ({ children, isAllowed, redirectPath = '/login' }) => {
    const location = useLocation();
    const { verificationStatus } = useSelector((state) => state.auth);
    const prevPathRef = useRef(location.pathname);

    const redirectInfo = useMemo(() => {
        // Nếu không được phép truy cập
        if (!isAllowed) {
            return {
                path: redirectPath,
                state: { from: location }
            };
        }

        // Nếu đang trong quá trình verification và không ở trang verification
        // CHỈ redirect nếu user đang ở trang khác và cần verification
        // if (verificationStatus?.step && 
        //     verificationStatus.step !== 'COMPLETED' && 
        //     verificationStatus.redirectTo && 
        //     location.pathname !== verificationStatus.redirectTo &&
        //     // Thêm điều kiện: chỉ redirect nếu không phải đang ở trang verification
        //     !location.pathname.includes('/verify-') &&
        //     !location.pathname.includes('/choose-role') &&
        //     // !location.pathname.includes('/technician/complete-profile') &&
        //     // Cho phép truy cập vào /profile ngay cả khi chưa hoàn thành verification
        //     !location.pathname.includes('/profile')) {
            
        //     return {
        //         path: verificationStatus.redirectTo,
        //         state: { from: location }
        //     };
        // }

        // Không cần redirect
        return null;
    }, [isAllowed, redirectPath, location, verificationStatus]);

    // Cập nhật prevPathRef khi location thay đổi
    if (location.pathname !== prevPathRef.current) {
        prevPathRef.current = location.pathname;
    }

    if (redirectInfo) {
        return <Navigate to={redirectInfo.path} replace state={redirectInfo.state} />;
    }

    return children;
};

export default ProtectedRoute;
