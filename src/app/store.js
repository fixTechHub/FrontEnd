import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import bookingReducer from '../features/bookings/bookingSlice';
import technicianReducer from '../features/technicians/technicianSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // bookings: bookingReducer,
    technician: technicianReducer,
  },
});

export default store;
