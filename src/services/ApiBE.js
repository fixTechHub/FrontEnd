import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7260/api',
  // withCredentials: true, // bật nếu bạn dùng Cookie Auth (ví dụ với Identity)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;