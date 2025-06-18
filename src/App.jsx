import { useDispatch } from 'react-redux';
import AppRoutes from './routes/index'; // Cấu hình router
import AppProvider from './app/AppProvider';
import { fetchAllPublicCategories } from './features/categories/categorySlice';
import { fetchAllPublicServices } from './features/services/serviceSlice';
import { useEffect } from 'react';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllPublicCategories());
        dispatch(fetchAllPublicServices());
    }, [dispatch]);

    return (
        <AppProvider>
            <AppRoutes />
        </AppProvider>
    );
}

export default App;
