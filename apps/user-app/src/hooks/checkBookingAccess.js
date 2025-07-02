import { fetchBookingById } from '../features/bookings/bookingSlice';

export const checkBookingAccess = async (dispatch, bookingId, userId, role) => {
    try {
        // Ensure bookingId and userId are provided
        if (!bookingId || !userId) {
            return {
                isAuthorized: false,
                error: 'Thiếu ID đơn hoặc ID người dùng ',
            };
        }

        // Fetch booking data
        const booking = await dispatch(fetchBookingById(bookingId)).unwrap();
        
        // Extract customerId and technicianId (handle both populated objects and ObjectId strings)
        const customerId = booking.customerId?._id || booking.customerId;
        const technicianId = booking.technicianId?.userId._id
      
        let isAuthorized = false;

        if (role === 'CUSTOMER') {
            isAuthorized = userId === customerId;
        } else if (role === 'TECHNICIAN') {
            isAuthorized = userId === technicianId;
        }
        console.log(isAuthorized);
        
        return {
            isAuthorized,
            error: isAuthorized ? null : 'Bạn không có quyền vào trang này ',
        };
    } catch (error) {
        return {
            
            isAuthorized: false,
            error: error.message || 'Không thể lấy thông tin ',
        };
    }
};


export const checkOutCustomerAccess = async (dispatch, bookingId, userId) => {
    try {
        // Ensure bookingId and userId are provided
        if (!bookingId || !userId) {
            return {
                isAuthorized: false,
                error: 'Thiếu ID đơn hoặc ID người dùng ',
            };
        }

        // Fetch booking data
        const result = await dispatch(fetchBookingById(bookingId)).unwrap();
        const booking = result;

        // Extract customerId and technicianId (handle both populated objects and ObjectId strings)
        const customerId = booking.customerId?._id || booking.customerId;

        // Check if the user is the customer or technician
        const isAuthorized = userId === customerId

        return {
            isAuthorized,
            error: isAuthorized ? null : 'Bạn không có quyền vào trang này ',
        };
    } catch (error) {
        return {
            isAuthorized: false,
            error: error.message || 'Không thể lấy thông tin ',
        };
    }
};