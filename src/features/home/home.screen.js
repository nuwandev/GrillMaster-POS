// Home Screen - Dashboard with stats, quick actions, and navigation

import { store, getOrderStats, resetData } from '../../data/store.js';
import { Header } from '../../ui/header.js';
import { confirm, toast } from '../../ui/modal.js';
import { formatCurrency } from '../../utils/helpers.js';

const TOP_PRODUCTS_LIMIT = 4;
const CLOCK_UPDATE_INTERVAL = 1000;

export class HomeScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.now = new Date();
    this.clockInterval = null;
  }

  render() {
    const stats = getOrderStats();
    const topProducts = this.getTopProducts();
    const avgOrderValue =
      stats.today > 0 ? stats.todayRevenue / stats.today : 0;

    return `
      <div class="min-h-screen flex flex-col bg-gray-50">
        ${this.renderHeader()}
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto p-6">
            ${this.renderNewOrderButton()}
            ${this.renderStatsGrid(stats, avgOrderValue)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${this.renderTopProducts(topProducts)}
              ${this.renderQuickNav(stats)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderHeader() {
    return Header({
      left: '<h1 class="text-2xl font-bold text-gray-900">GrillMaster POS</h1>',
      right: `
        <div class="text-sm text-gray-500 flex items-center gap-2">
          <span>${this.now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <span class="w-px h-4 bg-gray-300"></span>
          <span data-clock>${this.now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      `,
    });
  }

  renderNewOrderButton() {
    return `
      <div class="mb-6">
        <button onclick="app.navigate('new-order')" class="w-full bg-primary text-white text-2xl font-bold py-12 rounded-xl shadow-lg hover:bg-blue-600 active:scale-98 transition-all">
          + Start New Order
        </button>
      </div>
    `;
  }

  // Stats cards row
  renderStatsGrid(stats, avgOrderValue) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        ${this.renderStatCard("Today's Revenue", formatCurrency(stats.todayRevenue), `${stats.today} orders today`, 'text-primary')}
        ${this.renderStatCard('Total Revenue', formatCurrency(stats.revenue), `${stats.total} total orders`, 'text-success')}
        ${this.renderStatCard('Avg Order Value', formatCurrency(avgOrderValue), 'Per order', 'text-orange-500')}
        ${this.renderStatCard('Orders Today', stats.today, 'Completed', 'text-blue-500')}
      </div>
    `;
  }

  renderStatCard(label, value, subtitle, colorClass) {
    return `
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="text-sm text-gray-500 mb-1">${label}</div>
        <div class="text-3xl font-bold ${colorClass}">${value}</div>
        <div class="text-xs text-gray-400 mt-2">${subtitle}</div>
      </div>
    `;
  }

  // Top selling products from order history
  renderTopProducts(topProducts) {
    const productList =
      topProducts.length === 0
        ? `<div class="text-center text-gray-400 py-8"><div class="text-4xl mb-2">📊</div><div>No orders yet</div></div>`
        : topProducts
            .map(
              (item) => `
          <div class="flex items-center justify-between mb-3 pb-3 border-b last:border-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${item.image}</span>
              <div>
                <div class="font-medium">${item.name}</div>
                <div class="text-sm text-gray-500">${item.sales} sold</div>
              </div>
            </div>
            <div class="text-sm font-semibold text-primary">${formatCurrency(item.revenue)}</div>
          </div>
        `
            )
            .join('');

    return `
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-4">Top Products</h3>
        ${productList}
      </div>
    `;
  }

  // Quick navigation buttons
  renderQuickNav(stats) {
    const state = store.state;
    return `
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-4">Quick Access</h3>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="app.navigate('orders')" class="p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
            <div class="text-2xl mb-2">📋</div>
            <div class="font-semibold">Orders</div>
            <div class="text-sm text-gray-500">${stats.total} total</div>
          </button>
          <button onclick="app.navigate('menu')" class="p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
            <div class="text-2xl mb-2">📖</div>
            <div class="font-semibold">Menu</div>
            <div class="text-sm text-gray-500">${state.products.length} items</div>
          </button>
          <button onclick="app.navigate('customers')" class="p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-blue-50 transition-all text-left">
            <div class="text-2xl mb-2">👥</div>
            <div class="font-semibold">Customers</div>
            <div class="text-sm text-gray-500">${state.customers.length} total</div>
          </button>
          <button onclick="homeScreen.handleReset()" class="p-4 rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all text-left">
            <div class="text-2xl mb-2">🔄</div>
            <div class="font-semibold">Reset</div>
            <div class="text-sm text-gray-500">Clear data</div>
          </button>
        </div>
      </div>
    `;
  }

  // Aggregate sales data from all orders
  getTopProducts() {
    const productSales = {};
    store.state.orders.forEach((order) => {
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
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_PRODUCTS_LIMIT);
  }

  async handleReset() {
    const confirmed = await confirm({
      title: 'Reset All Data',
      message:
        'This will clear all orders, cart, and reset to demo data. Continue?',
      confirmText: 'Reset',
      danger: true,
    });
    if (confirmed) {
      resetData();
      toast('Data has been reset', 'success');
      window.app.render();
    }
  }

  // Live clock update
  updateClock() {
    const clockEl = document.querySelector('[data-clock]');
    if (clockEl) {
      this.now = new Date();
      clockEl.textContent = this.now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
  }

  // Lifecycle: called after render
  mount() {
    window.homeScreen = this;
    this.clockInterval = setInterval(
      () => this.updateClock(),
      CLOCK_UPDATE_INTERVAL
    );
  }

  // Lifecycle: cleanup before leaving screen
  unmount() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    delete window.homeScreen;
  }
}

export default HomeScreen;
