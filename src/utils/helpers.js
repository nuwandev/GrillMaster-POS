/**
 * @fileoverview Shared utility functions.
 * Pure helper functions with no side effects.
 */

import { CURRENCY } from '../core/constants.js';

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format a number as LKR currency.
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  const num = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  try {
    return new Intl.NumberFormat(CURRENCY.LOCALE, {
      style: 'currency',
      currency: CURRENCY.CODE,
    }).format(num);
  } catch {
    return `${CURRENCY.SYMBOL} ${num.toFixed(2)}`;
  }
}

/**
 * Format a date/time in a friendly way.
 * @param {string|number|Date} dateInput - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// DATA UTILITIES
// ============================================================================

/**
 * Get distinct categories from products.
 * @param {Array<{category: string}>} products - Product array
 * @returns {string[]} Unique categories
 */
export function getCategories(products) {
  if (!Array.isArray(products)) {
    return [];
  }
  return [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
}

/**
 * Generate a unique ID based on timestamp.
 * @param {string} [prefix=''] - Optional prefix
 * @returns {string} Unique identifier
 */
export function generateId(prefix = '') {
  // eslint-disable-next-line no-magic-numbers -- base36 encoding constants
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
  return prefix ? `${prefix}-${id}` : id;
}
