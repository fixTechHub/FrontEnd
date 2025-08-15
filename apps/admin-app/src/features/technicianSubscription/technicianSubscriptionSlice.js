import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { technicianSubscriptionAPI } from './technicianSubscriptionAPI';

// Async thunks
export const fetchAllSubscriptions = createAsyncThunk(
  'technicianSubscription/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  'technicianSubscription/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchActiveSubscriptions = createAsyncThunk(
  'technicianSubscription/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.getActiveSubscriptions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchExpiredSubscriptions = createAsyncThunk(
  'technicianSubscription/fetchExpired',
  async (_, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.getExpiredSubscriptions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSubscriptionStats = createAsyncThunk(
  'technicianSubscription/fetchStats',
  async (year, { rejectWithValue }) => {
    try {
      const [activeCount, totalRevenue, yearlyRevenue] = await Promise.all([
        technicianSubscriptionAPI.getActiveCount(),
        technicianSubscriptionAPI.getTotalRevenue(),
        technicianSubscriptionAPI.getYearlyRevenue(year)
      ]);
      
      return {
        activeCount: activeCount.activeSubscriptions,
        totalRevenue: totalRevenue.totalRevenue,
        yearlyRevenue: yearlyRevenue
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSubscription = createAsyncThunk(
  'technicianSubscription/create',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.create(subscriptionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'technicianSubscription/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.update(id, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'technicianSubscription/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.delete(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'technicianSubscription/updatePaymentStatus',
  async ({ id, paymentStatus, transactionId }, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.updatePaymentStatus(id, paymentStatus, transactionId);
      return { id, paymentStatus, transactionId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'technicianSubscription/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.cancelSubscription(id, reason);
      return { id, reason, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const renewSubscription = createAsyncThunk(
  'technicianSubscription/renew',
  async ({ id, newEndDate }, { rejectWithValue }) => {
    try {
      const response = await technicianSubscriptionAPI.renewSubscription(id, newEndDate);
      return { id, newEndDate, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  subscriptions: [],
  activeSubscriptions: [],
  expiredSubscriptions: [],
  selectedSubscription: null,
  stats: {
    activeCount: 0,
    totalRevenue: 0,
    yearlyRevenue: null
  },
  loading: false,
  error: null,
  success: false
};

const technicianSubscriptionSlice = createSlice({
  name: 'technicianSubscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedSubscription: (state, action) => {
      state.selectedSubscription = action.payload;
    },
    clearSelectedSubscription: (state) => {
      state.selectedSubscription = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subscriptions
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch subscription by ID
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubscription = action.payload;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active subscriptions
      .addCase(fetchActiveSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSubscriptions = action.payload;
      })
      .addCase(fetchActiveSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch expired subscriptions
      .addCase(fetchExpiredSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpiredSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.expiredSubscriptions = action.payload;
      })
      .addCase(fetchExpiredSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchSubscriptionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSubscriptionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions.push(action.payload.data);
        state.success = true;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(sub => sub.id === action.payload.data.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(sub => sub.id !== action.payload.id);
        state.success = true;
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const subscription = state.subscriptions.find(sub => sub.id === action.payload.id);
        if (subscription) {
          subscription.paymentStatus = action.payload.paymentStatus;
        }
        state.success = true;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const subscription = state.subscriptions.find(sub => sub.id === action.payload.id);
        if (subscription) {
          subscription.status = 'CANCELLED';
        }
        state.success = true;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Renew subscription
      .addCase(renewSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(renewSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const subscription = state.subscriptions.find(sub => sub.id === action.payload.id);
        if (subscription) {
          subscription.endDate = action.payload.newEndDate;
          subscription.status = 'ACTIVE';
        }
        state.success = true;
      })
      .addCase(renewSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setSelectedSubscription, 
  clearSelectedSubscription 
} = technicianSubscriptionSlice.actions;

export default technicianSubscriptionSlice.reducer;
