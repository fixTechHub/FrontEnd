import apiClient from '../../services/apiClient';

// export const submitFeedback = async (bookingId, feedbackData) => {
//   const response = await apiClient.post(`/feedbacks/${bookingId}`, feedbackData);
//   console.log('SUBMIT FEEDBACK RESPONSE:', response.data);
//   return response.data;
// };

export const submitFeedback = async (bookingId, formData) => {
  const response = await apiClient.post(`/feedbacks/${bookingId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // 💥 PHẢI có dòng này
    },
  });
  return response.data;
};