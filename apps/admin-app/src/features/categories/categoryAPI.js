import ApiBE from '../../services/ApiBE';

export const categoryAPI = {
  // Lấy tất cả category
  getAll: async () => {
    const res = await ApiBE.get('/Category');
    return res.data;
  },
  // Lấy category theo id
  getById: async (id) => {
    const res = await ApiBE.get(`/Category/${id}`);
    return res.data;
  },
  // Tạo mới category
  create: async (data) => {
    const res = await ApiBE.post('/Category', data);
    return res.data;
  },
  // Cập nhật category
  update: async (id, data) => {
    const res = await ApiBE.put(`/Category/${id}`, data);
    return res.data;
  },
  // Xóa category
  delete: async (id) => {
    const res = await ApiBE.delete(`/Category/${id}`);
    return res.data;
  },
}; 