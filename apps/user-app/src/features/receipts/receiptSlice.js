import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { receiptAPI } from './receiptAPI'; // adjust path if different

// Async thunk for fetching receipts
export const fetchUserReceipts = createAsyncThunk(
  'receipt/fetchUserReceipts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await receiptAPI.getUserReceipts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const receiptSlice = createSlice({
  name: 'receipt',
  initialState: {
    receipts: [],
    loading: false,
    error: null
  },
  reducers: {
    clearReceipts: (state) => {
      state.receipts = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload;
      })
      .addCase(fetchUserReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReceipts } = receiptSlice.actions;

export default receiptSlice.reducer;
