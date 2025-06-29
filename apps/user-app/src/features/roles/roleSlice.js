import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRoles } from './roleAPI';

// Thunk lấy toàn bộ role
export const fetchAllRoles = createAsyncThunk(
    'roles/fetchAllRoles',
    async () => {
        const res = await getRoles();
        return res.data; // Back-end trả về mảng role
    }
);

const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRoles.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllRoles.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default roleSlice.reducer; 