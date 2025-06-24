// src/api/contractAPI.js
import apiClient from '../../services/apiClient';

const handleError = (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error;
};

export const contractAPI = {
    getContractByTechnicianId: async (technicianId) => {
        try {
            const response = await apiClient.get(`/contracts/technician/${technicianId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
    getContractById: async (contractId) => {
        try {
            const response = await apiClient.get(`/contracts/${contractId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};
