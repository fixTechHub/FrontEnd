import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

// Async thunk để lấy mô tả phổ biến
export const fetchPopularDescriptions = createAsyncThunk(
    'suggestions/fetchPopularDescriptions',
    async (limit = 10) => {
        const response = await apiClient.get(`/bookings/popular-descriptions?limit=${limit}`);
        return response.data;
    }
);

// Async thunk để tìm kiếm mô tả
export const searchDescriptions = createAsyncThunk(
    'suggestions/searchDescriptions',
    async ({ query, limit = 5 }) => {
        const response = await apiClient.get(`/bookings/search-descriptions?query=${encodeURIComponent(query)}&limit=${limit}`);
        return response.data;
    }
);

const suggestionSlice = createSlice({
    name: 'suggestions',
    initialState: {
        popularDescriptions: [],
        searchResults: [],
        popularLoading: false,
        searchLoading: false,
        popularError: null,
        searchError: null
    },
    reducers: {
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchError = null;
        },
        clearAllSuggestions: (state) => {
            state.popularDescriptions = [];
            state.searchResults = [];
            state.popularError = null;
            state.searchError = null;
        }
    },
    extraReducers: (builder) => {
        // Popular descriptions
        builder
            .addCase(fetchPopularDescriptions.pending, (state) => {
                state.popularLoading = true;
                state.popularError = null;
            })
            .addCase(fetchPopularDescriptions.fulfilled, (state, action) => {
                state.popularLoading = false;
                if (action.payload.success) {
                    state.popularDescriptions = action.payload.data;
                } else {
                    state.popularError = action.payload.message || 'Lỗi khi tải gợi ý phổ biến';
                }
            })
            .addCase(fetchPopularDescriptions.rejected, (state, action) => {
                state.popularLoading = false;
                state.popularError = action.error.message || 'Lỗi khi tải gợi ý phổ biến';
            });

        // Search descriptions
        builder
            .addCase(searchDescriptions.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
            })
            .addCase(searchDescriptions.fulfilled, (state, action) => {
                state.searchLoading = false;
                if (action.payload.success) {
                    state.searchResults = action.payload.data;
                } else {
                    state.searchError = action.payload.message || 'Lỗi khi tìm kiếm gợi ý';
                }
            })
            .addCase(searchDescriptions.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.error.message || 'Lỗi khi tìm kiếm gợi ý';
            });
    }
});

export const { clearSearchResults, clearAllSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer; 