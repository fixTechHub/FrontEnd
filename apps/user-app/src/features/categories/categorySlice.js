import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicCategories } from "./categoryAPI";

export const fetchAllPublicCategories = createAsyncThunk(
    'categories/fetchAllPublicCategories',
    async () => {
        const res = await getPublicCategories();
        // console.log(res.data.data);

        return res.data.data;
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
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
    }
});

export default categorySlice.reducer;
