import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import HomePage from '../pages/home/HomePage';
import LogInPage from '../pages/authentication/LogInPage';
import RegisterPage from '../pages/authentication/RegisterPage';
import ChooseRole from '../pages/authentication/ChooseRole';
import CouponManagement from "../pages/Management/CouponManagement";
import CouponUsageManagement from "../pages/Management/CouponUsageManagement";
import UserManagement from '../pages/Management/UserManagement';
import AdminLayout from '../components/layout/AdminLayout';
import ReportManagement from '../pages/Management/ReportManagement';
import SystemReportManagement from '../pages/Management/SystemReportManagement';
import TechnicianManagement from '../pages/Management/TechnicianManagement';
import BookingManagement from '../pages/Management/BookingManagement';  

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
                <Route path="/admin/*" element={<AdminLayout />}>
                    <Route index element={<CouponManagement />} />
                    <Route path="coupon-management" element={<CouponManagement />} />
                    <Route path="coupon-usage-management" element={<CouponUsageManagement />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="report-management" element={<ReportManagement />} />
                    <Route path="system-report-management" element={<SystemReportManagement />} />
                    <Route path="technician-management" element={<TechnicianManagement />} />
                    <Route path="booking-management" element={<BookingManagement />} />
                </Route>
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
