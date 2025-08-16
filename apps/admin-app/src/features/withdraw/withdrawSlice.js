import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchWithdrawLogs, approveWithdraw } from './withdrawAPI';

// thunks
export const fetchWithdrawLogsThunk = createAsyncThunk(
    'adminWithdraw/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            return await fetchWithdrawLogs(params);
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Fetch withdraw logs failed'
            );
        }
    }
);

export const approveWithdrawThunk = createAsyncThunk(
    'adminWithdraw/approve',
    async (logId, { rejectWithValue }) => {
        try {
            return await approveWithdraw(logId);
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Approve withdraw failed'
            );
        }
    }
);

// state
const initialState = {
    items: [],
    loading: false,
    approving: false,
    approvingId: null,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    lastQuery: { page: 1, limit: 10, status: 'PENDING', search: '' },
};

const adminWithdrawSlice = createSlice({
    name: 'adminWithdraw',
    initialState,
    reducers: {
        clearWithdrawError(state) {
            state.error = null;
        },
        resetWithdrawState() {
            return initialState;
        },
        // ⭐ cần cho component: lưu query hiện tại để refetch
        setWithdrawQuery(state, action) {
            state.lastQuery = { ...state.lastQuery, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchWithdrawLogsThunk.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                if (action.meta?.arg) {
                    state.lastQuery = { ...state.lastQuery, ...action.meta.arg };
                }
            })
            .addCase(fetchWithdrawLogsThunk.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload ?? {};
                const data = payload.data ?? payload;

                state.items =
                    data.items ??
                    data.list ??
                    data.logs ??
                    (Array.isArray(data) ? data : state.items);

                state.page = data.page ?? state.page;
                state.limit = data.limit ?? state.limit;
                state.total = data.total ?? data.count ?? state.items.length;
                // Nếu muốn ưu tiên nullish trước rồi fallback:
                state.totalPages = (data.totalPages ?? Math.ceil(state.total / state.limit)) || 0;

            })
            .addCase(fetchWithdrawLogsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || 'Fetch withdraw logs failed';
            })

            // approve
            .addCase(approveWithdrawThunk.pending, (state, action) => {
                state.approving = true;
                state.approvingId = action.meta.arg || null;
                state.error = null;
            })
            .addCase(approveWithdrawThunk.fulfilled, (state, action) => {
                state.approving = false;
                state.approvingId = null;

                const payload = action.payload ?? {};
                const updated = payload.log || payload.data || payload.item || payload;

                let id = updated?._id || updated?.id || null;
                if (!id) id = action.meta.arg; // fallback

                // cập nhật item
                const idx = state.items.findIndex((it) => it._id === id || it.id === id);
                if (idx > -1) {
                    state.items[idx] = { ...state.items[idx], ...updated, status: 'APPROVED' };
                }

                // nếu đang lọc PENDING thì loại khỏi list
                if (state.lastQuery?.status === 'PENDING') {
                    state.items = state.items.filter((it) => (it._id || it.id) !== id);
                    state.total = Math.max(0, state.total - 1);
                }
            })
            .addCase(approveWithdrawThunk.rejected, (state, action) => {
                state.approving = false;
                state.approvingId = null;
                state.error = action.payload || action.error?.message || 'Approve withdraw failed';
            });
    },
});

export const { clearWithdrawError, resetWithdrawState, setWithdrawQuery } =
    adminWithdrawSlice.actions;

export const selectWithdrawItems = (s) => s.adminWithdraw.items;
export const selectWithdrawLoading = (s) => s.adminWithdraw.loading;
export const selectWithdrawApproving = (s) => s.adminWithdraw.approving;
export const selectWithdrawApprovingId = (s) => s.adminWithdraw.approvingId;
export const selectWithdrawError = (s) => s.adminWithdraw.error;
export const selectWithdrawPagination = (s) => ({
    page: s.adminWithdraw.page,
    limit: s.adminWithdraw.limit,
    total: s.adminWithdraw.total,
    totalPages: s.adminWithdraw.totalPages,
});
export const selectWithdrawQuery = (s) => s.adminWithdraw.lastQuery;

export default adminWithdrawSlice.reducer;
