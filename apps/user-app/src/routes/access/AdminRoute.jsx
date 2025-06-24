import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role?.name !== 'ADMIN') {
        // Redirect non-admin users to home page or a 'not-authorized' page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
