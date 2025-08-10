import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicServices, getPublicServicesByCategoryId, suggestServices } from "./serviceAPI"

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

export const fetchSuggestServices = createAsyncThunk(
    'services/fetchSuggestServices',
    async (descriptionSearch) => {
        const res = await suggestServices(descriptionSearch);
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
        searchResults: [],
        searchStatus: 'idle',
        searchError: null,
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
            // Thêm xử lý cho fetchSuggestServices
            .addCase(fetchSuggestServices.pending, (state) => {
                state.searchStatus = 'loading';
                state.searchError = null;
            })
            .addCase(fetchSuggestServices.fulfilled, (state, action) => {
                state.searchStatus = 'succeeded';
                state.searchResults = action.payload;
            })
            .addCase(fetchSuggestServices.rejected, (state, action) => {
                state.searchStatus = 'failed';
                state.searchError = action.error.message;
            })
    }
});

export default serviceSlice.reducer;
