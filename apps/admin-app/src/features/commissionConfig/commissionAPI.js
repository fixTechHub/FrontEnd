import ApiBE from '../../services/ApiBE';

export const commissionConfigAPI = {
  // Lấy tất cả commission config
  getAll: async () => {
    const res = await ApiBE.get('/CommissionConfig');
    return res.data;
  },
  // Lấy commission config theo id
  getById: async (id) => {
    const res = await ApiBE.get(`/CommissionConfig/${id}`);
    return res.data;
  },
  // Tạo mới commission config
  create: async (data) => {
    const res = await ApiBE.post('/CommissionConfig', data);
    return res.data;
  },
  // Cập nhật commission config
  update: async (id, data) => {
    const res = await ApiBE.put(`/CommissionConfig/${id}`, data);
    return res.data;
  },
  // Xóa commission config
  delete: async (id) => {
    const res = await ApiBE.delete(`/CommissionConfig/${id}`);
    return res.data;
  },
  // Lấy danh sách commission config đã xóa
  getDeleted: async () => {
    const res = await ApiBE.get('/CommissionConfig/deleted');
    return res.data;
  },
  // Khôi phục commission config
  restore: async (id) => {
    const res = await ApiBE.post(`/CommissionConfig/${id}/restore`);
    return res.data;
  },
}; 