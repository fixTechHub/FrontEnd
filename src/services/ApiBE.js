import axios from 'axios';

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // For production build, use the environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For development, use the deployed backend on Render
  return 'https://backend-dotnet.onrender.com/api';
};

// Try HTTPS first, fallback to HTTP if HTTPS fails
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  // withCredentials: true, // bật nếu bạn dùng Cookie Auth (ví dụ với Identity)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 seconds timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default apiClient;