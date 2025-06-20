import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuthThunk } from './features/auth/authSlice'
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import AppRoutes from './routes'
import AppProvider from './app/AppProvider';
import 'react-toastify/dist/ReactToastify.css';

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
        </AppProvider>
    );
}

export default App
