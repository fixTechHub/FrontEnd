import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllFeedback, moderateFeedback } from "./feedbackAPI";

// 📌 Lấy tất cả feedback (Admin)
export const fetchAllFeedback = createAsyncThunk(
  'adminFeedback/fetchAll',
  async (filters = {}) => {
    const res = await getAllFeedback(filters);
    return res.data.data;   // ✅ Lấy data chuẩn từ API
  }
);

// 📌 Admin ẩn/hiện feedback kèm lý do
export const updateFeedbackVisibility = createAsyncThunk(
  'adminFeedback/moderate',
  async ({ feedbackId, isVisible, reason }) => {
    const res = await moderateFeedback(feedbackId, { isVisible, reason });
    return res.data.data;   // ✅ API trả về feedback sau khi update
  }
);

const adminFeedbackSlice = createSlice({
  name: 'adminFeedback',
  initialState: {
    feedbacks: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 📌 GET ALL FEEDBACK
      .addCase(fetchAllFeedback.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.feedbacks = action.payload;
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      // 📌 MODERATE FEEDBACK (ẩn/hiện)
      .addCase(updateFeedbackVisibility.fulfilled, (state, action) => {
        const index = state.feedbacks.findIndex(fb => fb._id === action.payload._id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
      });
  }
});

export default adminFeedbackSlice.reducer;
