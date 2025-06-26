import apiClient from '../../services/apiClient';

export const receiptAPI = {
    getUserReceipts: () => {
      return apiClient.get('/receipts');
    },
   
  };