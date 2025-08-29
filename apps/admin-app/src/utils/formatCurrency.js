export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '0 VND';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0 VND';
  }
  
  // Format with US locale (dấu phẩy) and add VND after the number
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
  
  // Add VND after the number (5,000 VND)
  return `${formatted} VND`;
};

export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined) {
    return '0 VND';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0 VND';
  }
  
  // For compact display (e.g., 1.2M instead of 1,200,000)
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M VND`;
  } else if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(1)}K VND`;
  } else {
    return `${numAmount.toLocaleString('en-US')} VND`;
  }
}; 