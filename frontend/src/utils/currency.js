/**
 * Currency utility functions for Indonesian Rupiah (IDR)
 */

/**
 * Format a number as Indonesian Rupiah
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the Rp symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatIDR = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'Rp 0' : '0';
  }

  const numAmount = Number(amount);
  
  // Format with Indonesian locale (thousands separator with dots)
  const formatted = numAmount.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return showSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Parse IDR string back to number
 * @param {string} idrString - The IDR string to parse
 * @returns {number} Parsed number
 */
export const parseIDR = (idrString) => {
  if (!idrString) return 0;
  
  // Remove Rp symbol and spaces, then replace dots with empty string
  const cleanString = idrString
    .replace(/Rp\s?/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '');
    
  return parseInt(cleanString, 10) || 0;
};

/**
 * Validate IDR amount
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum allowed amount (default: 0)
 * @param {number} max - Maximum allowed amount (default: 10000000)
 * @returns {object} Validation result with isValid and message
 */
export const validateIDR = (amount, min = 0, max = 10000000) => {
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Please enter a valid amount' };
  }
  
  if (numAmount < min) {
    return { isValid: false, message: `Amount must be at least ${formatIDR(min)}` };
  }
  
  if (numAmount > max) {
    return { isValid: false, message: `Amount cannot exceed ${formatIDR(max)}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Format input value for IDR display
 * @param {string} value - Input value
 * @returns {string} Formatted value for display
 */
export const formatIDRInput = (value) => {
  if (!value) return '';
  
  // Remove non-numeric characters
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (!numericValue) return '';
  
  // Format with dots as thousands separator
  return Number(numericValue).toLocaleString('id-ID');
};

/**
 * Common IDR amounts for quick selection
 */
export const COMMON_IDR_AMOUNTS = [
  50000,   // Rp 50.000
  75000,   // Rp 75.000
  100000,  // Rp 100.000
  150000,  // Rp 150.000
  200000,  // Rp 200.000
  250000,  // Rp 250.000
  300000,  // Rp 300.000
  500000,  // Rp 500.000
];

/**
 * Get suggested price ranges for different venue types
 */
export const VENUE_PRICE_RANGES = {
  basic: { min: 50000, max: 150000, label: 'Basic Courts' },
  standard: { min: 150000, max: 300000, label: 'Standard Courts' },
  premium: { min: 300000, max: 500000, label: 'Premium Courts' },
  luxury: { min: 500000, max: 1000000, label: 'Luxury Courts' }
};
