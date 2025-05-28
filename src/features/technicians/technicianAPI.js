import apiClient from '../../services/apiClient';

export const fetchTechnicians = async () => {
  return apiClient.get('/technicians');
};