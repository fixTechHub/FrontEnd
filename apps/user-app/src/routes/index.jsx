import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { checkAuthThunk } from "../features/auth/authSlice";
import ProtectedRoute from "./access/PrivateRoute";
import PrivateRoute from "./access/PrivateRoute";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/authentication/LogInPage";
import RegisterPage from "../pages/authentication/RegisterPage";
import ForgotPasswordPage from "../pages/authentication/ForgotPasswordPage";
import ResetPasswordPage from "../pages/authentication/ResetPasswordPage";
import ChooseRole from "../pages/authentication/ChooseRole";
import VerifyEmailPage from "../pages/authentication/VerifyEmailPage";
import VerifyOTPPage from "../pages/authentication/VerifyOTPPage";
import ViewTechnicianProfile from "../pages/technician/TechnicianProfile";
import CompleteProfile from "../pages/technician/CompleteProfile";
import ProfilePage from "../pages/authentication/ProfilePage";
import BookingPage from "../pages/booking/BookingPage";
import ChooseTechnician from '../pages/booking/ChooseTechnician';
import BookingProcessing from "../../../user-app/src/pages/booking/BookingProcessing";
import RegisterTechnician from "../../../admin-app/src/pages/technician-dashboard/RegisterTechnician";
import ContractComplete from '../pages/contracts/ContractComplete';
import CheckoutPage from '../pages/booking/CheckoutPage';
import PaymentSuccess from "../pages/transaction/PaymentSuccess";
import PaymentCancel from "../pages/transaction/PaymentCancel";
import PaymentFail from "../pages/transaction/PaymentFail";

export default function AppRoutes() {
 const { user, registrationData, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="loading-wrapper" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/technician/profile/:id" element={<ViewTechnicianProfile />} />


      {/* ================= VERIFICATION ROUTES ================= */}
      <Route
        path="/choose-role"
        element={
          <PrivateRoute
            isAllowed={
              // Allow access if user exists and needs to choose role
              (!!user && (!user.role || user.role.name === "PENDING")) ||
              // OR if user is in registration process (has registration data)
              (!!registrationData && registrationData.fullName && registrationData.emailOrPhone && registrationData.password)
            }
            redirectPath={user ? "/" : "/login"}
          >
            <ChooseRole />
          </PrivateRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PrivateRoute
            isAllowed={!!user && user.email && !user.emailVerified}
            redirectPath={user ? "/" : "/login"}
          >
            <VerifyEmailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PrivateRoute
            isAllowed={!!user && !user.phoneVerified && user.phone}
            redirectPath={user ? "/" : "/login"}
          >
            <VerifyOTPPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/technician/complete-profile"
        element={
          <PrivateRoute
            isAllowed={!!user && user.role?.name === "TECHNICIAN"}
            redirectPath={user ? "/" : "/login"}
          >
            <CompleteProfile />
          </PrivateRoute>
        }
      />

      {/* ================= USER PROTECTED ROUTES ================= */}
      <Route
        path="/profile"
        element={
          <PrivateRoute isAllowed={!!user}>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route path="/contract/complete" element={
        <PrivateRoute isAllowed={!!user}>
          <ContractComplete />
        </PrivateRoute>

      } />
      <Route path="/checkout/:bookingId/:technicianId" element={<PrivateRoute isAllowed={!!user}>
        <CheckoutPage />
      </PrivateRoute>} />
      <Route path="/payment-success" element={
        <PrivateRoute isAllowed={!!user}>
          <PaymentSuccess />
        </PrivateRoute>} />
      <Route path="/payment-failed" element={
        <PrivateRoute isAllowed={!!user}>
          <PaymentFail />
        </PrivateRoute>
      } />
      <Route path="/payment-cancel" element={
        <PrivateRoute isAllowed={!!user}>
          <PaymentCancel />
        </PrivateRoute>
      } />
      <Route
        path="/booking"
        element={
          <PrivateRoute isAllowed={!!user}>
            <BookingPage />
          </PrivateRoute>
        }
      />
       <Route
        path="/booking/choose-technician"
        element={
          <PrivateRoute isAllowed={!!user}>
            <ChooseTechnician />
          </PrivateRoute>
        }
      />
       <Route
        path="/booking/booking-processing"
        element={
          <PrivateRoute isAllowed={!!user}>
            <BookingProcessing />
          </PrivateRoute>
        }
      />
      {/* Thêm các route cần user đăng nhập ở đây, ví dụ: */}
      {/* 
          <Route
              path="/my-bookings"
              element={
                  <PrivateRoute isAllowed={!!user}>
                      <MyBookingsPage />
                  </PrivateRoute>
              }
          /> 
          */}

      {/* ================= ADMIN PROTECTED ROUTES ================= */}
      {/* 
          <Route
              path="/admin/*"
              element={
                  <AdminRoute isAllowed={!!user && user.role.name === 'ADMIN'}>
                      <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<ManageUsersPage />} />
                      </Routes>
                  </AdminRoute>
              }
          /> 
          */}

      {/* ================= FALLBACK ROUTE ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
