import apiClient from '../../services/apiClient';

export const notificationAPI = {
  getUserNotifications: () => {
    return apiClient.get('/notifications');
  },
  markAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
};
