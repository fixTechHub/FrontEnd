import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
// import bookingReducer from '../features/bookings/bookingSlice';
import couponReducer from '../features/coupons/couponSlice';
import couponUsageReducer from '../features/couponusages/couponUsageSlice';
const store = configureStore({
  reducer: {
    // auth: authReducer,
    // bookings: bookingReducer,
    coupon: couponReducer,
    couponUsage: couponUsageReducer,
  },
});

export default store;
