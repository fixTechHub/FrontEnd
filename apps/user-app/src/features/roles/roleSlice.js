import { createSlice } from '@reduxjs/toolkit';

// Simplified role slice - roles are hardcoded in ChooseRole component fallback
const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        items: [], // Empty array triggers fallback in ChooseRole component
        status: 'idle',
        error: null,
    },
    reducers: {},
});

export default roleSlice.reducer; 