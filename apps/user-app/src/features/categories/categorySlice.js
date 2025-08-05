import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicCategories, getTopCategoriesByBookings } from "./categoryAPI";

export const fetchAllPublicCategories = createAsyncThunk(
    'categories/fetchAllPublicCategories',
    async () => {
        const res = await getPublicCategories();
        // console.log(res.data.data);

        return res.data.data;
    }
);

export const fetchTopPublicCategories = createAsyncThunk(
    'categories/fetchTopPublicCategories',
    async () => {
        const res = await getTopCategoriesByBookings();
        console.log(res.data.data);

        return res.data.data;
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
        topCategories: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPublicCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllPublicCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(fetchAllPublicCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchTopPublicCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTopPublicCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.topCategories = action.payload;
            })
            .addCase(fetchTopPublicCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    }
});

export default categorySlice.reducer;
