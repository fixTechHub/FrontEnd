import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ViewEarningAndCommission from "../../../admin-app/src/pages/technician-dashboard/ViewEarningAndCommission";
import TechnicianJobList from "../../../admin-app/src/pages/technician-dashboard/TechnicianJob";
import ViewTechnicianProfile from "../../../admin-app/src/pages/technician-dashboard/TechnicianProfile";
import ViewTechnicianProfile from "../pages/technician/TechnicianProfile";


export default function AppRoutes() {
  const dispatch = useDispatch();
 const {user, registrationData, loading } = useSelector((state) => state.auth);

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
  <Route path="/technician/profile/:technicianId" element={<ViewTechnicianProfile />} />
  <Route path="/technician/:technicianId/earning" element={<ViewEarningAndCommission />} />
  <Route path="/technician/:technicianId/booking/:bookingId" element={<TechnicianJobList />} />
  <Route path="/technician/:technicianId/booking" element={<TechnicianJobList />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
 /* ================= ADMIN PROTECTED ROUTES ================= */
      /* 
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
      */
      
);
}