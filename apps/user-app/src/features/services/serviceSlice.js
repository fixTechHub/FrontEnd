import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicServices, getPublicServicesByCategoryId } from "./serviceAPI"

export const fetchAllPublicServices = createAsyncThunk(
    'services/fetchAllPublicServices', 
    async () => {
        const res = await getPublicServices();
        
        return res.data.data;
    }
);

export const fetchPublicServicesByCategoryId = createAsyncThunk(
    'services/fetchPublicServicesByCategoryId',
    async (id) => {
        const res = await getPublicServicesByCategoryId(id);

        return res.data.data;
    }
)

const serviceSlice = createSlice({
    name: 'services',
    initialState: {
        services: [],
        servicesC: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPublicServices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllPublicServices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.services = action.payload;
            })
            .addCase(fetchAllPublicServices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchPublicServicesByCategoryId.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.servicesC = action.payload;
            })
    }
});

export default serviceSlice.reducer;
