import apiClient from '../../services/apiClient';

// GET /admin/certificates?page=&limit=&status=&search=
export const fetchAllCertificates = async (params = {}) => {
  const { page = 1, limit = 10, status, search } = params;
  const res = await apiClient.get('/certificates/', {
    params: { page, limit, status, search },
  });
  return res.data; // { message, items, page, limit, total, totalPages }
};

// PUT /admin/certificates/:id/verify
// body: { status: 'APPROVED'|'REJECTED', reason? }
export const verifyCertificate = async ({ id, status, reason }) => {
  const res = await apiClient.patch(`/certificates/${id}/verify`, {
    status,
    reason,
  });
  return res.data; // { message, data }
};
