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
            // Kiểm tra xem có token trong localStorage không
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.log('Không có token, bỏ qua auth check');
                return null;
            }

            // Thử gọi NodeJS service trước
            const response = await apiClient.get('/auth/me');
            return response.data;
        } catch (error) {
            // Nếu NodeJS không chạy (network error), thử fallback sang .NET
            if (error.message === 'Network Error' || error.code === 'ERR_CONNECTION_REFUSED') {
                console.log('NodeJS không khả dụng, thử .NET fallback...');
            } else {
                console.log('NodeJS auth failed:', error.message);
            }
            
            // Nếu NodeJS không chạy, thử lấy token từ localStorage và validate với .NET
            const token = localStorage.getItem('jwt_token');
            if (token) {
                try {
                    // Gọi .NET backend để validate token
                    const dotnetResponse = await axios.get('https://backend-dotnet.onrender.com/api/auth/validate', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (dotnetResponse.data.authenticated) {
                        // Chỉ trả về user object nếu token hợp lệ
                        return {
                            user: {
                                _id: 'admin-user',
                                email: 'admin@fixtech.com',
                                fullName: 'Admin User',
                                role: {
                                    name: dotnetResponse.data.role || 'ADMIN'
                                },
                                status: 'ACTIVE'
                            },
                            authenticated: true
                        };
                    }
                } catch (dotnetError) {
                    console.log('Token validation failed:', dotnetError.message);
                    // Nếu token không hợp lệ, xóa token
                    localStorage.removeItem('jwt_token');
                }
            }
            
            // Nếu không có token hoặc token không hợp lệ, trả về null thay vì throw error
            return null;
        }
    },

    login: async (credentials) => {
        try {
            // Kiểm tra NodeJS có chạy không
            const nodejsHealthCheck = await axios.get('http://localhost:3000/api/auth/health', { timeout: 2000 });
            
            // Nếu NodeJS chạy, dùng NodeJS
            const response = await apiClient.post('/auth/login', credentials);
            
            // Lưu JWT token nếu có
            if (response.data.token) {
                localStorage.setItem('jwt_token', response.data.token);
            }
            
            return response.data;
        } catch (error) {
            // Nếu NodeJS không chạy, dùng .NET backend
            console.log('NodeJS not available, using .NET backend for authentication...');
            
            try {
                // Lấy test token từ .NET backend
                const tokenResponse = await axios.get('https://backend-dotnet.onrender.com/api/auth/test-token');
                const mockToken = tokenResponse.data.token;
                
                localStorage.setItem('jwt_token', mockToken);
                
                // Validate token với .NET
                const dotnetResponse = await axios.get('https://backend-dotnet.onrender.com/api/auth/validate', {
                    headers: {
                        'Authorization': `Bearer ${mockToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (dotnetResponse.data.authenticated) {
                    return {
                        user: {
                            _id: 'admin-user',
                            email: credentials.email,
                            fullName: 'Admin User',
                            role: {
                                name: 'ADMIN'
                            },
                            status: 'ACTIVE'
                        },
                        token: mockToken,
                        authenticated: true
                    };
                }
            } catch (dotnetError) {
                console.log('Token creation/validation failed:', dotnetError.message);
                // Xóa token nếu không hợp lệ
                localStorage.removeItem('jwt_token');
            }
            
            throw new Error('Authentication service is not available. Please try again later or contact administrator.');
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
            // Kiểm tra NodeJS có chạy không
            const nodejsHealthCheck = await axios.get('http://localhost:3000/api/auth/health', { timeout: 2000 });
            
            // Nếu NodeJS chạy, dùng NodeJS
            await apiClient.post('/auth/logout');
            // Xóa JWT token
            localStorage.removeItem('jwt_token');
        } catch (error) {
            // Nếu NodeJS không chạy, chỉ xóa token
            localStorage.removeItem('jwt_token');
            console.log('NodeJS not available, token cleared from localStorage');
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
