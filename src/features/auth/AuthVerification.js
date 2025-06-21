import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutThunk } from './authSlice';

const AuthVerification = () => {
    const { user, isAuthenticated, verificationStatus } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Ref to track the last known location to detect manual navigation
    const lastPathRef = useRef(location.pathname);

    useEffect(() => {
        // If not authenticated or no user data, do nothing.
        if (!isAuthenticated || !user) {
            return;
        }

        // Use verificationStatus from Redux store instead of calculating it here
        const nextStep = verificationStatus?.step || 'COMPLETED';
        const redirectTo = verificationStatus?.redirectTo;

        console.log('=== DEBUG AuthVerification ===');
        console.log('Redux verificationStatus:', verificationStatus);
        console.log('Calculated nextStep:', nextStep);
        console.log('Current location:', location.pathname);

        const authPages = ['/choose-role', '/verify-email', '/verify-otp', '/technician/complete-profile'];
        const wasOnAuthPage = authPages.some(page => lastPathRef.current.includes(page));
        const isOnHomePage = location.pathname === '/';
        
        // Chỉ logout nếu user thực sự rời khỏi luồng xác thực một cách có chủ ý
        // Không logout khi vừa được chuyển hướng hợp lệ
        if (wasOnAuthPage && isOnHomePage && nextStep !== 'COMPLETED' && 
            // Thêm điều kiện: chỉ logout nếu đã ở home page một thời gian (không phải vừa redirect)
            lastPathRef.current !== '/verify-email' && 
            lastPathRef.current !== '/verify-otp' && 
            lastPathRef.current !== '/choose-role') {
            console.log('User manually left auth page during verification, logging out...');
            dispatch(logoutThunk());
            return;
        }

        // Update the last path reference for the next render.
        lastPathRef.current = location.pathname;

        // Redirect if the user is not on the correct page for their verification step.
        if (redirectTo && location.pathname !== redirectTo) {
            console.log(`Redirecting to ${redirectTo} because current step is ${nextStep}`);
            navigate(redirectTo);
        } 
        // If all steps are completed and the user is still on an auth page, redirect to home.
        else if (nextStep === 'COMPLETED' && authPages.includes(location.pathname)) {
            console.log('All verification steps completed, redirecting to home.');
            navigate('/', { replace: true });
        }

    }, [user, isAuthenticated, verificationStatus, navigate, dispatch, location.pathname]);

    return null; // This component does not render anything.
};

export default AuthVerification; 