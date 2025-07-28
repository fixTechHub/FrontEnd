import apiClient from '../../services/apiClient';

export const getAllCommissionConfigs = async () => {
  const response = await apiClient.get('/commissions-config');
  return response.data;
};

export const addCommissionConfig = async (configData) => {
  const response = await apiClient.post('/commissions-config', configData);
  return response.data;
};
