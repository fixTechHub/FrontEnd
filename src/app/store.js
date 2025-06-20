import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import bookingReducer from '../features/bookings/bookingSlice';
import technicianReducer from '../features/technicians/technicianSlice';
import messageReducer from '../features/messages/messageSlice';
import bookingReducer from '../features/bookings/bookingSlice'
import contractReducer from '../features/contracts/contractSlice'
import bookingPriceReducer from '../features/booking-price/bookingPriceSlice'
export const store = configureStore({
  reducer: {

    // auth: authReducer,
    // bookings: bookingReducer,

    auth: authReducer,
    bookings: bookingReducer,

    technician: technicianReducer,
    messages: messageReducer,
    contracts: contractReducer,
    bookingPrice: bookingPriceReducer
  },
});

export default store;
