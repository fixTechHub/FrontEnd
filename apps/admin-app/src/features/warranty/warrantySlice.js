import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { warrantyAPI } from './warrantyAPI';

export const fetchAllWarranties = createAsyncThunk('warranty/fetchAll', async () => {
  return await warrantyAPI.getAll();
});

export const fetchWarrantyById = createAsyncThunk('warranty/fetchById', async (id) => {
  return await warrantyAPI.getById(id);
});

export const updateWarrantyStatus = createAsyncThunk('warranty/updateStatus', async ({ id, data }) => {
  await warrantyAPI.updateStatus(id, data);
  return { id, ...data };
});

export const updateWarrantyDetails = createAsyncThunk('warranty/updateDetails', async ({ id, data }) => {
  const result = await warrantyAPI.updateDetails(id, data);
  return result;
});

const warrantySlice = createSlice({
  name: 'warranty',
  initialState: {
    list: [],
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWarranties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWarranties.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllWarranties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWarrantyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarrantyById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchWarrantyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateWarrantyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarrantyStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật trạng thái trong list nếu cần
        const idx = state.list.findIndex(w => w.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...action.payload };
        }
        if (state.detail && state.detail.id === action.payload.id) {
          state.detail = { ...state.detail, ...action.payload };
        }
      })
      .addCase(updateWarrantyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateWarrantyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarrantyDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật warranty trong list
        const idx = state.list.findIndex(w => w.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
        if (state.detail && state.detail.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateWarrantyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default warrantySlice.reducer; 