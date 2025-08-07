import apiClient from '../../services/apiClient';

// 📌 Lấy tất cả feedback cho admin (có thể truyền filter)
export const getAllFeedback = (filters = {}) => {
  // Gọi API GET /feedbacks?isVisible=true...
  return apiClient.get('/feedbacks', { params: filters });
};

// 📌 Admin ẩn/hiện feedback kèm lý do
export const moderateFeedback = (feedbackId, data) => {
  // Gọi API PUT /feedbacks/:feedbackId/moderate
  return apiClient.put(`/feedbacks/${feedbackId}/moderate`, data);
};