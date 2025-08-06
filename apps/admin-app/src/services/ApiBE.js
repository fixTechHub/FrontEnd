import axios from 'axios';

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // LUÔN LUÔN sử dụng URL của Render để đảm bảo kết nối
  return 'https://backend-dotnet.onrender.com/api';
};

// Create API client
const ApiBE = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout for slow backend
});

// Add request interceptor for JWT token
ApiBE.interceptors.request.use(
  (config) => {
    // Lấy JWT token từ cookie (NodeJS lưu token trong cookie với tên 'token')
    const token = getCookie('token') || getCookie('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function để đọc cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Add response interceptor for error handling
ApiBE.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors - token expired or invalid
    if (error.response?.status === 401) {
      console.log('Unauthorized access - token may be expired');
      // Có thể redirect đến login page hoặc refresh token
    }
    return Promise.reject(error);
  }
);

export default ApiBE;