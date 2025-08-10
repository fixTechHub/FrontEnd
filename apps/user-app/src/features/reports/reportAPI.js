import apiClient from '../../services/apiClient';

// Create a new report
export const createReport = async (reportData) => {
  const response = await apiClient.post('/reports', reportData);
  return response.data;
};

// Get report by ID
export const getReportById = async (reportId) => {
  const response = await apiClient.get(`/reports/${reportId}`);
  return response.data;
};

// Get all reports (for admin)
export const getAllReports = async (params = {}) => {
  const response = await apiClient.get('/reports', { params });
  return response.data;
};

// Get user's reports - may be handled by .NET
export const getUserReports = async (params = {}) => {
  const response = await apiClient.get('/reports/user', { params });
  return response.data;
};
