import apiClient from '../../services/apiClient';
export const sendNotifications = async (notifyData) => {
    const response = await apiClient.post(`/notifications/`,notifyData);
    return response.data;
};

