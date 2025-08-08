import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./access/AdminRoute";
import AdminLayout from "../components/layout/AdminLayout";
import ReportManagement from "../pages/management/ReportManagement";
import SystemReportManagement from "../pages/management/SystemReportManagement";
import UserManagement from "../pages/management/UserManagement";
import TechnicianManagement from "../pages/management/TechnicianManagement";
import CouponManagement from "../pages/management/CouponManagement";
import CouponUsageManagement from "../pages/management/CouponUsageManagement";
import CategoryManagement from "../pages/management/CategoryManagement";
import BookingManagement from "../pages/management/BookingManagement";
import WarrantyManagement from "../pages/management/WarrantyManagement";
import AdminDashboard from "../pages/home/admin-dashboard";
import ServiceManagement from "../pages/management/ServiceManagement";
import CommissionConfigManagement from '../pages/management/CommissionConfigManagement';
import CommissionConfigManager from '../pages/admin/commissionConfigManager';
import FinancialManagement from '../pages/management/FinancialManagement';
import AdminPackagePage from "../pages/management/PackageManagement";
import FeedbackAdmin from "../pages/management/FeedbackManagement";

//Định nghĩa các route, xác định trang nào sẽ render vào <Outlet /> của AdminLayout, quyết định trang nào là management page.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route path="booking-management" element={<BookingManagement />} />
        <Route path="coupon-management" element={<CouponManagement />} />
        <Route path="coupon-usage-management" element={<CouponUsageManagement />} />
        <Route path="report-management" element={<ReportManagement />} />
        <Route path="system-report-management" element={<SystemReportManagement />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="technician-management" element={<TechnicianManagement />} />
        <Route path="category-management" element={<CategoryManagement/>} />
        <Route path="warranty-management" element={<WarrantyManagement />} />
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="service-management" element={<ServiceManagement/>}/>
        <Route path="commission-config-management" element={<CommissionConfigManagement />} />
        <Route path="financial-management" element={<FinancialManagement />} />
        <Route path="package" element={<AdminPackagePage />} />
        <Route path="feedback" element={<FeedbackAdmin />} />
        <Route index element={<AdminDashboard />} /> {/* Trang mặc định */}
      </Route>
      <Route path="/admin/commission" element={
        <AdminRoute>
          <CommissionConfigManager />
        </AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/admin/admin-dashboard" replace />} />
    </Routes>
  );
}
