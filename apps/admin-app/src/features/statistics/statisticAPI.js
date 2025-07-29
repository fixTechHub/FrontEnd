import apiClient from '../../services/ApiBE';

export const fetchMonthlyRevenue = async (year, month) => {
  const response = await apiClient.get(`/Dashboard/revenue?year=${year}&month=${month}`);
  return response.data;
};
