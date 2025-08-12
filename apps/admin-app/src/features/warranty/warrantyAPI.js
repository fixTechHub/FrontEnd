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
    // data: { status } - IsReviewedByAdmin sẽ tự động được set thành true
    return await ApiBE.put(`/Warranty/status/${id}`, data);
  },
  updateDetails: async (id, data) => {
    // data: { status, resolutionNote?, rejectionReason? } - IsReviewedByAdmin sẽ tự động được set thành true
    const res = await ApiBE.put(`/Warranty/details/${id}`, data);
    return res.data;
  },
}; 