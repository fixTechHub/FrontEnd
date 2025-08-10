import React from 'react';
import Sidebar from '../common/Sidebar';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';




const AdminLayout = () => (
 <div className="container-fluid p-0 m-0">
 <div className="row g-0 min-vh-100">
   {/* Sidebar bên trái */}
   <div className="col-2">
     <Sidebar />
   </div>
   {/* Khu vực nội dung chính */}
   <div className="col-10 d-flex flex-column">
     {/* Header */}
     <AdminHeader />


     {/* Nội dung chính */}
     <div className="admin-content flex-grow-1 p-3 bg-light">
       <Outlet />
     </div>


     {/* Footer */}
     <Footer />
   </div>
 </div>
</div>




);


export default AdminLayout;

