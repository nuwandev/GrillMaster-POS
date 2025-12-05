/**
 * @fileoverview Customers Screen - Manage customer records.
 */

import {
  store,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from '../../data/store.js';
import { Header } from '../../ui/header.js';
import { confirm, toast, createModal } from '../../ui/modal.js';

/**
 * Customers screen controller.
 */
export class CustomersScreen {
  /**
   * @param {Object} options - Screen options
   */
  constructor(options = {}) {
    this.router = options.router;
    this.showAddForm = false;
    this.editing = null;
    this.searchQuery = '';
  }

  /**
   * Render the customers screen.
   * @returns {string} HTML string
   */
  render() {
    const filteredCustomers = this.getFilteredCustomers();
    const stats = this.getCustomerStats();

    return `
      <div class="min-h-screen flex flex-col bg-gray-50">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-gray-600 hover:text-gray-900 text-xl">← Back</button>',
          center: '<h1 class="text-xl font-bold">Customers</h1>',
          right:
            '<button onclick="customersScreen.showAddCustomerForm()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm">+ Add Customer</button>',
        })}

        ${this.renderStatsBar(stats, filteredCustomers.length)}
        ${this.renderSearchBar()}
        ${this.renderCustomerList(filteredCustomers)}
      </div>
    `;
  }

  /**
   * Render stats bar.
   * @param {Object} stats - Customer stats
   * @param {number} showing - Number showing
   * @returns {string} Stats HTML
   */
  renderStatsBar(stats, showing) {
    return `
      <div class="bg-white border-b px-6 py-4" data-customer-stats>
        <div class="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900" data-stat-total>${stats.total}</div>
            <div class="text-sm text-gray-500">Total Customers</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600" data-stat-orders>${stats.withOrders}</div>
            <div class="text-sm text-gray-500">With Orders</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900" data-stat-showing>${showing}</div>
            <div class="text-sm text-gray-500">Showing</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render search bar.
   * @returns {string} Search HTML
   */
  renderSearchBar() {
    return `
      <div class="bg-white border-b px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="🔍 Search by name, phone, or email..."
            value="${this.searchQuery}"
            oninput="customersScreen.updateSearchQuery(this.value)"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition"
          />
        </div>
      </div>
    `;
  }

  /**
   * Render customer list.
   * @param {Array} customers - Filtered customers
   * @returns {string} List HTML
   */
  renderCustomerList(customers) {
    if (customers.length === 0) {
      return `
        <div class="flex-1 overflow-y-auto p-6">
          <div class="max-w-4xl mx-auto" data-customer-list>
            <div class="text-center text-gray-400 py-20">
              <div class="text-7xl mb-4">👥</div>
              <div class="text-xl font-medium">No customers found</div>
              <div class="text-sm mt-2">${
                this.searchQuery
                  ? 'Try adjusting your search'
                  : 'Add your first customer to get started'
              }</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto" data-customer-list>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${customers.map((customer) => this.renderCustomerCard(customer)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render customer contact info.
   * @param {Object} customer - Customer data
   * @returns {string} Contact HTML
   */
  renderContactInfo(customer) {
    const phone = customer.phone
      ? `<div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-gray-400">📞</span><span>${customer.phone}</span></div>`
      : '';
    const email = customer.email
      ? `<div class="flex items-center gap-2 text-sm text-gray-600"><span class="text-gray-400">✉️</span><span class="truncate">${customer.email}</span></div>`
      : '';
    return `<div class="space-y-1.5">${phone}${email}</div>`;
  }

  /**
   * Render customer action buttons.
   * @param {Object} customer - Customer data
   * @returns {string} Buttons HTML
   */
  renderCustomerActions(customer) {
    if (customer.name.toLowerCase() === 'guest') {
      return '';
    }
    return `
      <div class="flex gap-2 mt-4">
        <button onclick="customersScreen.editCustomer('${customer.id}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">Edit</button>
        <button onclick="customersScreen.handleDelete('${customer.id}')" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">Delete</button>
      </div>
    `;
  }

  /**
   * Render a customer card.
   * @param {Object} customer - Customer data
   * @returns {string} Card HTML
   */
  renderCustomerCard(customer) {
    const orderCount = store.state.orders.filter(
      (ord) => ord.customer?.id === customer.id
    ).length;
    const orderLabel =
      orderCount > 0
        ? `<div class="text-xs text-gray-500 mt-0.5">${orderCount} order${orderCount !== 1 ? 's' : ''}</div>`
        : '';

    return `
      <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-5">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">${customer.name.charAt(0).toUpperCase()}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <div class="font-bold text-lg text-gray-900 truncate">${customer.name}</div>
                ${orderLabel}
              </div>
            </div>
            ${this.renderContactInfo(customer)}
            ${this.renderCustomerActions(customer)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get filtered customers.
   * @returns {Array} Filtered customers
   */
  getFilteredCustomers() {
    const query = this.searchQuery.toLowerCase();

    if (!query) {
      return store.state.customers;
    }

    return store.state.customers.filter(
      (cust) =>
        cust.name.toLowerCase().includes(query) ||
        cust.phone.includes(query) ||
        cust.email.toLowerCase().includes(query)
    );
  }

  /**
   * Get customer statistics.
   * @returns {Object} Statistics
   */
  getCustomerStats() {
    const customers = store.state.customers;
    const orders = store.state.orders;

    const customersWithOrders = new Set(
      orders.filter((ord) => ord.customer?.id).map((ord) => ord.customer.id)
    );

    return {
      total: customers.length,
      withOrders: customersWithOrders.size,
    };
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  updateSearchQuery(query) {
    this.searchQuery = query;
    this.updateCustomerList();
  }

  showAddCustomerForm() {
    this.editing = null;
    this.showCustomerModal();
  }

  editCustomer(customerId) {
    this.editing = store.state.customers.find((cust) => cust.id === customerId);
    if (this.editing) {
      this.showCustomerModal();
    }
  }

  /**
   * Get customer form HTML.
   * @param {Object} customer - Customer data
   * @returns {string} Form HTML
   */
  getCustomerFormHtml(customer) {
    return `
      <form id="customer-form" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" value="${customer.name}" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="Customer name" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" name="phone" value="${customer.phone}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="07XXXXXXXX" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value="${customer.email}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="email@example.com" /></div>
      </form>
    `;
  }

  /**
   * Show customer add/edit modal.
   */
  showCustomerModal() {
    const isEdit = !!this.editing;
    const customer = this.editing || { name: '', phone: '', email: '' };

    createModal({
      title: isEdit ? 'Edit Customer' : 'Add Customer',
      html: this.getCustomerFormHtml(customer),
      actions: [
        { label: 'Cancel', variant: 'secondary' },
        {
          label: isEdit ? 'Save Changes' : 'Add Customer',
          variant: 'primary',
          onClick: () => this.handleSaveCustomer(isEdit),
        },
      ],
    });
  }

  /**
   * Handle save customer.
   * @param {boolean} isEdit - Whether editing
   */
  handleSaveCustomer(isEdit) {
    const form = document.getElementById('customer-form');
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');

    if (!name) {
      toast('Please enter a name', 'error');
      return;
    }

    if (isEdit && this.editing) {
      const result = updateCustomer(this.editing.id, { name, phone, email });
      if (result) {
        toast('Customer updated', 'success');
      } else {
        toast('Failed to update customer', 'error');
        return;
      }
    } else {
      const result = addCustomer(name, phone, email);
      if (result) {
        toast('Customer added', 'success');
      } else {
        toast('Failed to add customer. Phone may already exist.', 'error');
        return;
      }
    }

    this.editing = null;
    this.updateCustomerList();
  }

  async handleDelete(customerId) {
    const customer = store.state.customers.find(
      (cust) => cust.id === customerId
    );
    if (!customer) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete "${customer.name}"?`,
      confirmText: 'Delete',
      danger: true,
    });

    if (confirmed) {
      const result = deleteCustomer(customerId);
      if (result) {
        toast('Customer deleted', 'info');
        this.updateCustomerList();
      } else {
        toast('Cannot delete this customer', 'error');
      }
    }
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================

  updateCustomerList() {
    const customers = this.getFilteredCustomers();
    const listEl = document.querySelector('[data-customer-list]');

    if (listEl) {
      if (customers.length === 0) {
        listEl.innerHTML = `
          <div class="text-center text-gray-400 py-20">
            <div class="text-7xl mb-4">👥</div>
            <div class="text-xl font-medium">No customers found</div>
            <div class="text-sm mt-2">${
              this.searchQuery
                ? 'Try adjusting your search'
                : 'Add your first customer to get started'
            }</div>
          </div>
        `;
      } else {
        listEl.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${customers.map((cust) => this.renderCustomerCard(cust)).join('')}
          </div>
        `;
      }
    }

    // Update stats
    const showingEl = document.querySelector('[data-stat-showing]');
    if (showingEl) {
      showingEl.textContent = customers.length;
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  mount() {
    window.customersScreen = this;
  }

  unmount() {
    delete window.customersScreen;
  }
}

export default CustomersScreen;
