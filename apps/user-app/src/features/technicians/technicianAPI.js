import apiClient from '../../services/apiClient';
export const FETCH_AVAILABILITY_SUCCESS = 'FETCH_AVAILABILITY_SUCCESS';
export const FETCH_AVAILABILITY_ERROR = 'FETCH_AVAILABILITY_ERROR';

// export const fetchTechnicians = async () => {
//   return apiClient.get('/technicians');
export const getTechnicianProfile = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}`);
  console.log('GET TECHNICIAN PROFILE RESPONSE:', response.data);
  return response.data;
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
  const response = await apiClient.get(`/technicians/${technicianId}/bookings`);
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
  try {
    const response = await apiClient.post('/technicians/complete-profile', technicianData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCertificatesByTechnicianId = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}/certificates`);
  return response.data.certificates;
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

export const getListFeedback = async (technicianData,technicianId) => {
  const response = await apiClient.get(`/feedbacks/${technicianId}`, technicianData);
  console.log(response);
  
  return response.data.data;
};

export const uploadCertificateAPI = async (formData, technicianId) => {
  const response = await apiClient.post(`/certificates/${technicianId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCertificateAPI = async (certificateId) => {
  const res = await apiClient.delete(`/certificates/${certificateId}`);
  return res.data; // { message: 'Certificate deleted successfully' }
};

export const getScheduleByTechnicianId = async (technicianId) => {
  const response = await apiClient.get(`/technicians/${technicianId}/schedules`);
  return response.data;
};