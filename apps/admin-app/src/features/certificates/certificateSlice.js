import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllCertificates, verifyCertificate } from './certificateAPI';

export const fetchAllCertificatesThunk = createAsyncThunk(
  'adminCertificate/fetchAll',
  async (params, thunkAPI) => {
    try {
      return await fetchAllCertificates(params);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Fetch certificates failed'
      );
    }
  }
);

export const verifyCertificateThunk = createAsyncThunk(
  'adminCertificate/verify',
  async ({ id, status, reason }, thunkAPI) => {
    try {
      return await verifyCertificate({ id, status, reason });
      
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || 'Verify certificate failed'
      );
    }
  }
);

const initialState = {
  certificates: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: '',
  verifyingId: null, // id đang verify để disable nút
  lastQuery: { page: 1, limit: 10, status: null, search: '' }, // tiện refetch
};

const certificateSlice = createSlice({
  name: 'adminCertificate',
  initialState,
  reducers: {
    clearCertError(state) {
      state.error = '';
    },
    setCertQuery(state, action) {
      // lưu query hiện tại (page/limit/status/search) để refetch
      state.lastQuery = { ...state.lastQuery, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchAllCertificatesThunk.pending, (state, action) => {
        state.status = 'loading';
        state.error = '';
        // nếu có param, nhớ lưu lại để sau có thể refetch
        if (action.meta?.arg) state.lastQuery = { ...state.lastQuery, ...action.meta.arg };
      })
      .addCase(fetchAllCertificatesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.certificates = action.payload.items || [];
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllCertificatesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // verify
      .addCase(verifyCertificateThunk.pending, (state, action) => {
        state.verifyingId = action.meta.arg?.id || null;
      })
      .addCase(verifyCertificateThunk.fulfilled, (state, action) => {
        state.verifyingId = null;
        const updated = action.payload?.data;
        if (!updated?._id) return;

        // cập nhật trực tiếp phần tử trong danh sách (khỏi refetch)
        const idx = state.certificates.findIndex((c) => c._id === updated._id);
        if (idx > -1) {
          state.certificates[idx] = { ...state.certificates[idx], ...updated };
        }
      })
      .addCase(verifyCertificateThunk.rejected, (state, action) => {
        state.verifyingId = null;
        state.error = action.payload;
      });
  },
});

export const { clearCertError, setCertQuery } = certificateSlice.actions;
export default certificateSlice.reducer;
