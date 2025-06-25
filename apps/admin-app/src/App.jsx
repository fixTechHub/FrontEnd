import { Routes, Route, Link } from 'react-router-dom';
import { FaCalendarAlt, FaTicketAlt, FaClipboardList, FaChartBar, FaUsers, FaTools } from 'react-icons/fa';
import AdminLayout from './components/layout/AdminLayout';
import ReportManagement from '../src/pages/management/ReportManagement';
import SystemReportManagement from '../src/pages/management/SystemReportManagement';
import UserManagement from '../src/pages/management/UserManagement';
import TechnicianManagement from '../src/pages/management/TechnicianManagement';
import CouponManagement from '../src/pages/management/CouponManagement';
import CouponUsageManagement from '../src/pages/management/CouponUsageManagement';
import BookingManagement from '../src/pages/management/BookingManagement';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<ReportManagement />} />
        <Route path="report-management" element={<ReportManagement />} />
        <Route path="system-report-management" element={<SystemReportManagement />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="technician-management" element={<TechnicianManagement />} />
        <Route path="coupon-management" element={<CouponManagement />} />
        <Route path="coupon-usage-management" element={<CouponUsageManagement />} />
        <Route path="booking-management" element={<BookingManagement />} />
      </Route>
    </Routes>
  );
};

export default App;
  