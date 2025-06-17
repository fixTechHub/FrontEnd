import apiClient from '../../services/apiClient';
import axios from 'axios';

const handleError = (error) => {
    if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
        }
    throw error;
};  

const authAPI = {
    checkAuth: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', {
                ...userData,
                sessionType: 'temporary'
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await apiClient.post('/auth/google-login', { 
                access_token: accessToken,
                sessionType: 'temporary'
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    completeRegistration: async (role) => {
        try {
            const response = await apiClient.post('/auth/complete-registration', { role });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            throw handleError(error);
        }
    },

    verifyEmail: async (code) => {
        try {
            const response = await apiClient.post('/auth/verify-email', { 
                code,
                sessionType: 'temporary'
            });
            await authAPI.logout();
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    verifyOTP: async (otp) => {
        try {
            const response = await apiClient.post('/auth/verify-otp', { 
                otp,
                sessionType: 'temporary'
            });
            await authAPI.logout();
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    resendEmailCode: async () => {
        try {
            const response = await apiClient.post('/auth/resend-email-code', {
                sessionType: 'temporary'
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    resendOTP: async () => {
        try {
            const response = await apiClient.post('/auth/resend-otp', {
                sessionType: 'temporary'
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    forgotPassword: async (emailOrPhone) => {
        try {
            const response = await apiClient.post('/auth/forgot-password', { emailOrPhone });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await apiClient.post('/auth/reset-password', { 
                token, 
                newPassword 
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
      },

    getUserProfile: async () => {
        try {
            const response = await apiClient.get('/users/profile');
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    updateUserProfile: async (userData) => {
        try {
            const response = await apiClient.put('/users/profile', userData);
            return response.data.user || response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    updateAvatar: async (formData) => {
        try {
            const response = await apiClient.put('/users/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.user || response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
};

export default authAPI;
