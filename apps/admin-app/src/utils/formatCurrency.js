export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '0 ₫';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0 ₫';
  }
  
  // Format with Vietnamese locale and replace VND with ₫
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
  
  // Replace VND with ₫ to ensure consistency
  return formatted.replace(' VND', ' ₫').replace(' VNĐ', ' ₫');
};

export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined) {
    return '0 ₫';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0 ₫';
  }
  
  // For compact display (e.g., 1.2M instead of 1,200,000)
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M ₫`;
  } else if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(1)}K ₫`;
  } else {
    return `${numAmount.toLocaleString('vi-VN')} ₫`;
  }
}; 