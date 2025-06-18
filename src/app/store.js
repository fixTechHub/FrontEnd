import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import categoryReducer from '../features/categories/categorySlice';
import serviceReducer from '../features/services/serviceSlice';
import technicianReducer from '../features/technicians/technicianSlice';

const store = configureStore({
    reducer: {
        // auth: authReducer,
        booking: bookingReducer, 
        categories: categoryReducer,
        services: serviceReducer,
        technician: technicianReducer,
    },
});

export default store;
