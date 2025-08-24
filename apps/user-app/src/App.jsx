import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllPublicCategories, fetchTopPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import { initializeSocket, disconnectSocket } from './services/socket';
import { checkAuthThunk } from './features/auth/authSlice';
import { fetchAllRoles } from './features/roles/roleSlice';
import { fetchTopBookedServices } from './features/bookings/bookingSlice';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import SystemReportButton from './components/common/SystemReportButton';

function App() {
    const dispatch = useDispatch();
    const { user, registrationData, loading } = useSelector((state) => state.auth);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        dispatch(checkAuthThunk()).finally(() => {
            setIsAuthChecked(true);
        });
    }, [dispatch]);


    useEffect(() => {
        dispatch(fetchAllPublicCategories());
        dispatch(fetchAllPublicServices());
        dispatch(fetchTopBookedServices());
        dispatch(fetchTopPublicCategories());
        dispatch(fetchAllRoles());
        // Logic checkAuth đã được chuyển sang main.jsx
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            // console.log('--- Initializing socket for user:', user._id);
            initializeSocket(user._id);
        } else {
            // console.log('--- Disconnecting socket on logout ---');
            disconnectSocket();
        }
    }, [user, dispatch]);

    return (
        <AppProvider>
            {!isAuthChecked ? (
                <div className="loading-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="ms-3">Đang tải...</p>
                </div>
            ) : (
                <>
                    <AppRoutes />
                    <SystemReportButton />
                </>
            )}
        </AppProvider>
    );
}

export default App
