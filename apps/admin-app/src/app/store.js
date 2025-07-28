import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from '../features/transactions/transactionSlice';
import commissionReducer from '../features/commission/commissionSlice'; 

 const store = configureStore({
  reducer: {
    transaction: transactionReducer,
    commission: commissionReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export default store;
