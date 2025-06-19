import apiClient from '../../services/apiClient';

export const FETCH_AVAILABILITY_SUCCESS = 'FETCH_AVAILABILITY_SUCCESS';
export const FETCH_AVAILABILITY_ERROR = 'FETCH_AVAILABILITY_ERROR';

// export const fetchTechnicians = async () => {
//   return apiClient.get('/technicians');
export const getTechnicianProfile = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}`);
  return response.data
}

export const getEarningAndCommission = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}/earnings`);
  console.log("📦 Dữ liệu trả về:", response.data);
  return response.data;
};


export const getTechnicianAvailability = async (technicianId, status) => {
  const response = await apiClient.get(`/technicians/${technicianId}/availability`, {
    availability: status,
  });
  return response.data.availability;
};

export const updateTechnicianAvailability = async (technicianId, status) => {
  const response = await apiClient.put(`/technicians/${technicianId}/availability`, {
    availability: status,
  });
  return response.data.availability;
};