import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthThunk } from './features/auth/authSlice'
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import { initializeSocket, disconnectSocket } from './services/socket';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchAllPublicCategories());
        dispatch(fetchAllPublicServices());
        dispatch(checkAuthThunk());
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
            <AppRoutes />
        </AppProvider>
    );
}

export default App
