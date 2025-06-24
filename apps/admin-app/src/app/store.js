import { configureStore } from '@reduxjs/toolkit';
import technicianReducer from '../features/technician/technicianSlice';

export const store = configureStore({
  reducer: {
    technician: technicianReducer,
  }
});

export default store;
