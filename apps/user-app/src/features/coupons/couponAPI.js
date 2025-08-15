import apiClient from '../../services/apiClient';

export const getUserCoupons = (userId) => apiClient.get(`/coupons/user?userId=${userId}`);
