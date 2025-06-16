import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contractAPI } from './contractAPI';

const initialState = {
  signingUrl: null,
  contractCode: null,
  loading: false,
  error: null
};

export const createEnvelopeThunk = createAsyncThunk(
  'contract/createEnvelope',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await contractAPI.createEnvelope(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create envelope');
    }
  }
);

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    clearContractError(state) {
      state.error = null;
    },
    clearContractState(state) {
      state.signingUrl = null;
      state.contractCode = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEnvelopeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnvelopeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.signingUrl = action.payload.signingUrl;
        state.contractCode = action.payload.contractCode;
      })
      .addCase(createEnvelopeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearContractError, clearContractState } = contractSlice.actions;
export default contractSlice.reducer;