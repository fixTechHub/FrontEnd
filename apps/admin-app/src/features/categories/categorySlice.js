import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryAPI } from './categoryAPI';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await categoryAPI.create(categoryData);
      dispatch(fetchCategories());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, categoryData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await categoryAPI.update(id, categoryData);
      dispatch(fetchCategories());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await categoryAPI.delete(id);
      dispatch(fetchCategories());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDeletedCategories = createAsyncThunk(
  'category/fetchDeletedCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getDeleted();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restoreCategory = createAsyncThunk(
  'category/restoreCategory',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await categoryAPI.restore(id);
      dispatch(fetchCategories());
      dispatch(fetchDeletedCategories());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  categories: [],
  deletedCategories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  success: false,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.selectedCategory = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeletedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCategories = action.payload;
      })
      .addCase(fetchDeletedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(restoreCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState, setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer; 