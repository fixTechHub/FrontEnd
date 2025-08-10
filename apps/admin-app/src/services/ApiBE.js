import axios from 'axios';

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // LUÔN LUÔN sử dụng URL của Render để đảm bảo kết nối
  return 'https://backend-dotnet.onrender.com/api/';
};

// Create API client
const ApiBE = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout for slow backend
});

// Always send credentials (cookies) with requests
ApiBE.defaults.withCredentials = true;

// Add request interceptor for JWT token
ApiBE.interceptors.request.use(
  (config) => {
    // Với HttpOnly cookie, không đọc được token từ JS -> rely on cookies via withCredentials
    // Nếu backend cũng hỗ trợ header Bearer ngoài cookie, có thể lấy từ cookie không HttpOnly
    const token = getCookie('AuthToken') || getCookie('token') || getCookie('jwt_token');
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
      try {
        const isLoginPage = window.location.pathname === '/login';
        const reqUrl = error?.config?.url || '';
        // Đừng redirect nếu là bất kỳ endpoint dưới /auth/* để UI xử lý lỗi (hỗ trợ cả 'auth/...')
        const isAuthEndpoint = (/\/auth\//i.test(reqUrl)) || reqUrl.startsWith('auth/');
        if (!isLoginPage && !isAuthEndpoint) {
          window.location.replace('/login');
        }
      } catch (_) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default ApiBE;