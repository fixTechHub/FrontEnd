import ApiBE from '../../services/ApiBE';

export const couponAPI = {
    // Get all coupons
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Coupon');
            return response.data;
        } catch (error) {
            console.error('Get all coupons error:', error);
            throw error;
        }
    },

    // Get coupon by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/Coupon/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get coupon by ID error:', error);
            throw error;
        }
    },

    // Create new coupon
    create: async (couponData) => {
        try {
            const response = await ApiBE.post('/Coupon', couponData);
            return response.data;
        } catch (error) {
            console.error('Create coupon error:', error);
            throw error;
        }
    },

    // Update coupon
    update: async (id, couponData) => {
        try {
            console.log('Sending update request with data:', {
                id,
                couponData,
                url: `/Coupon/${id}`,
                method: 'PUT'
            });
            const response = await ApiBE.put(`/Coupon/${id}`, couponData);
            return response.data;
        } catch (error) {
            console.error('Update coupon error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                requestData: {
                    id,
                    couponData
                }
            });
            throw error;
        }
    },

    // Delete coupon
    delete: async (id) => {
        try {
            const response = await ApiBE.delete(`/Coupon/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete coupon error:', error);
            throw error;
        }
    },

    // Lấy danh sách coupon đã xóa
    getDeleted: async () => {
        const response = await ApiBE.get('/Coupon/deleted');
        return response.data;
    },

    // Khôi phục coupon đã xóa
    restore: async (id) => {
        const response = await ApiBE.post(`/Coupon/${id}/restore`);
        return response.data;
    }
}; 