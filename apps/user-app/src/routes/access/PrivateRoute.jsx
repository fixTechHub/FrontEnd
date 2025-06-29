import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React, { useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

// requiredRole: string | string[] | undefined => nếu truyền, route chỉ cho phép user có role tương ứng
// isAllowed: boolean | undefined => giữ tương thích cũ; nếu undefined thì component tự tính dựa trên role & auth
const ProtectedRoute = ({ children, isAllowed, requiredRole, redirectPath = '/login', unauthorizedMessage }) => {
    const location = useLocation();
    const { verificationStatus, isAuthenticated, user } = useSelector((state) => state.auth);
    const prevPathRef = useRef(location.pathname);
    const lastToastMessageRef = useRef('');

    const verificationPaths = ['/choose-role','/verify-email','/verify-otp','/technician/complete-profile'];

    // Tính toán quyền nếu prop isAllowed không truyền
    let computedAllowed = isAllowed;
    if (typeof isAllowed === 'undefined') {
        const roleMatch = !requiredRole ? true : (
            Array.isArray(requiredRole)
                ? requiredRole.includes(user?.role?.name)
                : user?.role?.name === requiredRole
        );
        computedAllowed = isAuthenticated && roleMatch;
    }

    const redirectInfo = useMemo(() => {
        // Nếu không được phép truy cập
        if (!computedAllowed) {
            // Với các trang verification flow, không hiển thị toast khi hoàn tất và tự rời trang
            const comingFromVerification = verificationPaths.some(p => location.pathname.startsWith(p));

            const defaultMsg = isAuthenticated ? 'Bạn không có quyền truy cập trang này' : 'Vui lòng đăng nhập để tiếp tục';

            return {
                path: isAuthenticated ? '/' : '/login', // nếu đã login nhưng không đủ quyền -> về home
                message: comingFromVerification ? null : (unauthorizedMessage || defaultMsg),
                state: { from: location }
            };
        }

        // Nếu đang trong quá trình verification và không ở trang verification
        if (verificationStatus?.step &&
            verificationStatus.step !== 'COMPLETED' &&
            verificationStatus.redirectTo &&
            location.pathname !== verificationStatus.redirectTo &&
            !location.pathname.includes('/verify-') &&
            !location.pathname.includes('/choose-role') &&
            !location.pathname.includes('/profile')) {
            return {
                path: '/',
                message: verificationStatus.message || 'Vui lòng hoàn thành xác thực (xem thông tin trong hồ sơ)',
                state: { from: location }
            };
        }

        // Không cần redirect
        return null;
    }, [computedAllowed, requiredRole, redirectPath, location, verificationStatus, isAuthenticated, unauthorizedMessage]);

    // Cập nhật prevPathRef khi location thay đổi
    if (location.pathname !== prevPathRef.current) {
        prevPathRef.current = location.pathname;
    }

    if (redirectInfo) {
        if (redirectInfo.message && redirectInfo.message !== lastToastMessageRef.current) {
            // Xây nội dung toast kèm link hành động nhanh (nếu có)
            const defaultMsgs = ['Bạn không có quyền truy cập trang này','Vui lòng đăng nhập để tiếp tục'];
            const showActionLink = verificationStatus?.step && verificationStatus.step !== 'COMPLETED' && !defaultMsgs.includes(redirectInfo.message);
            const actionPath = showActionLink ? verificationStatus.redirectTo : null;
            const content = actionPath ? (
                <span>
                    {redirectInfo.message}. &nbsp;
                    <a href={actionPath} style={{ textDecoration: 'underline' }}>Hoàn thành ngay</a>
                </span>
            ) : redirectInfo.message;

            toast.info(content, { autoClose: 5000 });
            lastToastMessageRef.current = redirectInfo.message;
        }
        return <Navigate to={redirectInfo.path} replace state={redirectInfo.state} />;
    }

    return children;
};

export default ProtectedRoute;
