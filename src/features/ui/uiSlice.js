import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isBackToTopVisible: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBackToTopVisibility: (state, action) => {
      state.isBackToTopVisible = action.payload;
    },
  },
});

export const { setBackToTopVisibility } = uiSlice.actions;
export default uiSlice.reducer; 