import apiClient from '../../services/apiClient';
export const sendNotifications = async (notifyData) => {
    const response = await apiClient.post(`/notifications/`,notifyData);
    return response.data;
};


export const notificationAPI = {
    getUserNotifications: (adminId) => {
      return apiClient.get(`/notifications/admin/${adminId}`);
    },
    markAsRead: (id) => {
      return apiClient.patch(`/notifications/${id}/read/admin`);
    },
    clearAllNotifications: (adminId) => {
      return apiClient.delete(`/notifications/clear/admin/${adminId}`);
    },
    getAllUserNotifications: (params = {}) => {
      return apiClient.get('/notifications/all/admin', { params });
    },
  };