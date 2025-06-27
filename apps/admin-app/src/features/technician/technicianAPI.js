import apiClient from '../../services/apiClient';


export const getTechnicianDepositLogs = async () => {
    const response = await apiClient.get(`/technicians/technician-deposit`);
    return response;
  };