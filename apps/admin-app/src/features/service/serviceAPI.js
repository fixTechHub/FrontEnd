import ApiBE from '../../services/ApiBE';

export const serviceAPI = {
  // Lấy tất cả service
  getAll: async () => {
    try {
      const res = await ApiBE.get('/Service');
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  // Lấy service theo id
  getById: async (id) => {
    try {
      const res = await ApiBE.get(`/Service/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  // Tạo mới service
  create: async (data) => {
    const res = await ApiBE.post('/Service', data);
    return res.data;
  },
  // Cập nhật service
  update: async (id, data) => {
    const res = await ApiBE.put(`/Service/${id}`, data);
    return res.data;
  },
  // Xóa service
  delete: async (id) => {
    const res = await ApiBE.delete(`/Service/${id}`);
    return res.data;
  },
  // Lấy danh sách service đã xóa
  getDeleted: async () => {
    const res = await ApiBE.get('/Service/deleted');
    return res.data;
  },
  // Khôi phục service
  restore: async (id) => {
    const res = await ApiBE.post(`/Service/${id}/restore`);
    return res.data;
  },
}; 