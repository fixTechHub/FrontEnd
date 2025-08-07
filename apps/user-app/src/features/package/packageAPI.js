import apiClient from '../../services/apiClient';

export const fetchAllPackages = () => {
  return apiClient.get("/subscriptions/packages");
};

// 📌 Lấy gói đăng ký hiện tại của kỹ thuật viên
export const getCurrentSubscription = (technicianId) => {
  return apiClient.get(`/subscriptions/${technicianId}/current`);
};
