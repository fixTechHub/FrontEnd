import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contractAPI } from './contractAPI';
import { toast } from 'react-toastify';

const initialState = {
    contract: null,
    loading: false,
    error: null,
};

export const fetchContractByTechnicianThunk = createAsyncThunk(
    'contracts/fetchByTechnician',
    async (technicianId, { rejectWithValue }) => {
        try {
            const data = await contractAPI.getContractByTechnicianId(technicianId);
            return data;
        } catch (error) {
            toast.error(error.message || 'Failed to fetch contract');
            return rejectWithValue(error.message || 'Failed to fetch contract');
        }
    }
);

const contractSlice = createSlice({
    name: 'contract',
    initialState,
    reducers: {
        clearContractError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractByTechnicianThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractByTechnicianThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.contract = action.payload;
            })
            .addCase(fetchContractByTechnicianThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearContractError } = contractSlice.actions;
export default contractSlice.reducer; 