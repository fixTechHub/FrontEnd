import apiClient from '../../services/apiClient';

// Submit a new system report
export const submitSystemReport = async (data) => {
  const response = await apiClient.post('/system-reports', data);
  return response.data;
};

// Get user's submitted system reports (optional)
export const getMySystemReports = async (params = {}) => {
  const response = await apiClient.get('/system-reports', { params });
  return response.data;
};

// Get detail
export const getSystemReportById = async (id) => {
  const response = await apiClient.get(`/system-reports/${id}`);
  return response.data;
};
