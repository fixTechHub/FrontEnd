import ApiBE from '../../services/ApiBE';

export const financialReportAPI = {
  // Lấy tổng quan tài chính
  getFinancialSummary: async () => {
    const response = await ApiBE.get('/FinancialReport/summary');
    return response.data.data || response.data;
  },

  // Lấy danh sách booking tài chính
  getAllBookingsFinancial: async () => {
    const response = await ApiBE.get('/FinancialReport/bookings');
    return response.data.data || response.data;
  },

  // Lấy danh sách technician tổng hợp
  getAllTechniciansFinancialSummary: async () => {
    const response = await ApiBE.get('/FinancialReport/technicians/summary');
    return response.data.data || response.data;
  },

  // Lấy chi tiết technician
  getTechnicianFinancialDetails: async (technicianId) => {
    const response = await ApiBE.get(`/FinancialReport/technicians/${technicianId}/details`);
    return response.data.data || response.data;
  },

  // Lấy booking của technician
  getBookingsByTechnicianId: async (technicianId) => {
    const response = await ApiBE.get(`/FinancialReport/technicians/${technicianId}/bookings`);
    return response.data.data || response.data;
  },

  // Lấy tổng doanh thu
  getTotalRevenue: async () => {
    const response = await ApiBE.get('/FinancialReport/total-revenue');
    return response.data.data || response.data;
  },

  // Lấy tổng số tiền đang giữ
  getTotalHoldingAmount: async () => {
    const response = await ApiBE.get('/FinancialReport/total-holding-amount');
    return response.data.data || response.data;
  },

  // Lấy tổng số tiền hoa hồng
  getTotalCommissionAmount: async () => {
    const response = await ApiBE.get('/FinancialReport/total-commission-amount');
    return response.data.data || response.data;
  },

  // Lấy tổng thu nhập technician
  getTotalTechnicianEarning: async () => {
    const response = await ApiBE.get('/FinancialReport/total-technician-earning');
    return response.data.data || response.data;
  },

  // Lấy tổng số tiền đã rút
  getTotalWithdrawn: async () => {
    const response = await ApiBE.get('/FinancialReport/total-withdrawn');
    return response.data.data || response.data;
  }
}; 