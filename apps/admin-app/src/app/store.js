import { configureStore } from '@reduxjs/toolkit';
import technicianReducer from '../features/technician/technicianSlice';
import transactionReducer from '../features/technician/technicianSlice';
import transactionReducer from '../features/transactions/transactionSlice'
import notificationReducer from '../features/notifications/notificationsSlice'

export const store = configureStore({
    reducer: {
        technician: technicianReducer,
        transaction: transactionReducer,
        notification:notificationReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
