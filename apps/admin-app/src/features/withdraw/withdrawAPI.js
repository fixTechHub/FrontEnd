// src/features/withdraws/withdrawAPI.js
import apiClient from '../../services/apiClient';

// POST /withdraws  (body: { page, limit, status, search })
export const fetchWithdrawLogs = async (params = {}) => {
  const res = await apiClient.post('/admin/withdraws', params);
  return res.data; // { items, page, limit, total, totalPages }
};

// POST /withdraws/:logId/approve
export const approveWithdraw = async (logId) => {
  const res = await apiClient.post(`/admin/withdraws/${logId}/approve`);
  return res.data; // { message, technicianBalance, log }
};
