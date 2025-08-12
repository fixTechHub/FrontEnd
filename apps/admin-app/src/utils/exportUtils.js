// Utility function để tạo export data cho các trang management
export const createExportData = (data, columns, fileName, sheetName) => {
  // Set vào window object để AdminHeader có thể truy cập
  window.currentPageExportData = {
    data: data,
    columns: columns,
    fileName: fileName,
    sheetName: sheetName
  };
};

// Helper function để format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

// Helper function để format datetime
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};

// Helper function để format currency
export const formatCurrency = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper function để format status
export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').toUpperCase();
}; 