// Global data store - manages all app state (products, orders, customers, cart)
// Uses reactive store pattern - state persists to localStorage

import { demoData } from './demo-data.js';
import {
  STORAGE_KEYS,
  ORDER_TYPES,
  DEFAULT_PRODUCT_IMAGE,
} from '../core/constants.js';
import { createStore } from '../core/state.js';
import { generateId } from '../utils/helpers.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

// Initial empty state
const initialState = {
  products: [],
  orders: [],
  customers: [],
  cart: [],
  currentCustomer: null,
  currentOrderType: ORDER_TYPES.DINE_IN,
};

const store = createStore(initialState);

// ============================================================================
// PERSISTENCE - Save/Load from localStorage
// ============================================================================

function saveState() {
  const state = store.state;
  saveToStorage(STORAGE_KEYS.PRODUCTS, state.products);
  saveToStorage(STORAGE_KEYS.ORDERS, state.orders);
  saveToStorage(STORAGE_KEYS.CUSTOMERS, state.customers);
  saveToStorage(STORAGE_KEYS.CART, state.cart);
  saveToStorage(STORAGE_KEYS.CURRENT_CUSTOMER, state.currentCustomer);
  saveToStorage(STORAGE_KEYS.ORDER_TYPE, state.currentOrderType);
}

// Load from localStorage, fallback to demo data if empty
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

// Add product to cart (increment quantity if already exists)
function addToCart(product) {
  if (!product?.id) return;

  const existing = store.state.cart.find((item) => item.id == product.id);
  if (existing) {
    // Increment quantity
    store.setState({
      cart: store.state.cart.map((item) =>
        item.id == product.id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    });
  } else {
    // Add new item with quantity 1
    store.setState({
      cart: [...store.state.cart, { ...product, quantity: 1 }],
    });
  }
  saveState();
}

function removeFromCart(productId) {
  store.setState({
    cart: store.state.cart.filter((item) => item.id != productId),
  });
  saveState();
}

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

function clearCart() {
  store.setState({ cart: [] });
  saveState();
}

// Calculate cart total: sum of (price × quantity) for all items
function getCartTotal() {
  return store.state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function getCartCount() {
  return store.state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ============================================================================
// CUSTOMER ACTIONS
// ============================================================================

function setCurrentCustomer(customer) {
  store.setState({ currentCustomer: customer });
  saveState();
}

// Add customer with validation (phone must be unique)
function addCustomer(name, phone = '', email = '') {
  const trimmedName = (name || '').trim();
  const trimmedPhone = (phone || '').trim();
  if (!trimmedName) return false;

  // Check for duplicate phone
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

function updateCustomer(id, updates) {
  const customerIndex = store.state.customers.findIndex(
    (cust) => cust.id == id
  );
  if (customerIndex === -1) return false;

  const customer = {
    ...store.state.customers[customerIndex],
    ...(updates.name?.trim() && { name: updates.name.trim() }),
    ...(updates.phone !== undefined && { phone: (updates.phone || '').trim() }),
    ...(updates.email !== undefined && { email: (updates.email || '').trim() }),
  };

  const customers = [...store.state.customers];
  customers[customerIndex] = customer;
  store.setState({ customers });

  // Update current customer if it's the one being edited
  if (store.state.currentCustomer?.id == id) {
    store.setState({ currentCustomer: customer });
  }
  saveState();
  return customer;
}

function deleteCustomer(customerId) {
  // Prevent deleting Guest customer (id 0 or 1)
  if (customerId == 0 || customerId == 1) return false;

  const wasSelected = store.state.currentCustomer?.id == customerId;
  store.setState({
    customers: store.state.customers.filter((cust) => cust.id != customerId),
  });

  // Reset to Guest if deleted customer was selected
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

function setOrderType(type) {
  store.setState({ currentOrderType: type });
  saveState();
}

// Create order from current cart
// Total calculation: subtotal - discount + tax
function placeOrder(paymentMethod = 'cash', opts = {}) {
  if (!store.state.cart.length) return null;

  const subtotal = opts.subtotal ?? getCartTotal();
  const discountValue = opts.discountValue ?? 0;
  const taxAmount = opts.taxAmount ?? 0;
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

  // Save order and clear cart
  store.setState({ orders: [...store.state.orders, order], cart: [] });
  saveState();
  return order;
}

function updateOrder(orderId, updates) {
  const orderIndex = store.state.orders.findIndex((ord) => ord.id == orderId);
  if (orderIndex === -1) return false;

  const orders = [...store.state.orders];
  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  store.setState({ orders });
  saveState();
  return orders[orderIndex];
}

function deleteOrder(orderId) {
  const filtered = store.state.orders.filter((ord) => ord.id != orderId);
  if (filtered.length === store.state.orders.length) return false;
  store.setState({ orders: filtered });
  saveState();
  return true;
}

// Mark order as paid and calculate change
function markOrderPaid(orderId, amount) {
  const order = store.state.orders.find((ord) => ord.id == orderId);
  if (!order) return false;

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

function addProduct(name, price, category, image = DEFAULT_PRODUCT_IMAGE) {
  const trimmedName = (name || '').trim();
  const trimmedCategory = (category || '').trim();
  const parsedPrice = parseFloat(price);

  // Validate required fields
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

function updateProduct(id, updates) {
  const productIndex = store.state.products.findIndex((prod) => prod.id == id);
  if (productIndex === -1) return false;

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

// Get order stats for dashboard
function getOrderStats() {
  const today = new Date().toLocaleDateString();
  const todayOrders = store.state.orders.filter(
    (ord) => new Date(ord.timestamp).toLocaleDateString() === today
  );
  return {
    total: store.state.orders.length,
    today: todayOrders.length,
    revenue: store.state.orders.reduce((sum, ord) => sum + (ord.total || 0), 0),
    todayRevenue: todayOrders.reduce((sum, ord) => sum + (ord.total || 0), 0),
  };
}

// ============================================================================
// RESET
// ============================================================================

// Reset all data back to demo defaults
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

// Load saved state when module loads
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
  // Analytics & Reset
  getOrderStats,
  resetData,
};

export default store;
