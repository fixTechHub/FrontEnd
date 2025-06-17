import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { checkAuthThunk } from '../features/auth/authSlice';

import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/authentication/LogInPage';
import RegisterPage from '../pages/authentication/RegisterPage';
import ForgotPasswordPage from '../pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from '../pages/authentication/ResetPasswordPage';
import ChooseRole from '../pages/authentication/ChooseRole';
import VerifyEmailPage from '../pages/authentication/VerifyEmailPage';
import VerifyOTPPage from '../pages/authentication/VerifyOTPPage';
import ViewTechnicianProfile from '../pages/technician/TechnicianProfile';
import ProfilePage from '../pages/authentication/ProfilePage';

const ProtectedRoute = ({ children, isAllowed, redirectPath = '/login' }) => {
    if (!isAllowed) {
        return <Navigate to={redirectPath} replace />;
    }
    return children;
};

export default function AppRoutes() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, loading } = useSelector((state) => state.auth);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            await dispatch(checkAuthThunk());
            setIsAuthChecked(true);
        };
        checkAuth();
    }, [dispatch]);

    if (loading || !isAuthChecked) {
        return (
            <div className="loading-wrapper">
                <div className="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route 
                path="/login" 
                element={user ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route 
                path="/register" 
                element={user ? <Navigate to="/" replace /> : <RegisterPage />}
            />
            <Route 
                path="/forgot-password" 
                element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
            />
            <Route 
                path="/reset-password" 
                element={user ? <Navigate to="/" replace /> : <ResetPasswordPage />}
            />
            
            {/* Protected routes */}
            <Route
                path="/choose-role"
                element={
                    <ProtectedRoute 
                        isAllowed={!!user && user?.role?.name === 'PENDING'}
                        redirectPath={user ? '/' : '/login'}
                    >
                        <ChooseRole />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/verify-email"
                element={
                    <ProtectedRoute 
                        isAllowed={!!user && user.email && !user.emailVerified}
                        redirectPath={user ? (user.emailVerified ? '/' : '/choose-role') : '/login'}
                    >
                        <VerifyEmailPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/verify-otp"
                element={
                    <ProtectedRoute 
                        isAllowed={!!user && !user.phoneVerified && user.phone}
                        redirectPath={user ? '/' : '/login'}
                    >
                        <VerifyOTPPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/technician/profile/:id"
                element={
                    <ProtectedRoute isAllowed={!!user}>
                        <ViewTechnicianProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute isAllowed={!!user}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}