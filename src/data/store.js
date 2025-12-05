/**
 * @fileoverview Shared store instance for the application.
 * This provides the global data store using the state management pattern.
 */

import { demoData } from './demo-data.js';
import {
  STORAGE_KEYS,
  ORDER_TYPES,
  DEFAULT_PRODUCT_IMAGE,
} from '../core/constants.js';
import { createStore } from '../core/state.js';
import { generateId } from '../utils/helpers.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} category
 * @property {string} image
 * @property {number} quantity
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} category
 * @property {string} image
 */

/**
 * @typedef {Object} Customer
 * @property {number} id
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {CartItem[]} items
 * @property {Customer|null} customer
 * @property {string} orderType
 * @property {number} subtotal
 * @property {number} discountValue
 * @property {string} discountType
 * @property {number} taxRate
 * @property {number} taxAmount
 * @property {number} total
 * @property {number} amountReceived
 * @property {number} changeDue
 * @property {string} paymentMethod
 * @property {string} paymentStatus
 * @property {string} status
 * @property {string} timestamp
 */

/**
 * @typedef {Object} AppState
 * @property {Product[]} products
 * @property {Order[]} orders
 * @property {Customer[]} customers
 * @property {CartItem[]} cart
 * @property {Customer|null} currentCustomer
 * @property {string} currentOrderType
 */

/** @type {AppState} */
const initialState = {
  products: [],
  orders: [],
  customers: [],
  cart: [],
  currentCustomer: null,
  currentOrderType: ORDER_TYPES.DINE_IN,
};

// ============================================================================
// STORE INSTANCE
// ============================================================================

const store = createStore(initialState);

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Save current state to localStorage.
 */
function saveState() {
  const state = store.state;
  saveToStorage(STORAGE_KEYS.PRODUCTS, state.products);
  saveToStorage(STORAGE_KEYS.ORDERS, state.orders);
  saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  saveToStorage(STORAGE_KEYS.CART, state.cart);
  saveToStorage(STORAGE_KEYS.CURRENT_CUSTOMER, state.currentCustomer);
  saveToStorage(STORAGE_KEYS.ORDER_TYPE, state.currentOrderType);
}

/** Load state from localStorage. */
function loadState() {
  const products = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);

  store.setState({
    products: products.length ? products : demoData.items,
    orders: orders.length ? orders : demoData.orders,
    customers: customers.length ? customers : demoData.customers,
    cart: loadFromStorage(STORAGE_KEYS.CART, []),
    currentCustomer: loadFromStorage(STORAGE_KEYS.CURRENT_CUSTOMER, null),
    currentOrderType: loadFromStorage(
      STORAGE_KEYS.ORDER_TYPE,
      ORDER_TYPES.DINE_IN
    ),
  });
}

// ============================================================================
// CART ACTIONS
// ============================================================================

/** Add a product to the cart. */
function addToCart(product) {
  if (!product?.id) {
    return;
  }

  const existing = store.state.cart.find((item) => item.id == product.id);
  if (existing) {
    store.setState({
      cart: store.state.cart.map((item) =>
        item.id == product.id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    });
  } else {
    store.setState({
      cart: [...store.state.cart, { ...product, quantity: 1 }],
    });
  }
  saveState();
}

/** Remove a product from the cart. */
function removeFromCart(productId) {
  store.setState({
    cart: store.state.cart.filter((item) => item.id != productId),
  });
  saveState();
}

/** Update quantity of a cart item. */
function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  store.setState({
    cart: store.state.cart.map((item) =>
      item.id == productId ? { ...item, quantity } : item
    ),
  });
  saveState();
}

/** Clear the entire cart. */
function clearCart() {
  store.setState({ cart: [] });
  saveState();
}

