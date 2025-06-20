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
import ContractPage from '../pages/contracts/ContractPage';
import ContractComplete from '../pages/contracts/ContractComplete';
import ProfilePage  from '../pages/authentication/ProfilePage'
import CheckoutPage from '../pages/booking/CheckoutPage';
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
        <>
            <Routes>
                {/* Route mặc định chuyển hướng */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                <Route path="/" element={<HomePage />} />
                <Route path="/contract" element={<ContractPage />} />
                <Route path="/contract/complete" element={<ContractComplete />} />
                <Route path="/checkout/:bookingId/:technicianId" element={<CheckoutPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/choose-role" element={<ChooseRole />} />

                <Route path="/technician/profile/:id" element={<ViewTechnicianProfile />} />

                {/* <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute allowedRoles={[Roles.ADMIN, Roles.TECHNICIAN]}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                /> */}

            </Routes>
        </>
    );
}