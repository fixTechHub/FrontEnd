import apiClient from '../../services/apiClient';

export const notificationAPI = {
  getUserNotifications: () => {
    return apiClient.get('/notifications');
  },
  markAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
  clearAllNotifications: () => {
    return apiClient.delete('/notifications/clear');
  },
  getAllUserNotifications: (params = {}) => {
    return apiClient.get('/notifications/all', { params });
  },
};