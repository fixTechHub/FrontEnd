import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
// import ViewEarningAndCommission from "../pages/technician-dashboard/ViewEarningAndCommission";
// import TechnicianJobList from "../pages/technician-dashboard/TechnicianJob";
// import ViewTechnicianProfile from "../pages/technician-dashboard/TechnicianProfile";
import WarrantyManagement from "../pages/management/WarrantyManagement";
import AdminDashboard from "../pages/home/admin-dashboard";
import ServiceManagement from "../pages/management/ServiceManagement";
import CommissionConfigManagement from '../pages/management/CommissionConfigManagement';

//Định nghĩa các route, xác định trang nào sẽ render vào <Outlet /> của AdminLayout, quyết định trang nào là management page.
export default function AppRoutes() {
  const dispatch = useDispatch();
  const { user, registrationData, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div>...</div>
    );
  }
  return (
    <Routes>
      {/* Technician routes */}
      {/* <Route path="/technician/profile/:technicianId" element={<ViewTechnicianProfile />} />
      <Route path="/technician/:technicianId/earning" element={<ViewEarningAndCommission />} />
      <Route path="/technician/:technicianId/booking/:bookingId" element={<TechnicianJobList />} />
      <Route path="/technician/:technicianId/booking" element={<TechnicianJobList />} /> */}
      <Route path="/admin" element={<AdminLayout />}>
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
        <Route index element={<AdminDashboard />} /> {/* Trang mặc định */}
      </Route>
      <Route path="*" element={<Navigate to="/admin/admin-dashboard" replace />} />
    </Routes>
  );
}