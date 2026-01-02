// New Order Screen - Select order type (dine-in/takeaway/delivery) and customer

import {
  store,
  setOrderType,
  setCurrentCustomer,
  addCustomer,
} from '../../data/store.js';
import { updateSection } from '../../ui/dom-utils.js';
import { Header } from '../../ui/header.js';
import { toast } from '../../ui/modal.js';

const MAX_CUSTOMER_DISPLAY = 12;

export class NewOrderScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.selectedType = store.state.currentOrderType || 'dine-in';
    this.query = '';
    this.showAddForm = false;
    this.newName = '';
    this.newPhone = '';
    this.newEmail = '';
  }

  render() {
    return `
      <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-gray-600 hover:text-gray-900 text-xl transition-colors">← Back</button>',
          center: '<h1 class="text-xl font-bold">New Order</h1>',
          right:
            '<span class="text-sm flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>Connected</span>',
        })}
        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <div class="max-w-6xl w-full mx-auto space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              ${this.renderOrderTypeSection()}
              ${this.renderCustomerSection()}
            </div>
            ${this.renderStartButton()}
          </div>
        </div>
      </div>
    `;
  }

  // Order type selection (dine-in, takeaway, delivery)
  renderOrderTypeSection() {
    return `
      <div data-order-type-section class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Order Type</h2>
          ${this.selectedType ? '<span class="text-xs text-green-600 font-medium">✓ Selected</span>' : '<span class="text-xs text-gray-400">Required</span>'}
        </div>
        <div class="grid grid-cols-3 gap-2 md:gap-3">
          ${this.renderOrderTypeButton('dine-in', '🍽️', 'Dine In')}
          ${this.renderOrderTypeButton('takeaway', '🥡', 'Takeaway')}
          ${this.renderOrderTypeButton('delivery', '🚗', 'Delivery')}
        </div>
      </div>
    `;
  }

  renderOrderTypeButton(type, emoji, label) {
    const isSelected = this.selectedType === type;
    return `
      <button 
        onclick="newOrderScreen.selectOrderType('${type}')"
        class="relative py-6 md:py-8 px-3 md:px-6 rounded-xl border-2 transition-all group ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 hover:scale-105'}"
      >
        ${isSelected ? '<div class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><span class="text-white text-xs">✓</span></div>' : ''}
        <div class="text-3xl md:text-4xl mb-2 transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}">${emoji}</div>
        <div class="font-semibold text-sm md:text-base">${label}</div>
      </button>
    `;
  }

  // Customer selection with search
  renderCustomerSection() {
    const selectedCustomer = store.state.currentCustomer;
    return `
      <div data-customer-section class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-800">Customer</h2>
          ${selectedCustomer ? `<span class="text-xs text-green-600 font-medium">✓ ${selectedCustomer.name}</span>` : '<span class="text-xs text-gray-400">Optional</span>'}
        </div>
        <div class="relative">
          <input type="text" data-search placeholder="🔍 Search name or phone..." value="${this.query}" oninput="newOrderScreen.handleSearchInput(this)"
            class="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-gray-400" />
          ${this.query ? '<button onclick="newOrderScreen.clearSearch()" class="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">✕</button>' : ''}
        </div>
        ${this.renderCustomerActions()}
        ${this.showAddForm ? this.renderAddCustomerForm() : ''}
        ${this.renderCustomerResults()}
      </div>
    `;
  }

  renderCustomerActions() {
    const selectedCustomer = store.state.currentCustomer;
    const filteredCustomers = this.getFilteredCustomers();
    const noResults =
      this.query && !this.showAddForm && filteredCustomers.length === 0;

    return `
      <div data-customer-actions class="flex flex-wrap gap-2 mt-3">
        <button onclick="newOrderScreen.selectGuest()" 
          class="px-4 py-2 rounded-lg border-2 ${!selectedCustomer || selectedCustomer.name === 'Guest' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'} transition-all text-sm font-medium">
          👤 Guest
        </button>
        <button onclick="newOrderScreen.toggleAddForm()" 
          class="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium">
          ➕ Add New
        </button>
        ${noResults ? `<button onclick="newOrderScreen.toggleAddForm('${this.query.replace(/"/g, '&quot;')}')" class="px-4 py-2 rounded-lg bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 transition-all text-sm font-medium shadow-sm">✨ Add "${this.query}"</button>` : ''}
      </div>
    `;
  }

  renderAddCustomerForm() {
    return `
      <div class="mt-4 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50">
        <h3 class="font-semibold text-blue-800 mb-3">Add New Customer</h3>
        <div class="space-y-3">
          <input type="text" placeholder="Name *" value="${this.newName}" oninput="newOrderScreen.setNewName(this.value)" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
          <input type="tel" placeholder="Phone" value="${this.newPhone}" oninput="newOrderScreen.setNewPhone(this.value)" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
          <input type="email" placeholder="Email" value="${this.newEmail}" oninput="newOrderScreen.setNewEmail(this.value)" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
          <div class="flex gap-2">
            <button onclick="newOrderScreen.saveNewCustomer()" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">Save</button>
            <button onclick="newOrderScreen.cancelAddForm()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  renderCustomerResults() {
    const filteredCustomers = this.getFilteredCustomers();
    if (filteredCustomers.length === 0) {
      return this.query && !this.showAddForm
        ? '<div class="mt-4 text-center py-8 text-gray-400 text-sm">No customers found</div>'
        : '';
    }

    return `
      <div class="mt-4">
        <div class="text-xs font-medium text-gray-500 mb-2 px-2">${this.query ? 'SEARCH RESULTS' : 'RECENT CUSTOMERS'}</div>
        <div class="max-h-72 overflow-y-auto divide-y border border-gray-100 rounded-xl" data-customer-list>
          ${filteredCustomers
            .slice(0, MAX_CUSTOMER_DISPLAY)
            .map((cust) => this.renderCustomerItem(cust))
            .join('')}
        </div>
      </div>
    `;
  }

  renderCustomerItem(customer) {
    const isSelected = store.state.currentCustomer?.id == customer.id;
    return `
      <div onclick="newOrderScreen.selectCustomer('${customer.id}')" class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">${customer.name.charAt(0).toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate">${customer.name}</div>
          ${customer.phone ? `<div class="text-sm text-gray-500">${customer.phone}</div>` : ''}
        </div>
        ${isSelected ? '<span class="text-blue-500">✓</span>' : ''}
      </div>
    `;
  }

  renderStartButton() {
    return `
      <div class="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent">
        <button data-start-btn onclick="newOrderScreen.startOrdering()" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl md:text-2xl font-bold py-5 md:py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" ${!this.selectedType ? 'disabled' : ''}>
          ${this.selectedType ? 'Start Ordering →' : 'Please Select Order Type'}
        </button>
      </div>
    `;
  }

  // Filter customers by search query (name or phone)
  getFilteredCustomers() {
    const query = this.query.toLowerCase();
    if (!query) {
      return store.state.customers
        .filter((c) => c.name !== 'Guest')
        .slice(0, MAX_CUSTOMER_DISPLAY);
    }
    return store.state.customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query)
    );
  }

  selectOrderType(type) {
    this.selectedType = type;
    setOrderType(type);
    updateSection('[data-order-type-section]', this.renderOrderTypeSection());
    this.updateStartButton();
  }

  handleSearchInput(input) {
    this.query = input.value;
    this.updateCustomerSection();
  }

  clearSearch() {
    this.query = '';
    this.updateCustomerSection();
  }

  selectGuest() {
    const guest = store.state.customers.find(
      (c) => c.name.toLowerCase() === 'guest'
    ) || { id: 0, name: 'Guest', phone: '', email: '' };
    setCurrentCustomer(guest);
    this.updateCustomerSection();
  }

  selectCustomer(customerId) {
    const customer = store.state.customers.find((c) => c.id == customerId);
    if (customer) {
      setCurrentCustomer(customer);
      this.updateCustomerSection();
    }
  }

  toggleAddForm(prefillName = '') {
    this.showAddForm = !this.showAddForm;
    this.newName = prefillName;
    this.newPhone = '';
    this.newEmail = '';
    this.updateCustomerSection();
  }

  cancelAddForm() {
    this.showAddForm = false;
    this.newName = '';
    this.newPhone = '';
    this.newEmail = '';
    this.updateCustomerSection();
  }

  setNewName(value) {
    this.newName = value;
  }
  setNewPhone(value) {
    this.newPhone = value;
  }
  setNewEmail(value) {
    this.newEmail = value;
  }

  saveNewCustomer() {
    if (!this.newName.trim()) {
      toast('Please enter a name', 'error');
      return;
    }
    const customer = addCustomer(this.newName, this.newPhone, this.newEmail);
    if (customer) {
      setCurrentCustomer(customer);
      toast(`Customer "${customer.name}" added`, 'success');
      this.showAddForm = false;
      this.newName = '';
      this.newPhone = '';
      this.newEmail = '';
      this.query = '';
      this.updateCustomerSection();
    } else {
      toast('Failed to add customer', 'error');
    }
  }

  startOrdering() {
    if (!this.selectedType) {
      toast('Please select an order type', 'warning');
      return;
    }
    window.app.navigate('pos');
  }

  updateCustomerSection() {
    updateSection('[data-customer-section]', this.renderCustomerSection());
  }

  updateStartButton() {
    const btn = document.querySelector('[data-start-btn]');
    if (btn) {
      btn.disabled = !this.selectedType;
      btn.textContent = this.selectedType
        ? 'Start Ordering →'
        : 'Please Select Order Type';
    }
  }

  // Expose this screen instance globally for onclick handlers
  mount() {
    window.newOrderScreen = this;
  }
  unmount() {
    delete window.newOrderScreen;
  }
}

export default NewOrderScreen;
