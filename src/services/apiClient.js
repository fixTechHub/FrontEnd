import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // nếu dùng cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});



export default apiClient;