/** Get cart total price. */
function getCartTotal() {
  return store.state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

/** Get cart item count. */
function getCartCount() {
  return store.state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ============================================================================
// CUSTOMER ACTIONS
// ============================================================================

/** Set current customer. */
function setCurrentCustomer(customer) {
  store.setState({ currentCustomer: customer });
  saveState();
}

/** Add a new customer. */
function addCustomer(name, phone = '', email = '') {
  const trimmedName = (name || '').trim();
  const trimmedPhone = (phone || '').trim();
  if (!trimmedName) {
    return false;
  }
  if (
    trimmedPhone &&
    store.state.customers.some((cust) => cust.phone === trimmedPhone)
  ) {
    return false;
  }

  const customer = {
    id: generateId(),
    name: trimmedName,
    phone: trimmedPhone,
    email: (email || '').trim(),
  };
  store.setState({ customers: [...store.state.customers, customer] });
  saveState();
  return customer;
}

/** Update a customer. */
function updateCustomer(id, updates) {
  const customerIndex = store.state.customers.findIndex(
    (cust) => cust.id == id
  );
  if (customerIndex === -1) {
    return false;
  }

  const customer = {
    ...store.state.customers[customerIndex],
    ...(updates.name?.trim() && { name: updates.name.trim() }),
    ...(updates.phone !== undefined && { phone: (updates.phone || '').trim() }),
    ...(updates.email !== undefined && { email: (updates.email || '').trim() }),
  };

  const customers = [...store.state.customers];
  customers[customerIndex] = customer;
  store.setState({ customers });

  if (store.state.currentCustomer?.id == id) {
    store.setState({ currentCustomer: customer });
  }
  saveState();
  return customer;
}

/** Delete a customer. */
function deleteCustomer(customerId) {
  if (customerId == 0 || customerId == 1) {
    return false;
  } // Can't delete Guest

  const wasSelected = store.state.currentCustomer?.id == customerId;
  store.setState({
    customers: store.state.customers.filter((cust) => cust.id != customerId),
  });

  if (wasSelected) {
    const guest = store.state.customers.find(
      (cust) => cust.name.toLowerCase() === 'guest'
    );
    store.setState({ currentCustomer: guest || null });
  }
  saveState();
  return true;
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

/** Set current order type. */
function setOrderType(type) {
  store.setState({ currentOrderType: type });
  saveState();
}

/** Place an order. */
function placeOrder(paymentMethod = 'cash', opts = {}) {
  if (!store.state.cart.length) {
    return null;
  }

  const subtotal = opts.subtotal ?? getCartTotal();
  const discountValue = opts.discountValue ?? 0;
  const taxAmount = opts.taxAmount ?? 0;
  // Use passed total if available, otherwise calculate it
  const total = opts.total ?? subtotal - discountValue + taxAmount;

  const order = {
    id: generateId(),
    items: [...store.state.cart],
    customer: store.state.currentCustomer,
    orderType: store.state.currentOrderType,
    subtotal,
    discountValue,
    discountType: opts.discountType ?? 'none',
    taxRate: opts.taxRate ?? 0,
    taxAmount,
    total,
    amountReceived: opts.amountReceived ?? 0,
    changeDue: opts.changeDue ?? 0,
    paymentMethod: String(paymentMethod),
    paymentStatus: opts.paymentStatus ?? 'unpaid',
    status: opts.status ?? 'preparing',
    timestamp: new Date().toISOString(),
  };

  store.setState({ orders: [...store.state.orders, order], cart: [] });
  saveState();
  return order;
}

/** Update an order. */
function updateOrder(orderId, updates) {
  const orderIndex = store.state.orders.findIndex((ord) => ord.id == orderId);
  if (orderIndex === -1) {
    return false;
  }

  const orders = [...store.state.orders];
  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  store.setState({ orders });
  saveState();
  return orders[orderIndex];
}

/** Delete an order. */
function deleteOrder(orderId) {
  const filtered = store.state.orders.filter((ord) => ord.id != orderId);
  if (filtered.length === store.state.orders.length) {
    return false;
  }
  store.setState({ orders: filtered });
  saveState();
  return true;
}

/** Mark order as paid. */
function markOrderPaid(orderId, amount) {
  const order = store.state.orders.find((ord) => ord.id == orderId);
  if (!order) {
    return false;
  }

  const received = Number.isFinite(amount) ? amount : order.total;
  return updateOrder(orderId, {
    amountReceived: received,
    changeDue: Math.max(0, received - order.total),
    paymentStatus: received >= order.total ? 'paid' : 'unpaid',
  });
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

/** Add a new product. */
function addProduct(name, price, category, image = DEFAULT_PRODUCT_IMAGE) {
  const trimmedName = (name || '').trim();
  const trimmedCategory = (category || '').trim();
  const parsedPrice = parseFloat(price);
  if (
    !trimmedName ||
    !trimmedCategory ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice < 0
  ) {
    return false;
  }

  const product = {
    id: generateId(),
    name: trimmedName,
    price: parsedPrice,
    category: trimmedCategory,
    image: (image || DEFAULT_PRODUCT_IMAGE).trim(),
  };
  store.setState({ products: [...store.state.products, product] });
  saveState();
  return product;
}

/** Update a product. */
function updateProduct(id, updates) {
  const productIndex = store.state.products.findIndex((prod) => prod.id == id);
  if (productIndex === -1) {
    return false;
  }

  const parsedPrice = parseFloat(updates.price);
  const product = {
    ...store.state.products[productIndex],
    ...(updates.name?.trim() && { name: updates.name.trim() }),
    ...(Number.isFinite(parsedPrice) &&
      parsedPrice >= 0 && { price: parsedPrice }),
    ...(updates.category?.trim() && { category: updates.category.trim() }),
    ...(updates.image?.trim() && { image: updates.image.trim() }),
  };

  const products = [...store.state.products];
  products[productIndex] = product;
  store.setState({ products });
  saveState();
  return product;
}

/** Delete a product. */
function deleteProduct(productId) {
  store.setState({
    products: store.state.products.filter((prod) => prod.id != productId),
  });
  saveState();
  return true;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/** Get order statistics. */
function getOrderStats() {
  const today = new Date().toLocaleDateString();
  const todayOrders = store.state.orders.filter(
    (ord) => new Date(ord.timestamp).toLocaleDateString() === today
  );
  return {
    total: store.state.orders.length,
    today: todayOrders.length,
    revenue: store.state.orders.reduce(
      (total, ord) => total + (ord.total || 0),
      0
    ),
    todayRevenue: todayOrders.reduce(
      (total, ord) => total + (ord.total || 0),
      0
    ),
  };
}

// ============================================================================
// RESET
// ============================================================================

/** Reset all data to defaults. */
function resetData() {
  store.setState({
    products: demoData.items,
    orders: demoData.orders,
    customers: demoData.customers,
    cart: [],
    currentCustomer: null,
    currentOrderType: ORDER_TYPES.DINE_IN,
  });
  saveState();
}

// ============================================================================
// INITIALIZE
// ============================================================================

// Load state on module initialization
loadState();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  store,
  // Cart
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  getCartCount,
  // Customer
  setCurrentCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  // Order
  setOrderType,
  placeOrder,
  updateOrder,
  deleteOrder,
  markOrderPaid,
  // Product
  addProduct,
  updateProduct,
  deleteProduct,
  // Analytics
  getOrderStats,
  // Reset
  resetData,
};

export default store;
