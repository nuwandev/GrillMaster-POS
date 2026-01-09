// Selectors - compute derived state
// Pure functions: (state) => derivedValue
// No side effects, no mutations

// Get total price of all items in cart
export function getCartTotal(state) {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Get total quantity of items in cart
export function getCartCount(state) {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Get order statistics for dashboard
export function getOrderStats(state) {
  const today = new Date().toLocaleDateString();

  const todayOrders = state.orders.filter((order) => {
    const orderDate = new Date(order.timestamp).toLocaleDateString();
    return orderDate === today;
  });

  const totalRevenue = state.orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  return {
    total: state.orders.length,
    today: todayOrders.length,
    revenue: totalRevenue,
    todayRevenue,
  };
}

// Get products filtered by category
export function getProductsByCategory(state, category) {
  if (!category || category === 'All') {
    return state.products;
  }

  return state.products.filter((product) => product.category === category);
}

// Get unique categories from products
export function getCategories(state) {
  const categories = new Set(state.products.map((product) => product.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

// Get top selling products (from order history)
export function getTopProducts(state, limit = 5) {
  // Aggregate product sales from all orders
  const productSales = {};

  state.orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.id]) {
        productSales[item.id] = {
          id: item.id,
          name: item.name,
          image: item.image,
          sales: 0,
          revenue: 0,
        };
      }
      productSales[item.id].sales += item.quantity;
      productSales[item.id].revenue += item.price * item.quantity;
    });
  });

  // Convert to array and sort by sales
  return Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

// Get cart item by product ID
export function getCartItem(state, productId) {
  return state.cart.find((item) => item.id === productId);
}

// Get product by ID
export function getProductById(state, productId) {
  return state.products.find((product) => product.id === productId);
}

// Get order by ID
export function getOrderById(state, orderId) {
  return state.orders.find((order) => order.id === orderId);
}

// Get customer by ID
export function getCustomerById(state, customerId) {
  return state.customers.find((customer) => customer.id === customerId);
}

// Check if undo is available
export function canUndo(state) {
  return state.actionHistory.length > 0;
}
