import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFavorites, addFavorite, removeFavorite } from './favoriteAPI';

export const getFavoritesThunk = createAsyncThunk('favorites/get', async (_, thunkAPI) => {
  try {
    const data = await fetchFavorites();
    return data.data; // assuming response {message, data}
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addFavoriteThunk = createAsyncThunk('favorites/add', async (technicianId, thunkAPI) => {
  try {
    const data = await addFavorite(technicianId);
    return data.data; // new favorite object
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFavoriteThunk = createAsyncThunk('favorites/remove', async (technicianId, thunkAPI) => {
  try {
    await removeFavorite(technicianId);
    return technicianId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get
      .addCase(getFavoritesThunk.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getFavoritesThunk.fulfilled, (state, action) => {
        state.loading = false; state.list = action.payload;
      })
      .addCase(getFavoritesThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      // Add
      .addCase(addFavoriteThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(addFavoriteThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove
      .addCase(removeFavoriteThunk.fulfilled, (state, action) => {
        state.list = state.list.filter(fav => fav.technicianId && fav.technicianId._id !== action.payload);
      })
      .addCase(removeFavoriteThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default favoriteSlice.reducer; 