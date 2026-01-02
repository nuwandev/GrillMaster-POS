// App-wide constants and configuration

// Business settings
export const DEFAULT_TAX_RATE = 15;
export const CURRENCY = { CODE: 'LKR', LOCALE: 'en-LK', SYMBOL: 'Rs.' };

// Order types for dine-in, takeaway, delivery
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};

// LocalStorage keys - prefixed to avoid conflicts
export const STORAGE_KEYS = {
  PRODUCTS: 'grillmaster_products',
  ORDERS: 'grillmaster_orders',
  CUSTOMERS: 'grillmaster_customers',
  CART: 'grillmaster_cart',
  CURRENT_CUSTOMER: 'grillmaster_current_customer',
  ORDER_TYPE: 'grillmaster_order_type',
};

// UI settings
export const DEFAULT_PRODUCT_IMAGE = '🍽️';
export const TOAST_DURATION_MS = 3000;

// Route names for navigation
export const ROUTES = {
  HOME: 'home',
  NEW_ORDER: 'new-order',
  POS: 'pos',
  ORDERS: 'orders',
  MENU: 'menu',
  CUSTOMERS: 'customers',
};

export const DEFAULT_ROUTE = ROUTES.HOME;
