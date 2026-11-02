/**
 * Utility functions for formatting Indian Rupee (INR - ₹) currency and values
 */

export const formatINR = (amount: number, options?: { compact?: boolean; decimals?: number }): string => {
  if (isNaN(amount)) return '₹0';

  const { compact = false, decimals = 2 } = options || {};

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(decimals)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(decimals)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  // Full Indian number format with comma grouping (e.g. 1,00,000)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: amount % 1 === 0 ? 0 : decimals,
  }).format(amount);
};

export const formatINRCurrency = (amount: number): string => {
  return formatINR(amount, { compact: false, decimals: 0 });
};

export const formatINRPipeline = (amount: number): string => {
  return formatINR(amount, { compact: true, decimals: 2 });
};
