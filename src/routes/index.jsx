import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuthThunk } from "../features/auth/authSlice";
import ProtectedRoute from "./access/PrivateRoute";
import TechnicianDashboard from '../pages/technician/TechnicianDashboard';
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/authentication/LogInPage";
import RegisterPage from "../pages/authentication/RegisterPage";
import ForgotPasswordPage from "../pages/authentication/ForgotPasswordPage";
import ResetPasswordPage from "../pages/authentication/ResetPasswordPage";
import ChooseRole from "../pages/authentication/ChooseRole";
import VerifyEmailPage from "../pages/authentication/VerifyEmailPage";
import VerifyOTPPage from "../pages/authentication/VerifyOTPPage";
import ViewTechnicianProfile from "../pages/technician/TechnicianProfile";
import ProfilePage from "../pages/authentication/ProfilePage";
import BookingPage from "../pages/booking/BookingPage";
import ViewEarningAndCommission from "../pages/technician/ViewEarningAndCommission";
import ChooseTechnician from '../pages/booking/ChooseTechnician';
import BookingProcessing from "../pages/booking/BookingProcessing";
import RegisterTechnician from "../pages/technician/RegisterTechnician";
import TechnicianJobList from "../pages/technician/TechnicianJob";
import TechnicianJob from "../pages/technician/TechnicianJobDetails";

export default function AppRoutes() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthThunk()).unwrap();
      } catch (error) {
        console.error("Check auth error:", error);
      } finally {
        setIsAuthChecked(true);
      }
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
      <Route
        path="/"
        element={
          <ProtectedRoute isAllowed={true}>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Verification routes */}
      <Route
        path="/choose-role"
        element={
          <ProtectedRoute
            isAllowed={!!user && (!user.role || user.role.name === "PENDING")}
            redirectPath={user ? "/" : "/login"}
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
            redirectPath={user ? "/" : "/login"}
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
            redirectPath={user ? "/" : "/login"}
          >
            <VerifyOTPPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
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

      <Route
        path="/choose-role"
        element={<ChooseRole />}
      />

      <Route
        path="/booking"
        element={<BookingPage />}
      />

      <Route
        path="/technician/profile/:technicianId"
        element={<ViewTechnicianProfile />}
      />
      <Route path="/technician/:technicianId/earning" element={<ViewEarningAndCommission />} />

      <Route path="/technician/:technicianId/booking" element={<TechnicianJobList />} />

      <Route path="/technician/:technicianId/booking/:bookingId" element={<TechnicianJob />} />
      
      <Route path="/technician/:technicianId" element={< TechnicianDashboard />} />

      <Route path="/registerTechnician" element={< RegisterTechnician />} />

      <Route
        path="/booking/choose-technician"
        element={<ChooseTechnician />}
      />

      <Route
        path="/booking/booking-processing"
        element={<BookingProcessing />}
      />

      {/* <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute allowedRoles={[Roles.ADMIN, Roles.TECHNICIAN]}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                /> */}

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
