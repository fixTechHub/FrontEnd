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

        // Không tự động redirect, chỉ cập nhật flag để UI khác có thể sử dụng.
    }, [isAuthenticated, verificationStatus]);

    // Cập nhật prevPathRef khi location thay đổi
    useEffect(() => {
        prevPathRef.current = location.pathname;
    }, [location.pathname]);

    return null;
};

export default VerificationHandler; 