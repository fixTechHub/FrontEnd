import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getConflictingSchedulesAPI } from './technicianScheduleAPI';

// Async thunk để lấy conflicting schedules
export const fetchConflictingSchedules = createAsyncThunk(
    'technicianSchedule/fetchConflictingSchedules',
    async ({ technicianId, startTime, endTime }, { rejectWithValue }) => {
        try {
            console.log('🔍 DEBUG: Redux thunk fetchConflictingSchedules được gọi');
            console.log('  technicianId:', technicianId);
            console.log('  startTime:', startTime);
            console.log('  endTime:', endTime);

            const response = await getConflictingSchedulesAPI(technicianId, startTime, endTime);
            return response;
        } catch (error) {
            console.error('❌ DEBUG: Lỗi trong Redux thunk:', error);
            return rejectWithValue(error.response?.data || 'Lỗi khi lấy lịch trùng');
        }
    }
);

const initialState = {
    conflicts: [],
    loading: false,
    error: null,
    conflictCount: 0
};

const technicianScheduleSlice = createSlice({
    name: 'technicianSchedule',
    initialState,
    reducers: {
        clearConflicts: (state) => {
            state.conflicts = [];
            state.conflictCount = 0;
            state.error = null;
        },
        clearAll: (state) => {
            state.conflicts = [];
            state.loading = false;
            state.error = null;
            state.conflictCount = 0;
        }
    },
    extraReducers: (builder) => {
        // fetchConflictingSchedules
        builder
            .addCase(fetchConflictingSchedules.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConflictingSchedules.fulfilled, (state, action) => {
                state.loading = false;
                state.conflicts = action.payload.conflicts || [];
                state.conflictCount = action.payload.count || 0;
                state.error = null;
                console.log('✅ DEBUG: Redux state updated with conflicts:', state.conflicts);
            })
            .addCase(fetchConflictingSchedules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Lỗi khi lấy lịch trùng';
                state.conflicts = [];
                state.conflictCount = 0;
            });
    }
});

export const { clearConflicts, clearAll } = technicianScheduleSlice.actions;

// Selectors
export const selectConflicts = (state) => state.technicianSchedule.conflicts;
export const selectLoading = (state) => state.technicianSchedule.loading;
export const selectError = (state) => state.technicianSchedule.error;
export const selectConflictCount = (state) => state.technicianSchedule.conflictCount;
export const selectHasConflicts = (state) => state.technicianSchedule.conflictCount > 0;

export default technicianScheduleSlice.reducer;
