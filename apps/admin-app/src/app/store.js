import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from '../features/transactions/transactionSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import couponReducer from '../features/coupons/couponSlice';
import couponUsageReducer from '../features/couponusages/couponUsageSlice';
import userReducer from '../features/users/userSlice';
import reportReducer from '../features/reports/reportSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import systemReportReducer from '../features/systemReports/systemReportSlice';
import categoryReducer from '../features/categories/categorySlice';
import warrantyReducer from '../features/warranty/warrantySlice';
import serviceReducer from '../features/service/serviceSlice';
import statisticReducer from '../features/statistics/statisticSlice';
import commissionConfigReducer from '../features/commissionConfig/commissionSlice';
import commissionReducer from '../features/commission/commissionSlice';
import financialReportReducer from '../features/financialReport/financialReportSlice';

 const store = configureStore({
  reducer: {
    bookings: bookingReducer,
    coupon: couponReducer,
    couponUsage: couponUsageReducer,
    users: userReducer,
    reports: reportReducer,
    technicians: technicianReducer,
    systemReports: systemReportReducer,
    categories: categoryReducer,
    warranty: warrantyReducer,
    transaction: transactionReducer,
    service: serviceReducer,
    statistics: statisticReducer,
    commissionConfig: commissionConfigReducer,
    commission: commissionReducer,
    financialReport: financialReportReducer,
  }
});


export default store;

