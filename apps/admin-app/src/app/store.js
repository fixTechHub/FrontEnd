import { configureStore } from '@reduxjs/toolkit';
import technicianReducer from '../features/technician/technicianSlice';
import transactionReducer from '../features/transactions/transactionSlice'

export const store = configureStore({
    reducer: {
        technician: technicianReducer,
        transaction: transactionReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
