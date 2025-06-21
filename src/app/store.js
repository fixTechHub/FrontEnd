import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

import categoryReducer from '../features/categories/categorySlice';
import serviceReducer from '../features/services/serviceSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import messageReducer from '../features/messages/messageSlice';
import bookingReducer from '../features/bookings/bookingSlice'
import contractReducer from '../features/contracts/contractSlice'
import bookingPriceReducer from '../features/booking-price/bookingPriceSlice'
import transactionReducer from '../features/transactions/transactionSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    categories: categoryReducer,
    services: serviceReducer,
    technician: technicianReducer,
    messages: messageReducer,
    contracts: contractReducer,
    bookingPrice: bookingPriceReducer,
    transaction: transactionReducer
  },



});

export default store;
