import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const VerificationHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, verificationStatus } = useSelector((state) => state.auth);
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        // Nếu không authenticated hoặc không có verification status, không cần xử lý
        if (!isAuthenticated || !verificationStatus?.step) {
            return;
        }

        // Nếu đã hoàn thành verification, không cần xử lý
        if (verificationStatus.step === 'COMPLETED') {
            return;
        }

        // Nếu đang ở đúng trang verification, không cần redirect
        if (location.pathname === verificationStatus.redirectTo) {
            return;
        }

        // Nếu đường dẫn hiện tại khác với đường dẫn trước đó và cần redirect
        if (location.pathname !== prevPathRef.current && verificationStatus.redirectTo) {
            prevPathRef.current = verificationStatus.redirectTo;
            navigate(verificationStatus.redirectTo, { replace: true });
        }
    }, [isAuthenticated, verificationStatus]);

    // Cập nhật prevPathRef khi location thay đổi
    useEffect(() => {
        prevPathRef.current = location.pathname;
    }, [location.pathname]);

    return null;
};

export default VerificationHandler; 