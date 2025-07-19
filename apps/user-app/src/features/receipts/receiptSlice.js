import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserReceipts } from './receiptAPI';

export const fetchUserReceipts = createAsyncThunk(
  'receipt/fetchUserReceipts',
  async ({ limit, skip }, { rejectWithValue }) => {
    try {
      const response = await getUserReceipts(limit, skip );
      // console.log(response);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipts');
    }
  }
);

const receiptSlice = createSlice({
  name: 'receipt',
  initialState: {
    receipts: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearReceipts: (state) => {
      state.receipts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReceipts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserReceipts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.receipts = action.payload;
      })
      .addCase(fetchUserReceipts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectReceipts = (state) => state.receipt.receipts;
export const selectReceiptStatus = (state) => state.receipt.status;
export const selectReceiptError = (state) => state.receipt.error;

export const { clearReceipts } = receiptSlice.actions;

export default receiptSlice.reducer;