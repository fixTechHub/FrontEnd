import React from 'react';
import { FaUser, FaCalendarAlt, FaTicketAlt, FaClipboardList, FaUsers, FaChartBar, FaTools } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <aside className="sidebar" style={{ width: 240, background: '#fff', borderRight: '1px solid #eee', padding: 16 }}>
    <div className="sidebar-logo" style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 24, color: '#FFA726' }}>DREAMS RENT</div>
    <nav>
      <div style={{ fontWeight: 'bold', margin: '16px 0 8px', color: '#888' }}>MANAGEMENT</div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/admin/booking-management"><FaCalendarAlt style={{ marginRight: 8 }} />Booking Management</Link></li>
        <li><Link to="/admin/coupon-management"><FaTicketAlt style={{ marginRight: 8 }} />Coupon Management</Link></li>
        <li><Link to="/admin/coupon-usage-management"><FaTicketAlt style={{ marginRight: 8 }} />Coupon Usage Management</Link></li>
        <li><Link to="/admin/report-management"><FaClipboardList style={{ marginRight: 8 }} />Report Management</Link></li>
        <li><Link to="/admin/system-report-management"><FaChartBar style={{ marginRight: 8 }} />System Report Management</Link></li>
        <li><Link to="/admin/user-management"><FaUsers style={{ marginRight: 8 }} />User Management</Link></li>
        <li><Link to="/admin/technician-management"><FaTools style={{ marginRight: 8 }} />Technician Management</Link></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar; 