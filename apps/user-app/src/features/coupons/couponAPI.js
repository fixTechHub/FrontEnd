import apiClient from '../../services/apiClient';

export const getUserCoupons = () => apiClient.get('/coupons/user');
