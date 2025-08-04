import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { message } from "antd";

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    // Tạm thời bỏ qua route protection để test
    return children;

    // Hiển thị loading nếu đang kiểm tra auth
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
        message.error('Vui lòng đăng nhập để truy cập trang admin');
        return <Navigate to="/admin" replace />;
    }

    // Kiểm tra role admin
    if (!user || user.role?.name !== 'ADMIN') {
        message.error('Bạn không có quyền truy cập trang admin');
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default AdminRoute;
