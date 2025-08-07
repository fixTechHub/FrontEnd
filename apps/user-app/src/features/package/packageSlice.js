// src/features/technicianSubscription/technicianSubscriptionSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentSubscription, fetchAllPackages } from "./packageAPI";

// 📌 Async thunk để fetch gói hiện tại
export const fetchCurrentSubscription = createAsyncThunk(
    'technicianSubscription/fetchCurrent',
    async (technicianId) => {
        const res = await getCurrentSubscription(technicianId);
        console.log('[API RESPONSE]', res.data);
        return res.data; // Lấy gói đăng ký từ API
    }
);

export const getAllPackages = createAsyncThunk(
    "packages/getAll",
    async () => {
        const res = await fetchAllPackages();
        return res.data.data; // <-- trả về mảng các gói
    }
);

const technicianSubscriptionSlice = createSlice({
    name: 'technicianSubscription',
    initialState: {
        currentSubscription: null,
        all: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentSubscription.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentSubscription = action.payload;
            })
            .addCase(fetchCurrentSubscription.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(getAllPackages.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getAllPackages.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.all = action.payload;
            })
            .addCase(getAllPackages.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    }
});

export default technicianSubscriptionSlice.reducer;
