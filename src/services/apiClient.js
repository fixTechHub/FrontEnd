import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Enable cookies
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // If the request has sessionType in the body, add it as a header
    if (config.data && config.data.sessionType) {
      config.headers['x-session-type'] = config.data.sessionType;
      // Remove it from the request body
      delete config.data.sessionType;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the calling code handle the error
    return Promise.reject(error);
  }
);

export default apiClient;
