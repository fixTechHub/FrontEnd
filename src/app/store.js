import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import couponReducer from '../features/coupons/couponSlice';
import couponUsageReducer from '../features/couponusages/couponUsageSlice';
import userReducer from '../features/users/userSlice';
import reportReducer from '../features/reports/reportSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import systemReportReducer from '../features/systemReports/systemReportSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    coupon: couponReducer,
    couponUsage: couponUsageReducer,
    users: userReducer,
    reports: reportReducer,
    technicians: technicianReducer,
    systemReports: systemReportReducer,
  },
});

export default store;
