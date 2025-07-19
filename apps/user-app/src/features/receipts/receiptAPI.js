import apiClient from '../../services/apiClient';

export const getUserReceipts = async (
  limit,
  skip,
  searchTerm,
  paymentMethod,
  dateFilter,
  customStartDate,
  customEndDate
) => {
  let url = `/receipts?limit=${limit}&skip=${skip}`;

  if (searchTerm) {
    url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
  }
  if (paymentMethod) {
    url += `&paymentMethod=${encodeURIComponent(paymentMethod)}`;
  }
  if (dateFilter) {
    url += `&dateFilter=${encodeURIComponent(dateFilter)}`;
  }
  if (customStartDate) {
    url += `&customStartDate=${encodeURIComponent(customStartDate)}`;
  }
  if (customEndDate) {
    url += `&customEndDate=${encodeURIComponent(customEndDate)}`;
  }

  return apiClient.get(url);
};