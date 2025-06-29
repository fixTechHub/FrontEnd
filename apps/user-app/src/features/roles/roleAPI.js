import apiClient from '../../services/apiClient';

// Lấy danh sách tất cả các role từ Back-end
export const getRoles = () => apiClient.get('/roles'); 