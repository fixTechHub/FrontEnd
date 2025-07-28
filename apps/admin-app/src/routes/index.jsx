import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CommissionConfigManager from '../pages/admin/commissionConfigManager';

export default function AppRoutes() {


  return (
  <Routes>
    {/* <Route path="/technician/:technicianId" element={<TechnicianDashboard />} />
    <Route path="/technician/profile/:technicianId" element={<ViewTechnicianProfile />} />
    
    <Route path="/technician/:technicianId/booking/:bookingId" element={<TechnicianJob />} />
    <Route path="/technician/:technicianId/booking" element={<TechnicianJobList />} /> */}
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route path="/admin/commission" element={<CommissionConfigManager />} />
  </Routes>
);
}
