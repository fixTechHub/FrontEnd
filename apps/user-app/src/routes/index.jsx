import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthThunk } from "../features/auth/authSlice";
import React, { useEffect, useState } from 'react';
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
import ContractComplete from '../pages/contracts/ContractComplete';
import CheckoutPage from '../pages/booking/CheckoutPage';
import PaymentSuccess from "../pages/transaction/PaymentSuccess";
import PaymentCancel from "../pages/transaction/PaymentCancel";
import PaymentFail from "../pages/transaction/PaymentFail";
import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import ViewEarningAndCommission from "../pages/technician/ViewEarningAndCommission";
import TechnicianJobList from "../pages/technician/TechnicianJob";
import TechnicianJob from "../pages/technician/TechnicianJobDetail";
import CertificateList from "../pages/technician/Certificate";
import SendQuotation from "../pages/technician/SendQuotation";
import WaitingConfirm from "../pages/technician/WaitingConfirm";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import ListFeedback from "../pages/technician/ListFeedback";
import VideoCallPage from "../pages/video-call/VideoCallPage";
import NotificationsPage from "../pages/notifications/NotificationPage";
import ReceiptPage from "../pages/receipt/ReceiptPage";
import TechnicianDeposit from "../pages/transaction/TechnicianDeposit";
import BookingWarranty from "../pages/booking-warranty/BookingWarranty";
import BookingHistory from "../pages/booking/common/BookingHistory";
// import { checkAuthThunk } from '../features/auth/authSlice';
// import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import UploadCertificateForm from "../pages/technician/UploadCer";
import SubmitFeedback from "../pages/feedback/SubmitFeedback";
import ServiceList from "../pages/home/ServiceList";

export default function AppRoutes() {
  const { user, registrationData, loading, verificationStatus } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/technician/profile/:id" element={<ViewTechnicianProfile />} />
      <Route path="/services" element={<ServiceList />} />


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
      <Route path="/technician" element={<TechnicianDashboard />} />
      <Route path="/technician/earning" element={<ViewEarningAndCommission />} />
      <Route path="/technician/booking" element={< TechnicianJobList/>} />
      <Route path="/technician/booking/:bookingId" element={< TechnicianJob/>} />
      <Route path="/technician/:technicianId/certificate" element={< CertificateList/>} />
      <Route path="/technician/feedback" element={< ListFeedback/>} />
      <Route path="/technician/upload-certificate" element={<UploadCertificateForm />} />
      <Route path="/feedback/submit/:bookingId" element={<SubmitFeedback />} />

      {/* <Route path="/technician/deposit" element={
        < TechnicianDeposit/>
        } /> */}

      
      {/* <Route
      <Route
        path="/technician/complete-profile"
        element={
          <PrivateRoute requiredRole="TECHNICIAN" redirectPath={user ? "/" : "/login"}>
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
        <PrivateRoute isAllowed={!!user && user.role?.name === "TECHNICIAN"}
          redirectPath={user ? "/" : "/login"}
        >
          <ContractComplete />
        </PrivateRoute>

      } />
      <Route path="/technician/deposit" element={
        // <PrivateRoute isAllowed={!!user && user.role?.name === "TECHNICIAN"}
        //   redirectPath={user ? "/" : "/login"}
        // >
          <TechnicianDeposit />
        // </PrivateRoute>

      } />
      <Route path="/checkout" element={<PrivateRoute isAllowed={!!user && user.role?.name === "CUSTOMER"}
        redirectPath={user ? "/" : "/login"}
      >
        <CheckoutPage />
      </PrivateRoute>} />
      <Route path="/receipts" element={
        <PrivateRoute isAllowed={!!user && user.role?.name === "CUSTOMER"}
          redirectPath={user ? "/" : "/login"}
        >
          <ReceiptPage />
        </PrivateRoute>
      } />

      <Route path="/payment-success" element={
        <PrivateRoute isAllowed={!!user && user.role?.name === "CUSTOMER"}
          redirectPath={user ? "/" : "/login"}
        >
          <PaymentSuccess />
        </PrivateRoute>
      } />

      <Route path="/payment-failed" element={
        <PrivateRoute isAllowed={!!user && user.role?.name === "CUSTOMER"}
          redirectPath={user ? "/" : "/login"}
        >
          <PaymentFail />
        </PrivateRoute>
      } />

      <Route path="/payment-cancel" element={
        <PrivateRoute isAllowed={!!user && user.role?.name === "CUSTOMER"}
          redirectPath={user ? "/" : "/login"}
        >
          <PaymentCancel />
        </PrivateRoute>
      } />

      <Route
        path="/notifications/all"
        element={
          <PrivateRoute isAllowed={!!user}>
            <NotificationsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <PrivateRoute requiredRole="CUSTOMER">
            <BookingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking/choose-technician"
        element={
          <PrivateRoute requiredRole="CUSTOMER">
            <ChooseTechnician />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking/booking-processing"
        element={
          <PrivateRoute>
            <BookingProcessing />
          </PrivateRoute>
        }
      />
      <Route
        path="/video-call/:bookingId"
        element={
          // <PrivateRoute isAllowed={!!user}>
            <VideoCallPage />
          //  </PrivateRoute>
        }
      />
      <Route
        path="/warranty"
        element={
          // <PrivateRoute isAllowed={!!user}>
            <BookingWarranty />
        // </PrivateRoute>
        }
      />
      <Route
        path="/booking/history"
        element={
          // <PrivateRoute isAllowed={!!user}>
            <BookingHistory />
          // </PrivateRoute>
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

      {/* ================= TECHNICIAN PROTECTED ROUTES ================= */}
      <Route
        path="/technician/dashboard"
        element={
          <PrivateRoute isAllowed={!!user && user?.role?.name === "TECHNICIAN"}>
          <TechnicianDashboard />
          </PrivateRoute>
         
        }
      />

      <Route
        path="/technician/send-quotation"
        element={
          <PrivateRoute isAllowed={!!user && user?.role?.name === "TECHNICIAN"}>
            <SendQuotation />
          </PrivateRoute>
        }
      />

      <Route
        path="/technician/waiting-confirm"
        element={
          // <PrivateRoute isAllowed={!!user && user?.role?.name === "TECHNICIAN"}>
          <WaitingConfirm />
          // </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            isAllowed={!!user && user.role?.name === 'CUSTOMER'}
          >
            <CustomerDashboard />
          </PrivateRoute>
        }
      />

      {/* ================= FALLBACK ROUTE ================= */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

    </Routes>
  );
}
