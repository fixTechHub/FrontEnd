import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cancelBookingById, createBooking, getBookingById, getTopBookedServices, selectTechnician, technicianConfirmBooking, technicianRejectBooking, technicianSendQuote, customerAcceptQuote, customerRejectQuote, fetchBookingRequests as fetchBookingRequestsAPI, fetchTechniciansFoundByBookingId, getAcceptedBooking } from './bookingAPI';

export const fetchBookingById = createAsyncThunk(
    'booking/fetchBookingById',
    async (bookingId) => {
        const res = await getBookingById(bookingId);
        // console.log('--- FETCH BOOKING ---', res.data.data);

        return res.data.data;
    }
);

export const createNewBooking = createAsyncThunk(
    'booking/createNewBooking',
    async (data) => {
        const res = await createBooking(data);
        console.log('--- CREATE BOOKING ---', res);

        return res.data;
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async ({ bookingId, reason }, { rejectWithValue }) => {
        try {
            const res = await cancelBookingById(bookingId, reason);
            // console.log('--- CANCEL BOOKING ---', res);
            return res.data;
        } catch (error) {
            // console.error('--- CANCEL BOOKING ERROR ---', error);
            const message =
                error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const fetchUserBookingHistory = createAsyncThunk(
    'bookingHistory/fetchUserBookingHistory',
    async ({ limit, skip }, { rejectWithValue }) => {
        try {
            const response = await getUserBookingHistory({ limit, skip })

            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch booking history');
        }
    })
export const fetchTopBookedServices = createAsyncThunk(
    'booking/fetchTopBookedServices',
    async () => {
        const res = await getTopBookedServices();
        // console.log('--- FETCH TOP SERVICE BOOKING ---', res.data);

        return res.data.data;
    }
);

export const selectTechnicianThunk = createAsyncThunk(
    'booking/selectTechnician',
    async ({ bookingId, technicianId }, { rejectWithValue }) => {
        try {
            const res = await selectTechnician(bookingId, technicianId);
            return res.data;
        } catch (error) {
            // Sửa lại lấy message đúng chuẩn backend
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const getAcceptedBookingThunk = createAsyncThunk(
    'booking/getAcceptedBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await getAcceptedBooking(bookingId);

            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }

            return response.data.data;
        } catch (error) {
            console.error('Get Accepted Booking Error:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch accepted booking');
        }
    })

export const technicianAcceptBookingThunk = createAsyncThunk(
    'booking/technicianAcceptBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            console.log('--- THUNK: Bắt đầu gọi API ---');
            const res = await technicianConfirmBooking(bookingId);
            console.log('--- THUNK: API response ---', res);
            return res.data;
        } catch (error) {
            console.log('--- THUNK: Error object ---', error);
            console.log('--- THUNK: Error response ---', error?.response);
            console.log('--- THUNK: Error response data ---', error?.response?.data);
            console.log('--- THUNK: Error message ---', error?.message);
            
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            console.log('--- THUNK: Final error message ---', message);
            return rejectWithValue(message);
        }
    }
);

export const technicianSendQuoteThunk = createAsyncThunk(
    'booking/technicianSendQuote',
    async ({ bookingId, quoteData }, { rejectWithValue }) => {
        try {
            const res = await technicianSendQuote(bookingId, quoteData);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const customerAcceptQuoteThunk = createAsyncThunk(
    'booking/customerAcceptQuote',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await customerAcceptQuote(bookingId);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const customerRejectQuoteThunk = createAsyncThunk(
    'booking/customerRejectQuote',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await customerRejectQuote(bookingId);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const fetchBookingRequests = createAsyncThunk(
    'booking/fetchBookingRequests',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await fetchBookingRequestsAPI(bookingId);
            return res.data.data; // [{ technicianId, status, ... }]
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const fetchTechniciansFound = createAsyncThunk(
    'booking/fetchTechniciansFound',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await fetchTechniciansFoundByBookingId(bookingId);
            return res.data.data; // [{...}]
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || error.message);
        }
    }
);

export const technicianRejectBookingThunk = createAsyncThunk(
    'booking/technicianRejectBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await technicianRejectBooking(bookingId);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    bookings: [],
    newBooking: null,
    techniciansFound: [],
    bookingHistories: [],
    acceptedBooking: null,
    detailsBooking: null,
    topBookedServices: [],
    userCoupons: [],
    booking: null,
    quotations: [],
    loading: false,
    error: null,
    status: 'idle',
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        newBooking: null,
        techniciansFound: [],
        booking: null,
        detailsBooking: null,
        topBookedServices: [],
        status: 'idle',
        createBookingStatus: 'idle',
        selectTechnicianStatus: 'idle',
        error: null,
        requests: [],
        techniciansStatus: 'idle',
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearAcceptedBooking: (state) => {
            state.acceptedBooking = null;
            state.userCoupons = [];
        },
        setLastCancelBy: (state, action) => {
            state.lastCancelBy = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookingById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.booking = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createNewBooking.pending, (state) => {
                state.createBookingStatus = 'loading';
            })
            .addCase(createNewBooking.fulfilled, (state, action) => {
                state.createBookingStatus = 'succeeded';
                state.newBooking = action.payload.booking;
                // state.techniciansFound = action.payload.technicians_found || [];
            })
            .addCase(createNewBooking.rejected, (state, action) => {
                state.createBookingStatus = 'failed';
                state.error = action.error.message;
            })

            .addCase(cancelBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.booking = action.payload;
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchUserBookingHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserBookingHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.bookingHistories = action.payload.data.bookings // Adjust based on API response structure
                state.total = action.payload.total || state.bookings.length; // Adjust if API provides total
            })
            .addCase(fetchUserBookingHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(getAcceptedBookingThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAcceptedBookingThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedBooking = action.payload.acceptedBooking;
                state.userCoupons = action.payload.userCoupons;
            })
            .addCase(getAcceptedBookingThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(fetchTopBookedServices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTopBookedServices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.topBookedServices = action.payload;
            })
            .addCase(fetchTopBookedServices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(selectTechnicianThunk.pending, (state) => {
                state.selectTechnicianStatus = 'loading';
            })
            .addCase(selectTechnicianThunk.fulfilled, (state) => {
                state.selectTechnicianStatus = 'succeeded';
            })
            .addCase(selectTechnicianThunk.rejected, (state, action) => {
                state.selectTechnicianStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(technicianAcceptBookingThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(technicianAcceptBookingThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Có thể cập nhật trạng thái booking nếu muốn
            })
            .addCase(technicianAcceptBookingThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(technicianSendQuoteThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(technicianSendQuoteThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(technicianSendQuoteThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(customerAcceptQuoteThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(customerAcceptQuoteThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(customerAcceptQuoteThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(customerRejectQuoteThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(customerRejectQuoteThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(customerRejectQuoteThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchBookingRequests.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookingRequests.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.requests = action.payload;
            })
            .addCase(fetchBookingRequests.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchTechniciansFound.pending, (state) => {
                state.techniciansStatus = 'loading';
            })
            .addCase(fetchTechniciansFound.fulfilled, (state, action) => {
                state.techniciansStatus = 'succeeded';
                state.techniciansFound = action.payload;
            })
            .addCase(fetchTechniciansFound.rejected, (state, action) => {
                state.techniciansStatus = 'failed';
                state.error = action.payload;
            })

            .addCase(technicianRejectBookingThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(technicianRejectBookingThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(technicianRejectBookingThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});

export const { setLastCancelBy } = bookingSlice.actions;
export default bookingSlice.reducer;
