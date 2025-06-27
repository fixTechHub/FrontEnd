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

export const getJobDetails = async (technicianId, bookingId) => {
  const response = await apiClient.get(`/technicians/${technicianId}/bookings/${bookingId}`);
  console.log("📦 Dữ liệu trả về:", response.data);
  return response.data;
};

export const getTechnicianJob = async (technicianId) => {
  console.log('✅ Gọi API với technicianId:', technicianId);
  const response = await apiClient.get(`/technicians/${technicianId}/bookings`);
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

export const getTechnicians = async () => {
  const response = await apiClient.get(`/technicians/`);
};

export const completeTechnicianProfile = async (technicianData) => {
  const response = await apiClient.post('/technicians/complete-profile', technicianData);
  return response.data;
};

export const fetchCertificatesByTechnicianId = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}/certificates`);
  return response.data.certificates;
};

