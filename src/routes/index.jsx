import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/home/HomePage';
import LogInPage from '../pages/authentication/LogInPage';
import RegisterPage from '../pages/authentication/RegisterPage';
import ChooseRole from '../pages/authentication/ChooseRole';
import CouponManagement from '../pages/CouponManagement';
import CouponUsageManagement from '../pages/CouponUsageManagement';
export default function AppRoutes() {
    return (
        <>
            <Routes>
                {/* Route mặc định chuyển hướng */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                
                <Route path="/" element={<HomePage />} />

                <Route path="/login" element={<LogInPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/choose-role" element={<ChooseRole />} />
                <Route path="/coupons" element={<CouponManagement />} />
                <Route path="/couponusages" element={<CouponUsageManagement />} />
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
