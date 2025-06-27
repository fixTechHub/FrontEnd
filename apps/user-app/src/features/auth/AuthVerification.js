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

        // Loại bỏ tự động điều hướng để tránh làm kẹt người dùng.
        // Component này hiện chỉ giữ chỗ để có thể hiển thị thông báo nếu cần.
    }, [isAuthenticated, user, verificationStatus, location.pathname, navigate]);

    return null; // This component does not render anything.
};

export default AuthVerification; 