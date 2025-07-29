import axios from 'axios';

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // LUÔN LUÔN sử dụng URL của Render để đảm bảo kết nối
  return 'https://backend-dotnet.onrender.com/api';
};

// Try HTTPS first, fallback to HTTP if HTTPS fails
const ApiBE = axios.create({
  baseURL: getApiBaseUrl(),
  // withCredentials: true, // bật nếu bạn dùng Cookie Auth (ví dụ với Identity)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds timeout
});

// Add request interceptor for debugging
ApiBE.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
ApiBE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default ApiBE;