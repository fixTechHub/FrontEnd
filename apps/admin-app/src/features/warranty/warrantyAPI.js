import ApiBE from '../../services/ApiBE';

export const warrantyAPI = {
  getAll: async () => {
    const res = await ApiBE.get('/Warranty');
    return res.data;
  },
  getById: async (id) => {
    const res = await ApiBE.get(`/Warranty/${id}`);
    return res.data;
  },
  updateStatus: async (id, data) => {
    // data: { status, isReviewedByAdmin }
    return await ApiBE.put(`/Warranty/status/${id}`, data);
  },
}; 