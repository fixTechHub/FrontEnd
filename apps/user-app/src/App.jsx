import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import { initializeSocket, disconnectSocket } from './services/socket';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import AuthVerification from './features/auth/AuthVerification';
import React, { useState } from 'react';
import { checkAuthThunk } from './features/auth/authSlice';
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
        // Logic checkAuth đã được chuyển sang main.jsx
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            console.log('--- Initializing socket for user:', user._id);
            initializeSocket(user._id);
        } else {
            console.log('--- Disconnecting socket on logout ---');
            disconnectSocket();
        }
    }, [user, dispatch]);

    return (
        <AppProvider>
            {!isAuthChecked ? (
                <div className="loading-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="ms-3">Đang tải...</p>
                </div>
            ) : (
                <>
                    <AppRoutes />
                    <AuthVerification />
                </>
            )}
        </AppProvider>
    );
}

export default App
