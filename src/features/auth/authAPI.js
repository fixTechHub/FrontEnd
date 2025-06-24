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

    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    // New API function for the final registration step
    finalizeRegistration: async (registrationData) => {
        try {
            const response = await apiClient.post('/auth/finalize-registration', registrationData);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    googleLogin: async (accessToken) => {
        try {
            const response = await apiClient.post('/auth/google-login', { 
                access_token: accessToken
            });
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

    verifyEmail: async (code, registrationToken) => {
        try {
            const response = await apiClient.post('/auth/verify-email', { 
                code,
                registrationToken
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    verifyOTP: async (otp) => {
        try {
            const response = await apiClient.post('/auth/verify-otp', { 
                otp
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    resendEmailCode: async (registrationToken) => {
        try {
            const response = await apiClient.post('/auth/resend-email-code', {
                registrationToken
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    resendOTP: async () => {
        try {
            const response = await apiClient.post('/auth/resend-otp');
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
            const response = await apiClient.patch('/users/profile', userData);
            return response.data.user || response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    updateAvatar: async (formData) => {
        try {
            const response = await apiClient.patch('/users/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.user || response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    deactivateAccount: async (password) => {
        try {
            const response = await apiClient.post('/users/deactivate-account', { password });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    requestDeactivateVerification: async (verificationMethod) => {
        try {
            const response = await apiClient.post('/auth/request-deactivate-verification', {
                verificationMethod
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    verifyDeactivateAccount: async (otp) => {
        try {
            const response = await apiClient.post('/users/verify-deactivate-account', { otp });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    deleteAccount: async () => {
        try {
            const response = await apiClient.delete('/users/profile');
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    requestPhoneChange: async (newPhone) => {
        try {
            const response = await apiClient.post('/users/request-phone-change', { newPhone });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    verifyPhoneChange: async (otp, newPhone) => {
        try {
            const response = await apiClient.post('/users/verify-phone-change', { otp, newPhone });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    checkExist: async (emailOrPhone) => {
        try {
            const response = await apiClient.post('/auth/check-exist', { emailOrPhone });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },

    requestDeleteVerification: async (verificationMethod) => {
        try {
            const response = await apiClient.post('/auth/request-delete-verification', {
                verificationMethod
            });
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
};

// Delete Account APIs
export const requestDeleteVerificationAPI = async (method) => {
    try {
        const response = await apiClient.post('/users/delete-account/request-verification', { method });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const verifyDeleteOTPAPI = async (otp) => {
    try {
        const response = await apiClient.post('/users/delete-account/verify-otp', { otp });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const deleteAccountAPI = async (password, confirmText) => {
    try {
        const response = await apiClient.post('/users/delete-account/confirm', { password, confirmText });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export default authAPI;
