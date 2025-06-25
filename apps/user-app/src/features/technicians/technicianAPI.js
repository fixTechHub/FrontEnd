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