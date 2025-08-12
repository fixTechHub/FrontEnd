// Helper function để tự động thêm export cho các trang management
export const addExportToManagementPage = (pageName, data, columns, fileName, sheetName) => {
  // Set vào window object để AdminHeader có thể truy cập
  window.currentPageExportData = {
    data: data,
    columns: columns,
    fileName: fileName,
    sheetName: sheetName
  };
};

// Template cho các trang management khác
export const createExportForPage = (pageName, sortedData, additionalData = {}) => {
  const templates = {
    'CouponManagement': {
      columns: [
        { title: 'Coupon Code', dataIndex: 'couponCode' },
        { title: 'Discount Type', dataIndex: 'discountType' },
        { title: 'Discount Value', dataIndex: 'discountValue' },
        { title: 'Min Order Amount', dataIndex: 'minOrderAmount' },
        { title: 'Max Discount Amount', dataIndex: 'maxDiscountAmount' },
        { title: 'Usage Limit', dataIndex: 'usageLimit' },
        { title: 'Used Count', dataIndex: 'usedCount' },
        { title: 'Start Date', dataIndex: 'startDate' },
        { title: 'End Date', dataIndex: 'endDate' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Created At', dataIndex: 'createdAt' },
        { title: 'Updated At', dataIndex: 'updatedAt' },
      ],
      fileName: 'coupons_export',
      sheetName: 'Coupons'
    },
    'CommissionConfigManagement': {
      columns: [
        { title: 'Service Type', dataIndex: 'serviceType' },
        { title: 'Commission Rate', dataIndex: 'commissionRate' },
        { title: 'Min Amount', dataIndex: 'minAmount' },
        { title: 'Max Amount', dataIndex: 'maxAmount' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Created At', dataIndex: 'createdAt' },
        { title: 'Updated At', dataIndex: 'updatedAt' },
      ],
      fileName: 'commission_configs_export',
      sheetName: 'Commission Configs'
    },
    'CouponUsageManagement': {
      columns: [
        { title: 'Coupon Code', dataIndex: 'couponCode' },
        { title: 'User', dataIndex: 'userName' },
        { title: 'Booking', dataIndex: 'bookingCode' },
        { title: 'Discount Applied', dataIndex: 'discountApplied' },
        { title: 'Used At', dataIndex: 'usedAt' },
      ],
      fileName: 'coupon_usages_export',
      sheetName: 'Coupon Usages'
    },
    'ReportManagement': {
      columns: [
        { title: 'Report Type', dataIndex: 'reportType' },
        { title: 'User', dataIndex: 'userName' },
        { title: 'Technician', dataIndex: 'technicianName' },
        { title: 'Booking', dataIndex: 'bookingCode' },
        { title: 'Description', dataIndex: 'description' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Created At', dataIndex: 'createdAt' },
        { title: 'Updated At', dataIndex: 'updatedAt' },
      ],
      fileName: 'reports_export',
      sheetName: 'Reports'
    },
    'SystemReportManagement': {
      columns: [
        { title: 'Report Type', dataIndex: 'reportType' },
        { title: 'Title', dataIndex: 'title' },
        { title: 'Description', dataIndex: 'description' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Created At', dataIndex: 'createdAt' },
        { title: 'Updated At', dataIndex: 'updatedAt' },
      ],
      fileName: 'system_reports_export',
      sheetName: 'System Reports'
    },
    'WarrantyManagement': {
      columns: [
        { title: 'Warranty Code', dataIndex: 'warrantyCode' },
        { title: 'Booking', dataIndex: 'bookingCode' },
        { title: 'Customer', dataIndex: 'customerName' },
        { title: 'Technician', dataIndex: 'technicianName' },
        { title: 'Service', dataIndex: 'serviceName' },
        { title: 'Warranty Period', dataIndex: 'warrantyPeriod' },
        { title: 'Start Date', dataIndex: 'startDate' },
        { title: 'End Date', dataIndex: 'endDate' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Created At', dataIndex: 'createdAt' },
        { title: 'Updated At', dataIndex: 'updatedAt' },
      ],
      fileName: 'warranties_export',
      sheetName: 'Warranties'
    }
  };

  return templates[pageName] || {
    columns: [],
    fileName: `${pageName.toLowerCase()}_export`,
    sheetName: pageName.replace('Management', '')
  };
}; 