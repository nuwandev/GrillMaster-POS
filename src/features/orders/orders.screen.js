/**
 * @fileoverview Orders Screen - View and manage orders.
 */

import {
  store,
  updateOrder,
  deleteOrder,
  markOrderPaid,
} from '../../data/store.js';
import { StatusBadge } from '../../ui/badge.js';
import { updateText } from '../../ui/dom-utils.js';
import { Header } from '../../ui/header.js';
import { confirm, toast, createModal } from '../../ui/modal.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';

/**
 * Orders screen controller.
 */
export class OrdersScreen {
  /**
   * @param {Object} options - Screen options
   */
  constructor(options = {}) {
    this.router = options.router;
    this.filter = 'all';
    this.tab = 'all';
    this.searchQuery = '';
  }

  /**
   * Render the orders screen.
   * @returns {string} HTML string
   */
  render() {
    const filteredOrders = this.getFilteredOrders();
    const stats = this.calculateStats(filteredOrders);

    return `
      <div class="min-h-screen flex flex-col bg-gray-50">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-gray-600 hover:text-gray-900 text-xl">← Back</button>',
          center: '<h1 class="text-xl font-bold">Orders</h1>',
          right: '<span class="text-sm">Connected</span>',
        })}

        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <div class="max-w-6xl mx-auto">
            ${this.renderStatsCards(stats)}
            ${this.renderFilters()}
            ${this.renderOrdersList(filteredOrders)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render stats cards.
   * @param {Object} stats - Order statistics
   * @returns {string} Stats HTML
   */
  renderStatsCards(stats) {
    return `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6" data-order-stats>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-2xl font-bold text-gray-900" data-stat-total>${stats.total}</div>
          <div class="text-sm text-gray-500">Total Orders</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-2xl font-bold text-green-600" data-stat-revenue>${formatCurrency(stats.revenue)}</div>
          <div class="text-sm text-gray-500">Revenue</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-2xl font-bold text-blue-600" data-stat-preparing>${stats.preparing}</div>
          <div class="text-sm text-gray-500">Preparing</div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-2xl font-bold text-orange-600" data-stat-unpaid>${stats.unpaid}</div>
          <div class="text-sm text-gray-500">Unpaid</div>
        </div>
      </div>
    `;
  }

  /**
   * Render filter controls.
   * @returns {string} Filters HTML
   */
  renderFilters() {
    return `
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <!-- Tabs -->
        <div class="flex gap-2 mb-4 border-b pb-4" data-order-tabs>
          <button 
            class="px-4 py-2 rounded-lg font-medium transition-all ${this.tab === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            onclick="ordersScreen.setTab('all')"
          >
            All Orders
          </button>
          <button 
            class="px-4 py-2 rounded-lg font-medium transition-all ${this.tab === 'today' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            onclick="ordersScreen.setTab('today')"
          >
            Today
          </button>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by order # or customer..."
              value="${this.searchQuery}"
              oninput="ordersScreen.updateSearchQuery(this.value)"
              class="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            onchange="ordersScreen.setFilter(this.value)"
            class="border-2 border-gray-200 rounded-lg px-4 py-2.5 font-medium focus:border-primary focus:outline-none"
          >
            <option value="all" ${this.filter === 'all' ? 'selected' : ''}>All Status</option>
            <option value="completed" ${this.filter === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="preparing" ${this.filter === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="cancelled" ${this.filter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="paid" ${this.filter === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="unpaid" ${this.filter === 'unpaid' ? 'selected' : ''}>Unpaid</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Render orders list.
   * @param {Array} orders - Filtered orders
   * @returns {string} List HTML
   */
  renderOrdersList(orders) {
    if (orders.length === 0) {
      return `
        <div class="text-center text-gray-400 py-20">
          <div class="text-7xl mb-4">📋</div>
          <div class="text-xl font-medium">No orders found</div>
          <div class="text-sm mt-2">Try adjusting your filters</div>
        </div>
      `;
    }

    return `
      <div class="space-y-4" data-orders-list>
        ${orders.map((order) => this.renderOrderCard(order)).join('')}
      </div>
    `;
  }

  /**
   * Render order action buttons.
   * @param {Object} order - Order data
   * @returns {string} Buttons HTML
   */
  renderOrderActions(order) {
    const completeBtn =
      order.status !== 'completed'
        ? `<button onclick="ordersScreen.updateStatus('${order.id}', 'completed')" class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100">✓ Complete</button>`
        : '';
    const paidBtn =
      order.paymentStatus === 'unpaid'
        ? `<button onclick="ordersScreen.handleMarkPaid('${order.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">💰 Mark Paid</button>`
        : '';
    return `
      <div class="flex flex-wrap gap-2">
        ${completeBtn}${paidBtn}
        <button onclick="ordersScreen.viewDetails('${order.id}')" class="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">👁 View</button>
        <button onclick="ordersScreen.handleDelete('${order.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">🗑 Delete</button>
      </div>
    `;
  }

  /**
   * Render an order card.
   * @param {Object} order - Order data
   * @returns {string} Card HTML
   */
  renderOrderCard(order) {
    const customerName = order.customer?.name || 'Guest';
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

    return `
      <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-5">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-3 mb-1"><span class="font-bold text-lg">#${order.id}</span>${StatusBadge(order.status)}${StatusBadge(order.paymentStatus)}</div>
            <div class="text-sm text-gray-500">${formatDate(order.timestamp)}</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">${formatCurrency(order.total)}</div>
            <div class="text-sm text-gray-500">${itemCount} items • ${order.orderType}</div>
          </div>
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">${customerName.charAt(0).toUpperCase()}</div>
          <div><div class="font-medium">${customerName}</div><div class="text-sm text-gray-500 capitalize">${order.paymentMethod}</div></div>
        </div>
        ${this.renderOrderActions(order)}
      </div>
    `;
  }

  /**
   * Get filtered orders.
   * @returns {Array} Filtered orders
   */
  getFilteredOrders() {
    let orders = [...store.state.orders];

    // Filter by tab
    if (this.tab === 'today') {
      const today = new Date().toLocaleDateString();
      orders = orders.filter(
        (ord) => new Date(ord.timestamp).toLocaleDateString() === today
      );
    }

    // Filter by status
    if (this.filter !== 'all') {
      orders = orders.filter(
        (ord) => ord.status === this.filter || ord.paymentStatus === this.filter
      );
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      orders = orders.filter(
        (ord) =>
          String(ord.id).includes(query) ||
          (ord.customer?.name || '').toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending
    return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Calculate stats from orders.
   * @param {Array} orders - Orders to calculate from
   * @returns {Object} Statistics
   */
  calculateStats(orders) {
    return {
      total: orders.length,
      revenue: orders.reduce(
        (sum, ord) => sum + (ord.total || ord.subtotal),
        0
      ),
      preparing: orders.filter((ord) => ord.status === 'preparing').length,
      unpaid: orders.filter((ord) => ord.paymentStatus === 'unpaid').length,
    };
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  setTab(tab) {
    this.tab = tab;
    this.updateOrderList();
    this.updateTabs();
  }

  setFilter(filter) {
    this.filter = filter;
    this.updateOrderList();
  }

  updateSearchQuery(query) {
    this.searchQuery = query;
    this.updateOrderList();
  }

  updateStatus(orderId, status) {
    updateOrder(orderId, { status });
    toast(`Order #${orderId} marked as ${status}`, 'success');
    this.updateOrderList();
  }

  async handleMarkPaid(orderId) {
    const order = store.state.orders.find((ord) => ord.id == orderId);
    if (!order) {
      return;
    }

    markOrderPaid(orderId, order.total);
    toast(`Order #${orderId} marked as paid`, 'success');
    this.updateOrderList();
  }

  async handleDelete(orderId) {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: `Are you sure you want to delete order #${orderId}?`,
      confirmText: 'Delete',
      danger: true,
    });

    if (confirmed) {
      deleteOrder(orderId);
      toast(`Order #${orderId} deleted`, 'info');
      this.updateOrderList();
    }
  }

  viewDetails(orderId) {
    const order = store.state.orders.find((ord) => ord.id == orderId);
    if (!order) {
      return;
    }

    const itemsHtml = order.items
      .map(
        (item) => `
      <div class="flex justify-between py-2 border-b last:border-0">
        <span>${item.quantity}x ${item.name}</span>
        <span class="font-semibold">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `
      )
      .join('');

    const modalHtml = `
      <div class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-500 mb-1">Customer</div>
          <div class="font-medium">${order.customer?.name || 'Guest'}</div>
        </div>
        
        <div>
          <div class="text-sm text-gray-500 mb-2">Items</div>
          <div class="bg-gray-50 p-3 rounded-lg">${itemsHtml}</div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">Subtotal</div>
            <div class="font-semibold">${formatCurrency(order.subtotal)}</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500">Total</div>
            <div class="font-bold text-primary">${formatCurrency(order.total)}</div>
          </div>
        </div>
      </div>
    `;

    createModal({
      title: `Order #${orderId}`,
      html: modalHtml,
      actions: [{ label: 'Close', variant: 'secondary' }],
    });
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================

  updateOrderList() {
    const filteredOrders = this.getFilteredOrders();
    const listEl = document.querySelector('[data-orders-list]');

    if (listEl) {
      listEl.innerHTML =
        filteredOrders.length === 0
          ? `
        <div class="text-center text-gray-400 py-20">
          <div class="text-7xl mb-4">📋</div>
          <div class="text-xl font-medium">No orders found</div>
          <div class="text-sm mt-2">Try adjusting your filters</div>
        </div>
      `
          : filteredOrders.map((order) => this.renderOrderCard(order)).join('');
    }

    this.updateStats();
  }

  updateStats() {
    const filteredOrders = this.getFilteredOrders();
    const stats = this.calculateStats(filteredOrders);

    updateText('[data-stat-total]', stats.total);
    updateText('[data-stat-revenue]', formatCurrency(stats.revenue));
    updateText('[data-stat-preparing]', stats.preparing);
    updateText('[data-stat-unpaid]', stats.unpaid);
  }

  updateTabs() {
    const tabsHtml = `
      <button 
        class="px-4 py-2 rounded-lg font-medium transition-all ${this.tab === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        onclick="ordersScreen.setTab('all')"
      >
        All Orders
      </button>
      <button 
        class="px-4 py-2 rounded-lg font-medium transition-all ${this.tab === 'today' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        onclick="ordersScreen.setTab('today')"
      >
        Today
      </button>
    `;

    const tabsEl = document.querySelector('[data-order-tabs]');
    if (tabsEl) {
      tabsEl.innerHTML = tabsHtml;
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  mount() {
    window.ordersScreen = this;
  }

  unmount() {
    delete window.ordersScreen;
  }
}

export default OrdersScreen;
