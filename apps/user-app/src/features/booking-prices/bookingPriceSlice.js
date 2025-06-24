import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingPriceAPI, getQuotationInformation } from './bookingPriceAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
    acceptedBookingPrice: null,
    quotationDetail: null,
    bookingItem: [],
    userCoupons: [],
    status: 'idle', // cho fetchQuotationDetail
    loading: false, // cho getAcceptedBookingPrice
    error: null,
};

// Thunk: Lấy báo giá đã được chọn (accepted)
export const getAcceptedBookingPriceThunk = createAsyncThunk(
    'bookingPrice/getAcceptedBookingPrice',
    async ({ bookingId, technicianId }, { rejectWithValue }) => {
        try {
            const response = await bookingPriceAPI.getAcceptedBookingPrice(bookingId, technicianId);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin accepted booking price';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Thunk: Lấy thông tin chi tiết báo giá theo quotationId
export const fetchBookingPriceInformation = createAsyncThunk(
    'bookingPrice/fetchBookingPriceInformation',
    async (quotationId, { rejectWithValue }) => {
        try {
            const res = await getQuotationInformation(quotationId);
            console.log('--- FETCH BOOKING PRICE ---', res.data.data);
            return res.data.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin báo giá';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Slice
const bookingPriceSlice = createSlice({
    name: 'bookingPrice',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearQuotation: (state) => {
            state.acceptedBookingPrice = null;
            state.quotationDetail = null;
            state.bookingItem = [];
            state.userCoupons = [];
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý getAcceptedBookingPriceThunk
            .addCase(getAcceptedBookingPriceThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAcceptedBookingPriceThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedBookingPrice = action.payload.bookingPrice;
                state.bookingItem = action.payload.bookingItem;
                state.userCoupons = action.payload.userCoupons;
                state.error = null;
            })
            .addCase(getAcceptedBookingPriceThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Xử lý fetchBookingPriceInformation
            .addCase(fetchBookingPriceInformation.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBookingPriceInformation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.quotationDetail = action.payload;
                state.error = null;
            })
            .addCase(fetchBookingPriceInformation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export const { clearError, clearQuotation } = bookingPriceSlice.actions;
export default bookingPriceSlice.reducer;
