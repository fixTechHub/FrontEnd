
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { approveTechnician } from './adminAPI';

const initialState = {
    loading: false,
    error: null,
    lastApprovedTechnician: null,
};

export const approveTechnicianThunk = createAsyncThunk(
    'admin/approveTechnician',
    async (technicianId, { rejectWithValue }) => {
        try {
            const data = await approveTechnician(technicianId);
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve technician.');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(approveTechnicianThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveTechnicianThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.lastApprovedTechnician = action.payload;
            })
            .addCase(approveTechnicianThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer; 