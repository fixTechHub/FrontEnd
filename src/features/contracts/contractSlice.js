import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import contractAPI from './contractAPI';
import { toast } from 'react-toastify';

const initialState = {
    contracts: [],
    currentContract: null,
    loading: false,
    error: null,
    signingUrl: null
};

// Thunks
export const createContractThunk = createAsyncThunk(
    'contracts/createContract',
    async (contractData, { rejectWithValue }) => {
        try {
            const response = await contractAPI.createContract(contractData);
            toast.success('Contract created successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to create contract');
            return rejectWithValue(error.message || 'Failed to create contract');
        }
    }
);

export const getContractByIdThunk = createAsyncThunk(
    'contracts/getContractById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await contractAPI.getContractById(id);
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to fetch contract');
            return rejectWithValue(error.message || 'Failed to fetch contract');
        }
    }
);

export const getContractsByTechnicianIdThunk = createAsyncThunk(
    'contracts/getContractsByTechnicianId',
    async (technicianId, { rejectWithValue }) => {
        try {
            const response = await contractAPI.getContractsByTechnicianId(technicianId);
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to fetch contracts');
            return rejectWithValue(error.message || 'Failed to fetch contracts');
        }
    }
);

const contractSlice = createSlice({
    name: 'contracts',
    initialState,
    reducers: {
        clearContractError: (state) => {
            state.error = null;
        },
        clearSigningUrl: (state) => {
            state.signingUrl = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Contract
            .addCase(createContractThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createContractThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.signingUrl = action.payload.signingUrl;
                state.contracts.push(action.payload.contract);
            })
            .addCase(createContractThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Contract by ID
            .addCase(getContractByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContractByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentContract = action.payload;
            })
            .addCase(getContractByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Contracts by Technician ID
            .addCase(getContractsByTechnicianIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContractsByTechnicianIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = action.payload;
            })
            .addCase(getContractsByTechnicianIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearContractError, clearSigningUrl } = contractSlice.actions;
export default contractSlice.reducer; 