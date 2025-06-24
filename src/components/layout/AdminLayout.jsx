import React from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => (
  <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <AdminHeader />
      <div className="admin-content" style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
        <Outlet />
      </div>
    </div>
  </div>
);

export default AdminLayout;
