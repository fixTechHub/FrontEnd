import React from 'react';
import { FaBell, FaUserCircle, FaPlus, FaDownload, FaPrint } from 'react-icons/fa';
import Notifications from '../common/Notifications';

const AdminHeader = () => (
  <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#fff', borderBottom: '1px solid #eee' }}>
    
    <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button className="btn" style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: 8 }}><FaPrint /></button>
      <button className="btn" style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: 8 }}><FaDownload /> Export</button>
      <Notifications 
      // style={{ fontSize: 22, color: '#FFA726', marginLeft: 8, cursor: 'pointer' }}
       />
      <FaUserCircle className="icon" style={{ fontSize: 28, color: '#888', marginLeft: 8, cursor: 'pointer' }} />
    </div>
  </header>
);

export default AdminHeader; 