import apiClient from '../../services/apiClient';

// 📌 Lấy tất cả gói dịch vụ
export const getAllPackages = async () => apiClient.get('/packages');

// 📌 Tạo gói dịch vụ mới
export const createPackage = async (payload) => apiClient.post('/packages', payload);
// payload = { name, price, description, benefits, isActive }

// 📌 Cập nhật gói
export const updatePackage = async (id, payload) => {
  console.log("📡 Gọi API updatePackage với id:", id, payload);
  return apiClient.put(`/packages/${id}`, payload);
};


// 📌 Xóa gói
export const deletePackage = async (id) => apiClient.delete(`/packages/${id}`);

// 📌 Bật/Tắt gói (toggle isActive)
export const togglePackage = async (id) => apiClient.patch(`/packages/${id}/toggle`);