import apiClient from '../../services/apiClient';

export const submitFeedback = async (bookingId, formData) => {
  const response = await apiClient.post(`/feedbacks/${bookingId}`, formData);
  return response.data;
};

export const submitFeedbackReply = async (feedbackId, reply) => {
  const res = await apiClient.put(`/feedbacks/${feedbackId}/reply`, { reply });
  return res.data;
};

/**
 * Helper: build FormData từ dữ liệu form (rating, content, images[])
 * - images: Array<File | Blob | string(URL)>
 * - Nếu bạn đã tự tạo FormData ở nơi khác thì không cần dùng helper này.
 */
export const buildFeedbackFormData = ({ rating, content, images = [] }) => {
  const fd = new FormData();
  if (rating != null) fd.append('rating', String(rating));
  if (content) fd.append('content', content);
  // gửi nhiều ảnh
  images.forEach((img) => fd.append('images', img));
  return fd;
};

/**
 * Lấy danh sách feedback theo technician với filter từ form
 * params:
 *  - page, limit
 *  - rating: 1..5 (optional)
 *  - sort: 'recent' | 'rating_desc' | 'rating_asc' (optional)
 *  - from, to: ISO date string 'YYYY-MM-DD' (optional)
 *  - visible: true/false (optional, mặc định true)
 */
export const getFeedbacksByTechnician = async (
  technicianId,
  params = {}
) => {
  const {
    page = 1,
    limit = 10,
    rating,
    sort = 'recent',
    from,
    to,
    visible, // optional
  } = params;

  const res = await apiClient.get(`/feedbacks/by-technician/${technicianId}`, {
    params: {
      page,
      limit,
      ...(rating ? { rating } : {}),
      ...(sort ? { sort } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(visible !== undefined ? { visible } : {}),
    },
  });
  return res.data; // { page, limit, total, totalPages, items }
};

/**
 * Lấy thống kê sao: averageRating, total, distribution{1..5}
 */
export const getFeedbackStatsByTechnician = async (technicianId) => {
  const res = await apiClient.get(
    `/feedbacks/by-technician/${technicianId}/stats`
  );
  return res.data; // { averageRating, total, distribution }
};
