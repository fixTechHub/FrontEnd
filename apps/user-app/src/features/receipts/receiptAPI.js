import apiClient from '../../services/apiClient';

export const getUserReceipts = async ( limit, skip ) => { // Accept params
  return apiClient.get(`/receipts?limit=${limit}&skip=${skip}` ); // Pass params to the API call
}
