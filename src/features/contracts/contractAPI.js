// src/api/contractAPI.js
import apiClient from '../../services/apiClient';

const handleError = (error) => {
    if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
    }
    throw error;
};

const contractAPI = {
    createContract: async (contractData) => {
        try {
            const response = await apiClient.post('/contracts', contractData);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    getContractById: async (id) => {
        try {
            const response = await apiClient.get(`/contracts/${id}`);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    getContractsByTechnicianId: async (technicianId) => {
        try {
            const response = await apiClient.get(`/contracts/technician/${technicianId}`);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },


};

export default contractAPI;
