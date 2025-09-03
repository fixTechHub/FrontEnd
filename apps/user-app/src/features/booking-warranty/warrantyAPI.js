import apiClient from '../../services/apiClient';

export const requestWarranty = (formData) => apiClient.post('/warranties', formData);


export const getWarrantyInformation = async (bookingWarrantyId) => apiClient.get(`/warranties/${bookingWarrantyId}`);

export const acceptWarranty = (bookingWarrantyId, status) => apiClient.patch(`/warranties/accept/${bookingWarrantyId}`, { status });

export const rejectWarranty = (bookingWarrantyId, formData) => apiClient.patch(`/warranties/deny/${bookingWarrantyId}`, formData);
export const confirmWarranty = (bookingWarrantyId, formData) => apiClient.patch(`/warranties/confirm/${bookingWarrantyId}`, formData);

export const fetchWarrantiesOfTechApi = async ({ technicianId, page = 1, limit = 10 } = {}) => {
  if (!technicianId) throw new Error("Missing technicianId");
  const res = await apiClient.get(`/warranties/tech/${technicianId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const proposeWarrantySchedule = (bookingWarrantyId, proposedSchedule) =>
    apiClient.post(`/warranties/propose-schedule/${bookingWarrantyId}`, { proposedSchedule });

export const confirmWarrantySchedule = (bookingWarrantyId, data) =>
    apiClient.post(`/warranties/confirm-schedule/${bookingWarrantyId}`, data);