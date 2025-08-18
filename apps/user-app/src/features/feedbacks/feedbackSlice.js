// src/features/feedback/feedbackSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  submitFeedback,
  submitFeedbackReply,
  getFeedbacksByTechnician,
  getFeedbackStatsByTechnician,
  getFeedbacksByFromUser,
  updateFeedbackAPI
} from './feedbackAPI';

// =============== THUNK: Submit feedback của booking ===============
export const submitFeedbackThunk = createAsyncThunk(
  'feedback/submit',
  async ({ bookingId, formData }, thunkAPI) => {
    try {
      const response = await submitFeedback(bookingId, formData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || 'Submit feedback failed'
      );
    }
  }
);

// =============== THUNK: Technician reply feedback ===============
export const submitFeedbackReplyThunk = createAsyncThunk(
  'feedbackReply/submit',
  async ({ feedbackId, reply }, thunkAPI) => {
    try {
      const data = await submitFeedbackReply(feedbackId, reply);
      return data; // { message, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Reply failed'
      );
    }
  }
);

// =============== THUNK: List feedbacks theo technician (có filter) ===============
export const fetchFeedbacksByTechnician = createAsyncThunk(
  'feedback/fetchByTechnician',
  async ({ technicianId, page = 1, limit = 10, rating, sort = 'recent', from, to, visible }, thunkAPI) => {
    try {
      return await getFeedbacksByTechnician(technicianId, {
        page,
        limit,
        ...(rating ? { rating } : {}),
        ...(sort ? { sort } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(visible !== undefined ? { visible } : {}),
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Fetch failed');
    }
  }
);

// =============== THUNK: Stats theo technician ===============
export const fetchFeedbackStatsByTechnician = createAsyncThunk(
  'feedback/fetchStatsByTechnician',
  async (technicianId, thunkAPI) => {
    try {
      return await getFeedbackStatsByTechnician(technicianId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.response?.data?.message || 'Fetch stats failed');
    }
  }
);

export const fetchFeedbacksByFromUser = createAsyncThunk(
  'feedback/fetchByFromUser',
  async ({ userId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await getFeedbacksByFromUser(userId, { page, limit });
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Fetch feedback failed'
      );
    }
  }
);

export const fetchFeedbacksByBooking = createAsyncThunk(
  'bookingFeedback/fetchByBooking',
  async (bookingId, thunkAPI) => {
    try {
      const data = await getFeedbacksByBooking(bookingId); // { items, total }
      return { bookingId, ...data };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Fetch feedback by booking failed'
      );
    }
  }
);

export const updateFeedbackThunk = createAsyncThunk(
  'feedback/updateOne',
  async ({ id, content, rating, images = [] }, { rejectWithValue }) => {
    try {
      // payload BE nhận: { rating, content, images }
      const updated = await updateFeedbackAPI(id, { rating, content, images });
      return updated; // là document feedback sau khi save
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Update feedback failed';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  loading: false,
  errorMessage: '',
  successMessage: '',

  // List
  items: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,

  // Filters
  filters: {
    rating: '',
    sort: 'recent',
    from: '',
    to: '',
    visible: true,
  },

  // Stats
  stats: null,
  statsLoading: false,
  statsError: '',

  // ⬇️ trạng thái riêng cho EDIT
  updateLoading: false,
  updateError: null,
  updateSuccessMessage: '',
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.successMessage = '';
      state.errorMessage = '';
      state.updateSuccessMessage = '';
      state.updateError = null;
    },
    setFeedbackFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setFeedbackPage: (state, action) => {
      state.page = action.payload || 1;
    },
    setFeedbackLimit: (state, action) => {
      state.limit = action.payload || 10;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // ----- Submit feedback -----
      .addCase(submitFeedbackThunk.pending, (state) => {
        state.loading = true;
        state.successMessage = '';
        state.errorMessage = '';
      })
      .addCase(submitFeedbackThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || 'Submit feedback success';
      })
      .addCase(submitFeedbackThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })

      // ----- Reply feedback -----
      .addCase(submitFeedbackReplyThunk.pending, (state) => {
        state.loading = true;
        state.successMessage = '';
        state.errorMessage = '';
      })
      .addCase(submitFeedbackReplyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || 'Reply submitted';
      })
      .addCase(submitFeedbackReplyThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })

      // ----- Fetch list by technician -----
      .addCase(fetchFeedbacksByTechnician.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(fetchFeedbacksByTechnician.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeedbacksByTechnician.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })

      // ----- Fetch stats -----
      .addCase(fetchFeedbackStatsByTechnician.pending, (state) => {
        state.statsLoading = true;
        state.statsError = '';
      })
      .addCase(fetchFeedbackStatsByTechnician.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchFeedbackStatsByTechnician.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })

      // ----- Fetch by fromUser -----
      .addCase(fetchFeedbacksByFromUser.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })
      .addCase(fetchFeedbacksByFromUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFeedbacksByFromUser.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })

      // ----- Fetch by booking -----
      .addCase(fetchFeedbacksByBooking.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchFeedbacksByBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchFeedbacksByBooking.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload;
      })

      // ======= UPDATE (EDIT) FEEDBACK =======
      .addCase(updateFeedbackThunk.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccessMessage = '';
      })
      .addCase(updateFeedbackThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updated = action.payload;
        // cập nhật ngay trong list hiện tại
        const idx = state.items.findIndex((i) => i._id === updated._id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
        state.updateSuccessMessage = 'Cập nhật đánh giá thành công';
      })
      .addCase(updateFeedbackThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || 'Cập nhật thất bại';
      });
  },
});

export const {
  clearMessages,
  setFeedbackFilters,
  setFeedbackPage,
  setFeedbackLimit,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;