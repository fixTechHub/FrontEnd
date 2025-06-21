import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuthThunk } from './features/auth/authSlice'
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import AuthVerification from './features/auth/AuthVerification';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllPublicCategories());
        dispatch(fetchAllPublicServices());
        dispatch(checkAuthThunk());
    }, [dispatch]);

    return (
        <AppProvider>
            <AppRoutes />
            <AuthVerification />
        </AppProvider>
    );
}

export default App
