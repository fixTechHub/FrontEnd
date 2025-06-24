import { FaUser, FaCar, FaCalendarAlt, FaClipboardList, FaUsers } from 'react-icons/fa';

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-logo">Fix Tech</div>
    <input className="sidebar-search" placeholder="Search" />
    <nav>
      <ul>
        <li><a href="/admin/dashboard"><FaClipboardList /> Dashboard</a></li>
        <li><a href="/admin/booking-management"><FaCalendarAlt /> Bookings</a></li>
        <li><a href="/admin/user-management"><FaUsers /> Customers</a></li>
        {/* ... các menu khác ... */}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
