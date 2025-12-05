/**
 * @fileoverview Application constants and configuration values.
 * All magic numbers and hard-coded values should be defined here.
 */

// ============================================================================
// BUSINESS CONSTANTS
// ============================================================================

/** Default tax rate as a percentage (15%) */
export const DEFAULT_TAX_RATE = 15;

/** Default currency settings */
export const CURRENCY = {
  CODE: 'LKR',
  LOCALE: 'en-LK',
  SYMBOL: 'Rs.',
};

// ============================================================================
// ORDER TYPES
// ============================================================================

export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  PRODUCTS: 'grillmaster_products',
  ORDERS: 'grillmaster_orders',
  CUSTOMERS: 'grillmaster_customers',
  CART: 'grillmaster_cart',
  CURRENT_CUSTOMER: 'grillmaster_current_customer',
  ORDER_TYPE: 'grillmaster_order_type',
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const DEFAULT_PRODUCT_IMAGE = '🍽️';

export const TOAST_DURATION_MS = 3000;

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  HOME: 'home',
  NEW_ORDER: 'new-order',
  POS: 'pos',
  ORDERS: 'orders',
  MENU: 'menu',
  CUSTOMERS: 'customers',
};

export const DEFAULT_ROUTE = ROUTES.HOME;
