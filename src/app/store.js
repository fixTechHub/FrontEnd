import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
// import bookingReducer from '../features/bookings/bookingSlice';

const store = configureStore({
  reducer: {
    // auth: authReducer,
    // bookings: bookingReducer,
    
  },
});

export default store;
