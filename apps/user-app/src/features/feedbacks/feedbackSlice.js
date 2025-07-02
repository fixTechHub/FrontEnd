import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { submitFeedback } from './feedbackAPI';

export const submitFeedbackThunk = createAsyncThunk(
  'feedback/submit',
  async ({ bookingId, feedbackData }, thunkAPI) => {
    try {
      const response = await submitFeedback(bookingId, feedbackData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Submit feedback failed'
      );
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    loading: false,
    successMessage: '',
    errorMessage: '',
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = '';
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedbackThunk.pending, (state) => {
        state.loading = true;
        state.successMessage = '';
        state.errorMessage = '';
      })
      .addCase(submitFeedbackThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(submitFeedbackThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      });
  },
});

export const { clearMessages } = feedbackSlice.actions;
export default feedbackSlice.reducer;