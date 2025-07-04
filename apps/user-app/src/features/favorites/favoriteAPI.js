import apiClient from '../../services/apiClient';

export const fetchFavorites = async () => {
  const res = await apiClient.get('/favorites');
  return res.data;
};

export const addFavorite = async (technicianId) => {
  const res = await apiClient.post('/favorites', { technicianId });
  return res.data;
};

export const removeFavorite = async (technicianId) => {
  const res = await apiClient.delete(`/favorites/${technicianId}`);
  return res.data;
}; 