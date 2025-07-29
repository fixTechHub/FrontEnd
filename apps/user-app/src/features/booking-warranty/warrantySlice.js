import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    requestWarranty, getWarrantyInformation, acceptWarranty, rejectWarranty, confirmWarranty, proposeWarrantySchedule,
    confirmWarrantySchedule
} from './warrantyAPI'; // Assuming the requestWarranty function is in a service file

// Async thunk for requesting a warranty
export const requestWarrantyThunk = createAsyncThunk(
    'warranty/requestWarranty',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await requestWarranty(formData);
            console.log(response);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);
// Async thunk for fetching warranty information
export const getWarrantyInformationThunk = createAsyncThunk(
    'warranty/getWarrantyInformation',
    async (bookingWarrantyId, { rejectWithValue }) => {
        try {
            const response = await getWarrantyInformation(bookingWarrantyId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const acceptWarrantyThunk = createAsyncThunk(
    'warranty/acceptWarranty',
    async ({ bookingWarrantyId, status }, { rejectWithValue }) => {
        try {
            const response = await acceptWarranty(bookingWarrantyId, status);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);


export const rejectWarrantyThunk = createAsyncThunk(
    'warranty/rejectWarranty',
    async ({ bookingWarrantyId, formData }, { rejectWithValue }) => {
        try {
            const response = await rejectWarranty(bookingWarrantyId, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const confirmWarrantyThunk = createAsyncThunk(
    'warranty/confirmWarranty',
    async ({ bookingWarrantyId, formData }, { rejectWithValue }) => {
        try {
            const response = await confirmWarranty(bookingWarrantyId, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);
export const proposeWarrantyScheduleThunk = createAsyncThunk(
    'warranty/proposeWarrantySchedule',
    async ({ bookingWarrantyId, proposedSchedule }, { rejectWithValue }) => {
        try {
            const response = await proposeWarrantySchedule(bookingWarrantyId, proposedSchedule);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Xác nhận lịch
export const confirmWarrantyScheduleThunk = createAsyncThunk(
    'warranty/confirmWarrantySchedule',
    async ({ bookingWarrantyId, data }, { rejectWithValue }) => {
        try {
            const response = await confirmWarrantySchedule(bookingWarrantyId, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
const warrantySlice = createSlice({
    name: 'warranty',
    initialState: {
        warranty: null,
        loading: false,
        error: null,
        loadingSchedule: {
            propose: false,
            confirm: false,
        },
    },
    reducers: {
        resetWarrantyState: (state) => {
            state.warranty = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(requestWarrantyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestWarrantyThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.warranty = action.payload;
                state.error = null;
            })
            .addCase(requestWarrantyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Đã xảy ra lỗi khi yêu cầu bảo hành';
            })
            // Get warranty information
            .addCase(getWarrantyInformationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWarrantyInformationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.warranty = action.payload;
                state.error = null;
            })
            .addCase(getWarrantyInformationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể lấy thông tin bảo hành';
            })

            .addCase(acceptWarrantyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(acceptWarrantyThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.warranty = action.payload;
                state.error = null;
            })
            .addCase(acceptWarrantyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể cập nhật trạng thái bảo hành';
            })
            // Reject Warranty
            .addCase(rejectWarrantyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectWarrantyThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.warranty = action.payload;
                state.error = null;
            })
            .addCase(rejectWarrantyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể từ chối bảo hành';
            })
            .addCase(confirmWarrantyThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(confirmWarrantyThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.warranty = action.payload;
                state.error = null;
            })
            .addCase(confirmWarrantyThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Không thể xác nhận giải quyết bảo hành';
            })
            .addCase(proposeWarrantyScheduleThunk.pending, (state) => {
                state.loadingSchedule.propose = true;
                state.error = null;
            })
            .addCase(proposeWarrantyScheduleThunk.fulfilled, (state, action) => {
                state.loadingSchedule.propose = false;
                state.warranty = action.payload; // Update warranty with new schedule
                state.error = null;
            })
            .addCase(proposeWarrantyScheduleThunk.rejected, (state, action) => {
                state.loadingSchedule.propose = false;
                state.error = action.payload || "Không thể đề xuất lịch bảo hành";
            })

            // Confirm schedule
            .addCase(confirmWarrantyScheduleThunk.pending, (state) => {
                state.loadingSchedule.confirm = true;
                state.error = null;
            })
            .addCase(confirmWarrantyScheduleThunk.fulfilled, (state, action) => {
                state.loadingSchedule.confirm = false;
                state.warranty = action.payload; // Update warranty with confirmed schedule
                state.error = null;
            })
            .addCase(confirmWarrantyScheduleThunk.rejected, (state, action) => {
                state.loadingSchedule.confirm = false;
                state.error = action.payload || "Không thể xác nhận lịch bảo hành";
            })
    },
});

export const { resetWarrantyState } = warrantySlice.actions;
export default warrantySlice.reducer;