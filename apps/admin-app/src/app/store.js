import { configureStore } from '@reduxjs/toolkit';
import technicianReducer from '../features/technician/technicianSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import couponReducer from '../features/coupons/couponSlice';
import couponUsageReducer from '../features/couponusages/couponUsageSlice';
import userReducer from '../features/users/userSlice';
import reportReducer from '../features/reports/reportSlice';
import techniciansReducer from '../features/technicians/technicianSlice';
import systemReportReducer from '../features/systemReports/systemReportSlice';
import authReducer from '../features/auth/authSlice';
import categoryReducer from '../features/categories/categorySlice';
import warrantyReducer from '../features/warranty/warrantySlice';
import technicianReducer from '../features/technician/technicianSlice';
import transactionReducer from '../features/technician/technicianSlice';
import transactionReducer from '../features/transactions/transactionSlice';

export const store = configureStore({
  reducer: {
    technician: technicianReducer,
    bookings: bookingReducer,
    coupon: couponReducer,
    couponUsage: couponUsageReducer,
    users: userReducer,
    reports: reportReducer,
    technicians: techniciansReducer,
    systemReports: systemReportReducer,
    auth: authReducer,
    categories: categoryReducer,
    warranty: warrantyReducer,
    reducer: {
      technician: technicianReducer,
      transaction: transactionReducer
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
          serializableCheck: false,
      }),
  },
});

