import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import { initializeSocket, disconnectSocket } from './services/socket';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import AuthVerification from './features/auth/AuthVerification';
import VideoCallProvider from './components/video-call/VideoCallProvider';

function App() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

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
    }, [user?._id]);

    return (
        <AppProvider>
            <VideoCallProvider>
                <AppRoutes />
                <AuthVerification />
            </VideoCallProvider>
        </AppProvider>
    );
}

export default App
