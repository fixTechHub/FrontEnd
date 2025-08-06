import { fetchBookingById } from '../features/bookings/bookingSlice';
import { getWarrantyInformationThunk } from "../features/booking-warranty/warrantySlice";

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
            // Kiểm tra xem thợ này có phải là thợ được assign cho booking không
            // Hoặc booking đang ở trạng thái có thể nhận (chưa có thợ nào được assign)
            const isAssignedTechnician = userId === technicianId || 
                                       (booking.technicianId && booking.technicianId.userId && userId === booking.technicianId.userId._id);
            const canAcceptBooking = (booking.status === 'AWAITING_CONFIRM' && !booking.technicianId) ||
                                   (booking.status === 'PENDING' && !booking.technicianId);
            
            isAuthorized = isAssignedTechnician || canAcceptBooking;
            
            // console.log('--- CHECK ACCESS DEBUG ---');
            // console.log('userId:', userId);
            // console.log('technicianId:', technicianId);
            // console.log('booking.status:', booking.status);
            // console.log('booking.technicianId:', booking.technicianId);
            // console.log('booking.technicianId.userId:', booking.technicianId?.userId);
            // console.log('isAssignedTechnician:', isAssignedTechnician);
            // console.log('canAcceptBooking:', canAcceptBooking);
            // console.log('isAuthorized:', isAuthorized);
        }
        // console.log(isAuthorized);
        
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

export const checkBookingWarrantyAccess = async (dispatch, bookingWarrantyId, userId, role) => {
    try {
        // Ensure bookingId and userId are provided
        if (!bookingWarrantyId || !userId) {
            return {
                isAuthorized: false,
                error: 'Thiếu ID đơn hoặc ID người dùng ',
            };
        }

        // Fetch booking data
        const bookingWarranty = await dispatch(getWarrantyInformationThunk(bookingWarrantyId)).unwrap();
        
        // Extract customerId and technicianId (handle both populated objects and ObjectId strings)
        const customerId = bookingWarranty.customerId?._id 
        const technicianId = bookingWarranty.technicianId?.userId?._id 
    
        let isAuthorized = false;
    
        if (role === 'CUSTOMER') {
            isAuthorized = userId === customerId;
         
        } else if (role === 'TECHNICIAN') {
            isAuthorized = userId === technicianId;

        }
        if (new Date(bookingWarranty.expireAt) < new Date() && bookingWarranty?.status==='PENDING'){
            isAuthorized = false
        }
        return {
            isAuthorized,
            error: isAuthorized ? null : 'Bạn không có quyền vào trang này ',
        };
    } catch (error) {
        return {
            
            isAuthorized: false,
            error: error 
            // || 'Không thể lấy thông tin ',
        };
    }
};
