import apiClient from '../../services/apiClient';

export const requestWarranty = (formData) => apiClient.post('/warranties', formData);


export const getWarrantyInformation = async (bookingWarrantyId) => apiClient.get(`/warranties/${bookingWarrantyId}`);

export const acceptWarranty = (bookingWarrantyId, status) => apiClient.patch(`/warranties/accept/${bookingWarrantyId}`, { status });

export const rejectWarranty = (bookingWarrantyId, formData) => apiClient.patch(`/warranties/deny/${bookingWarrantyId}`, formData);
export const confirmWarranty = (bookingWarrantyId, formData) => apiClient.patch(`/warranties/confirm/${bookingWarrantyId}`, formData);