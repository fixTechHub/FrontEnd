import { Link } from 'react-router-dom';
import { FaUser, FaCar, FaCalendarAlt, FaTicketAlt, FaClipboardList, FaChartBar, FaUsers, FaTools } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="sidebar" style={{ width: 240, background: '#fff', borderRight: '1px solid #eee', padding: 16 }}>
    <div className="sidebar-logo" style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 24, color: '#FFA726' }}>Fix Tech</div>
    <nav>
        <div style={{ fontWeight: 'bold', margin: '16px 0 8px', color: '#888' }}>MANAGEMENT</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="menu-title"><span>Manage</span></li>
            <li><Link to="/admin/booking-management"><FaCalendarAlt />Booking Management</Link></li>
            <li><Link to="/admin/coupon-management"><FaTicketAlt />Coupon Management</Link></li>
            <li><Link to="/admin/coupon-usage-management"><FaTicketAlt />Coupon Usage Management</Link></li>
            <li><Link to="/admin/report-management"><FaClipboardList />Report Management</Link></li>
            <li><Link to="/admin/system-report-management"><FaChartBar/>System Report Management</Link></li>
            <li><Link to="/admin/user-management"><FaUsers/>User Management</Link></li>
            <li><Link to="/admin/technician-management"><FaTools/>Technician Management</Link></li>
        </ul>
    </nav>
  </aside>
);

export default Sidebar;