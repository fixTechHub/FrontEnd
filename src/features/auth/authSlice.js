import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  // ... các state khác nếu cần
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    // ... các reducers khác nếu cần
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
