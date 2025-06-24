import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionAPI } from './transactionAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  loading: false,
  error: null,
};


export const finalizeBookingThunk = createAsyncThunk(
    'transaction/finalizeBooking',
    async (bookingData, { rejectWithValue }) => {
      try {
        const response = await transactionAPI.finalizeBooking(bookingData);
        return response.data; // This will contain the paymentUrl if applicable
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Finalizing booking failed';
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }
    }
  );


  
// Slice
const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
      clearError: (state) => {
        state.error = null;
      },
     
    },
    extraReducers: (builder) => {
      builder
   
        // Finalize Booking
        .addCase(finalizeBookingThunk.pending, (state) => {
          state.loading = true;
        })
        .addCase(finalizeBookingThunk.fulfilled, (state, action) => {
          state.loading = false;
          // The backend response now contains the final state.
          // We can update the local state if needed, but for now, the primary
          // goal is to get the payment URL or confirm cash payment.
        })
        .addCase(finalizeBookingThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    }
  });
  
  export const { clearError } = transactionSlice.actions;
  export default transactionSlice.reducer;
  