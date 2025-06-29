import apiClient from '../../services/apiClient';

// export const fetchTechnicians = async () => {
//   return apiClient.get('/technicians');
export const getTechnicianProfile = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}`);
  return response.data;
};
export const getTechnicians = async () => {
  const response = await apiClient.get(`/technicians/`);
}
export const completeTechnicianProfile = async (technicianData) => {
  const response = await apiClient.post('/technicians/complete-profile', technicianData);
  return response.data;
};

export const sendQuotationAPI = (formData) => apiClient.post('/technicians/send-quotation', formData);

export const getTechnicianDepositLogs = async ({ limit, skip }) => {
  try {
    const response = await apiClient.get('/technicians/technician-deposit', {
      params: { limit, skip }
    });
    console.log('API Response:', response.data);
    return response;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};