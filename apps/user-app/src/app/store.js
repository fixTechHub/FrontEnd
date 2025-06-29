import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

import categoryReducer from '../features/categories/categorySlice';
import serviceReducer from '../features/services/serviceSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import messageReducer from '../features/messages/messageSlice';
import bookingReducer from '../features/bookings/bookingSlice'
import contractReducer from '../features/contracts/contractSlice'
import bookingPriceReducer from '../features/booking-prices/bookingPriceSlice'
import transactionReducer from '../features/transactions/transactionSlice'
import adminReducer from '../features/admin/adminSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import videoCallReducer from '../features/video-call/videoCallSlice';
import quotationReducer from '../features/quotations/quotationSlice';
import receiptReducer from '../features/receipts/receiptSlice';
import roleReducer from '../features/roles/roleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    categories: categoryReducer,
    services: serviceReducer,
    technician: technicianReducer,
    messages: messageReducer,
    contract: contractReducer,
    bookingPrice: bookingPriceReducer,
    transaction: transactionReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    videoCall: videoCallReducer,
    quotation: quotationReducer,
    receipt: receiptReducer,
    roles: roleReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
