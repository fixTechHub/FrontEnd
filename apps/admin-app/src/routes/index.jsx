import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ViewEarningAndCommission from "../../../admin-app/src/pages/technician-dashboard/ViewEarningAndCommission";
import TechnicianJobList from "../../../admin-app/src/pages/technician-dashboard/TechnicianJob";
import TechnicianJob from "../../../admin-app/src/pages/technician-dashboard/TechnicianJobDetails";
import ViewTechnicianProfile from "../../../admin-app/src/pages/technician-dashboard/TechnicianProfile";
import TechnicianDashboard from '../../../admin-app/src/pages/technician-dashboard/TechnicianDashboard';

export default function AppRoutes() {
 const {registrationData, loading } = useSelector((state) => state.auth);

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
    <Route path="/technician/:technicianId" element={<TechnicianDashboard />} />
    <Route path="/technician/profile/:technicianId" element={<ViewTechnicianProfile />} />
    <Route path="/technician/:technicianId/earning" element={<ViewEarningAndCommission />} />
    <Route path="/technician/:technicianId/booking/:bookingId" element={<TechnicianJob />} />
    <Route path="/technician/:technicianId/booking" element={<TechnicianJobList />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
}
