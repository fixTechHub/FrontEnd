import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuthThunk } from "../features/auth/authSlice";
import ProtectedRoute from "./access/PrivateRoute";

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
import ContractPage from '../pages/contracts/ContractPage';
import ContractComplete from '../pages/contracts/ContractComplete';
import CheckoutPage from '../pages/booking/CheckoutPage';
import PaymentSuccess from "../pages/transaction/PaymentSuccess";
import PaymentCancel from "../pages/transaction/PaymentCancel";
import PaymentFail from "../pages/transaction/PaymentFail";
export default function AppRoutes() {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only check auth if we haven't already and there's no user.
    if (!isAuthenticated) {
      dispatch(checkAuthThunk());
    }
  }, [dispatch, isAuthenticated]);

  if (loading && !isAuthenticated) {
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

      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/booking" element={<BookingPage />} />

      <Route
        path="/technician/profile/:technicianId"
        element={<ViewTechnicianProfile />}
      />
      <Route path="/contract" element={<ContractPage />} />
      <Route path="/contract/complete" element={<ContractComplete />} />
      <Route path="/checkout/:bookingId/:technicianId" element={<CheckoutPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFail />} />
      <Route path="/payment-cancel" element={<PaymentCancel />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
