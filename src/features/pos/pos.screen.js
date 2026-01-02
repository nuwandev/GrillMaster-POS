// POS screen: products, cart, and checkout UI (concise comments only)
import { DEFAULT_TAX_RATE } from '../../core/constants.js';
import {
  store,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  getCartCount,
  placeOrder,
} from '../../data/store.js';
import { updateSection } from '../../ui/dom-utils.js';
import { Header } from '../../ui/header.js';
import { confirm, toast } from '../../ui/modal.js';
import { formatCurrency, getCategories } from '../../utils/helpers.js';

const QUICK_CASH_VALUES = [1000, 2000, 5000, 10000];
const PERCENT_VALUES = [5, 10, 15, 20];
const FLAT_VALUES = [100, 200, 500, 1000];

export class POSScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.selectedCategory = 'All';
    this.showCheckout = false;
    this.showSuccess = false;
    this.lastOrderId = null;

    // Checkout state
    this.discountType = 'none';
    this.discountValue = 0;
    this.taxRate = DEFAULT_TAX_RATE;
    this.amountReceived = 0;
    this.paymentMethod = 'cash';
  }

  render() {
    const categories = ['All', ...getCategories(store.state.products)];
    const filteredProducts = this.getFilteredProducts();
    const currentCustomer = store.state.currentCustomer?.name || 'Guest';

    return `
      <div class="h-screen flex flex-col bg-gray-50">
        ${this.renderHeader(currentCustomer)}

        <div class="flex-1 flex min-h-0">
          <!-- Products Section -->
          <div class="flex-1 flex flex-col min-w-0">
            ${this.renderCategoryTabs(categories)}
            ${this.renderProductGrid(filteredProducts)}
          </div>

          <!-- Cart Section -->
          ${this.renderCartSection()}
        </div>

        ${this.showSuccess ? this.renderSuccessModal() : ''}
      </div>
    `;
  }

  renderHeader(customerName) {
    return Header({
      left: '<button onclick="app.navigate(\'home\')" class="text-gray-600 hover:text-gray-900 text-xl">✕</button>',
      center: '<h1 class="text-xl font-bold">POS Screen</h1>',
      right: `<span class="text-sm">Customer: <strong class="text-primary">${customerName}</strong></span>`,
    });
  }

  renderCategoryTabs(categories) {
    return `
      <div class="bg-white border-b px-6 py-3 overflow-x-auto" data-category-tabs>
        <div class="flex gap-2">
          ${categories
            .map(
              (cat) => `
            <button 
              onclick="posScreen.selectCategory('${cat}')"
              class="px-5 py-2.5 rounded-lg whitespace-nowrap font-medium shadow-sm transition-all ${
                this.selectedCategory === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }"
            >
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderProductGrid(products) {
    return `
      <div class="flex-1 overflow-y-auto p-6" data-products-scroll>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-products-grid>
          ${products
            .map(
              (product) => `
            <div 
              class="bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer border border-gray-200 hover:border-primary/30 hover-lift animate-press" 
              onclick="posScreen.handleAddToCart('${product.id}')"
            >
              <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center text-6xl">
                ${product.image || '🍽️'}
              </div>
              <div class="p-4">
                <div class="font-semibold text-gray-900 mb-1 line-clamp-1">${product.name}</div>
                <div class="text-sm text-gray-500 mb-2">${product.category}</div>
                <div class="text-lg font-bold text-primary">${formatCurrency(product.price)}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderCartSection() {
    const cart = store.state.cart;
    const total = getCartTotal();
    const count = getCartCount();

    return `
      <div data-cart-section class="w-96 bg-white border-l flex flex-col shrink-0">
        <div class="px-6 py-4 border-b">
          <h2 class="text-xl font-bold">Current Order</h2>
          <div class="text-sm text-gray-500">${count} items</div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4" data-cart-scroll>
          ${cart.length === 0 ? this.renderEmptyCart() : this.renderCartItems(cart)}
        </div>

        <div class="border-t px-6 py-4 bg-gray-50">
          ${this.renderCartFooter(total, cart.length > 0)}
        </div>
      </div>
    `;
  }

  renderEmptyCart() {
    return `
      <div class="text-center text-gray-400 mt-12">
        <div class="text-6xl mb-4">🛒</div>
        <div class="text-lg">Cart is empty</div>
        <div class="text-sm mt-1">Add items to start</div>
      </div>
    `;
  }

  renderCartItems(cart) {
    return cart
      .map(
        (item) => `
        <div class="mb-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900">${item.name}</div>
              <div class="text-sm text-gray-500">${formatCurrency(item.price)} each</div>
            </div>
            <button 
              onclick="posScreen.handleRemoveFromCart('${item.id}')"
              class="ml-2 text-red-500 hover:text-red-700 text-xl hover:bg-red-50 rounded-lg w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div class="flex items-center gap-3">
            <button 
              onclick="posScreen.handleUpdateQuantity('${item.id}', ${item.quantity - 1})"
              class="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg font-bold border border-gray-200"
            >
              −
            </button>
            <span class="w-12 text-center font-semibold text-lg">${item.quantity}</span>
            <button 
              onclick="posScreen.handleUpdateQuantity('${item.id}', ${item.quantity + 1})"
              class="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg font-bold border border-gray-200"
            >
              +
            </button>
            <div class="flex-1 text-right font-bold text-gray-900">
              ${formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  renderCartFooter(total, hasItems) {
    return `
      <div class="mb-4">
        <div class="flex justify-between text-lg mb-2">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-semibold">${formatCurrency(total)}</span>
        </div>
        <div class="flex justify-between text-2xl font-bold">
          <span>Total</span>
          <span class="text-primary">${formatCurrency(total)}</span>
        </div>
      </div>
      
      ${
        hasItems
          ? `
        <button 
          onclick="posScreen.checkout()"
          class="w-full bg-success text-white text-xl font-bold py-4 rounded-xl hover:bg-green-600 active:scale-95 transition-all shadow-sm"
        >
          Checkout
        </button>
        <button 
          onclick="posScreen.handleClearCart()"
          class="w-full mt-2 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 border border-gray-200"
        >
          Clear Cart
        </button>
      `
          : ''
      }
    `;
  }

  renderSuccessModal() {
    const order = store.state.orders.find((ord) => ord.id == this.lastOrderId);
    if (!order) {
      return '';
    }

    return `
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="text-center p-8 pb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="text-4xl">✅</div>
            </div>
            <div class="text-2xl font-bold mb-2">Payment Successful</div>
            <div class="text-gray-600">Order #${order.id} placed</div>
          </div>
          
          <div class="px-8 pb-8">
            <div class="border rounded-xl p-5 mb-6 bg-gray-50">
              <div class="flex justify-between mb-3 pb-3 border-b">
                <span class="text-gray-600">Items</span>
                <span class="font-semibold">${order.items.length}</span>
              </div>
              <div class="flex justify-between mb-3">
                <span class="text-gray-600">Total</span>
                <span class="font-bold text-xl text-primary">${formatCurrency(order.total)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Payment</span>
                <span class="font-semibold capitalize">${order.paymentMethod}</span>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button 
                onclick="posScreen.printReceipt('${order.id}')" 
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-semibold"
              >
                Print Receipt
              </button>
              <button 
                onclick="posScreen.startNewOrder()" 
                class="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-blue-600 font-semibold shadow-sm"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredProducts() {
    if (this.selectedCategory === 'All') {
      return store.state.products;
    }
    return store.state.products.filter(
      (prod) => prod.category === this.selectedCategory
    );
  }

  selectCategory(category) {
    this.selectedCategory = category;
    this.updateProductGrid();
    this.updateCategoryTabs();
  }

  handleAddToCart(productId) {
    const product = store.state.products.find((prod) => prod.id == productId);
    if (product) {
      addToCart(product);
      this.updateCartSection();
    }
  }

  handleRemoveFromCart(productId) {
    removeFromCart(productId);
    this.updateCartSection();
  }

  handleUpdateQuantity(productId, quantity) {
    if (quantity < 1) {
      this.handleRemoveFromCart(productId);
    } else {
      updateCartQuantity(productId, quantity);
      this.updateCartSection();
    }
  }

  async handleClearCart() {
    const confirmed = await confirm({
      title: 'Clear Cart',
      message: 'Remove all items from the cart?',
      confirmText: 'Clear',
    });

    if (confirmed) {
      clearCart();
      toast('Cart cleared', 'info');
      this.updateCartSection();
    }
  }

  checkout() {
    this.showCheckout = true;
    this.renderCheckoutModal();
  }

  cancelCheckout() {
    this.showCheckout = false;
    this.closeCheckoutModal();
  }

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.remove();
    }
  }

  renderCheckoutModal() {
    const modalId = 'checkout-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      document.body.appendChild(modal);
    }

    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
    const received = Number(this.amountReceived) || 0;
    const changeDue = Math.max(0, received - grandTotal);
    const amountDue = Math.max(0, grandTotal - received);
    const canConfirm = this.paymentMethod !== 'cash' || received >= grandTotal;

    modal.innerHTML = this.getCheckoutModalHTML(
      subtotal,
      discountAmt,
      taxAmt,
      grandTotal,
      received,
      changeDue,
      amountDue,
      canConfirm
    );
  }

  renderOrderSummary() {
    const cart = store.state.cart;
    const items = cart
      .map(
        (item) =>
          `<div class="flex justify-between py-3 px-4 text-sm"><span class="font-medium text-gray-700">${item.quantity}x ${item.name}</span><span class="font-semibold text-gray-900">${formatCurrency(item.price * item.quantity)}</span></div>`
      )
      .join('');
    return `
      <div class="border-2 rounded-xl p-5 bg-gray-50">
        <div class="flex items-center justify-between mb-4"><span class="font-semibold text-gray-700">Order Summary</span><span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">${getCartCount()} Items</span></div>
        <div class="divide-y max-h-40 overflow-auto bg-white rounded-lg border">${items}</div>
      </div>
    `;
  }

  renderCheckoutFooter(canConfirm) {
    const btnClass = canConfirm
      ? 'bg-success hover:bg-green-600 text-white shadow-sm cursor-pointer'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';
    const btnText = canConfirm ? 'Confirm Payment' : 'Complete Payment Info';
    return `
      <div class="px-6 py-5 border-t bg-gray-50 flex gap-3">
        <button onclick="posScreen.cancelCheckout()" class="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
        <button onclick="posScreen.confirmPayment()" ${canConfirm ? '' : 'disabled'} class="flex-1 py-4 rounded-xl font-semibold transition-all ${btnClass}">${btnText}</button>
      </div>
    `;
  }

  getCheckoutModalHTML(
    subtotal,
    discountAmt,
    taxAmt,
    grandTotal,
    received,
    changeDue,
    amountDue,
    canConfirm
  ) {
    return `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-backdrop" onclick="if(event.target === this) posScreen.cancelCheckout()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-modal" onclick="event.stopPropagation()">
          <div class="px-6 py-5 border-b flex items-center justify-between">
            <div><div class="text-2xl font-bold">Checkout</div><div class="text-sm text-gray-500 mt-1">Review and complete payment</div></div>
            <button onclick="posScreen.cancelCheckout()" class="text-gray-500 hover:text-gray-700 text-xl hover:bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center">✕</button>
          </div>
          <div class="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            ${this.renderOrderSummary()}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div data-discount-card>${this.renderDiscountCard()}</div>
              <div data-tax-card>${this.renderTaxCard(subtotal, discountAmt, taxAmt, grandTotal)}</div>
            </div>
            <div data-payment-card>${this.renderPaymentMethodCard(grandTotal, amountDue, changeDue)}</div>
          </div>
          <div data-checkout-footer>${this.renderCheckoutFooter(canConfirm)}</div>
        </div>
      </div>
    `;
  }

  renderDiscountCard() {
    const quickButtons = this.getQuickDiscountButtons();

    return `
      <div class="border-2 rounded-xl p-5 h-full flex flex-col">
        <div class="font-semibold text-gray-900 mb-4">Discount</div>
        
        <div class="flex gap-2 mb-4">
          ${['none', 'percent', 'flat']
            .map(
              (t) => `
            <button 
              onclick="posScreen.setDiscountType('${t}')" 
              class="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${this.discountType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}"
            >
              ${this.getDiscountTypeLabel(t)}
            </button>
          `
            )
            .join('')}
        </div>

        <input 
          type="number" 
          min="0" 
          ${this.discountType === 'none' ? 'disabled' : ''}
          placeholder="${this.discountType === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 100 for LKR 100'}"
          value="${this.discountValue}"
          oninput="posScreen.setDiscountValue(this.value)"
          class="w-full px-4 py-3 border-2 rounded-lg transition-all ${this.discountType === 'none' ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-primary'}" 
        />

        ${this.discountType !== 'none' ? `<div class="flex flex-wrap gap-2 mt-3">${quickButtons}</div>` : ''}
      </div>
    `;
  }

  renderTaxCard(subtotal, discountAmt, taxAmt, grandTotal) {
    return `
      <div class="border-2 rounded-xl p-5 h-full flex flex-col">
        <div class="font-semibold text-gray-900 mb-4">Tax & Total</div>

        <div class="mb-4">
          <label class="text-sm text-gray-600 font-medium mb-2 block">Tax Rate (%)</label>
          <input 
            type="number" 
            min="0" 
            value="${this.taxRate}" 
            oninput="posScreen.setTaxRate(this.value)" 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary transition-all" 
          />
        </div>

        <div class="space-y-3 p-4 bg-gray-50 rounded-lg border flex-1" data-tax-totals>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-semibold">${formatCurrency(subtotal)}</span>
          </div>
          ${
            discountAmt > 0
              ? `
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Discount</span>
              <span class="font-semibold text-green-600">-${formatCurrency(discountAmt)}</span>
            </div>
          `
              : ''
          }
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Tax (${this.taxRate}%)</span>
            <span class="font-semibold">${formatCurrency(taxAmt)}</span>
          </div>
          <div class="pt-3 border-t flex justify-between items-center">
            <span class="text-lg font-bold">Total</span>
            <span class="text-2xl font-bold text-primary">${formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderTaxTotals(subtotal, discountAmt, taxAmt, grandTotal) {
    return `
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-semibold">${formatCurrency(subtotal)}</span>
      </div>
      ${
        discountAmt > 0
          ? `
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Discount</span>
          <span class="font-semibold text-green-600">-${formatCurrency(discountAmt)}</span>
        </div>
      `
          : ''
      }
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Tax (${this.taxRate}%)</span>
        <span class="font-semibold">${formatCurrency(taxAmt)}</span>
      </div>
      <div class="pt-3 border-t flex justify-between items-center">
        <span class="text-lg font-bold">Total</span>
        <span class="text-2xl font-bold text-primary">${formatCurrency(grandTotal)}</span>
      </div>
    `;
  }

  renderPaymentMethodCard(grandTotal, amountDue, changeDue) {
    return `
      <div class="border-2 rounded-xl p-5">
        <div class="font-semibold text-gray-900 mb-4">Payment Method</div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          ${['cash', 'card', 'digital', 'unpaid']
            .map(
              (m) => `
            <button 
              onclick="posScreen.setPaymentMethod('${m}')" 
              class="px-4 py-4 rounded-lg border-2 font-medium transition-all ${this.paymentMethod === m ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}"
            >
              <div class="text-2xl mb-1">${this.getPaymentMethodIcon(m)}</div>
              <div class="text-sm capitalize">${m}</div>
            </button>
          `
            )
            .join('')}
        </div>

        ${
          this.paymentMethod === 'cash'
            ? this.renderCashPaymentSection(grandTotal, amountDue, changeDue)
            : `
          <div class="bg-gray-50 border-2 rounded-lg p-6 text-center">
            <div class="text-4xl mb-2">✓</div>
            <div class="font-semibold text-gray-700">Ready to process</div>
          </div>
        `
        }
      </div>
    `;
  }

  getPaymentMethodIcon(method) {
    const icons = { cash: '💵', card: '💳', digital: '📱', unpaid: '📝' };
    return icons[method] || '💰';
  }

  renderCashPaymentSection(grandTotal, amountDue, changeDue) {
    const statusLabel = amountDue > 0 ? 'Amount Due' : 'Change';
    const statusColor = amountDue > 0 ? 'text-red-600' : 'text-green-600';
    const displayAmount = amountDue > 0 ? amountDue : changeDue;

    return `
      <div class="bg-gray-50 border-2 rounded-lg p-5">
        <div class="mb-4">
          <label class="text-sm font-semibold text-gray-700 mb-2 block">Amount Received</label>
          <input 
            type="number" 
            min="0" 
            value="${this.amountReceived}" 
            oninput="posScreen.setAmountReceived(this.value)" 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-primary" 
          />
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <button onclick="posScreen.applyExact(${grandTotal})" class="px-4 py-2 text-sm font-medium bg-primary hover:bg-blue-600 text-white rounded-lg">Exact</button>
          ${QUICK_CASH_VALUES.map((v) => `<button onclick="posScreen.applyQuickCash(${v})" class="px-4 py-2 text-sm font-medium bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-lg">₨${v}</button>`).join('')}
        </div>

        <div class="flex justify-between items-center pt-4 border-t-2">
          <span class="text-lg font-semibold">${statusLabel}</span>
          <span class="text-2xl font-bold ${statusColor}">${formatCurrency(displayAmount)}</span>
        </div>
      </div>
    `;
  }

  setDiscountType(type) {
    this.discountType = type;
    if (type === 'none') {
      this.discountValue = 0;
    }
    this.updateCheckoutModal();
  }

  setDiscountValue(value) {
    this.discountValue = Number(value) || 0;
    this.updateCheckoutModal();
  }

  setTaxRate(rate) {
    this.taxRate = Number(rate) || 0;
    this.updateTotalsOnly(); // Avoids re-rendering the input to maintain focus
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    if (method !== 'cash' && method !== 'unpaid') {
      this.amountReceived = 0;
    }
    this.updateCheckoutModal();
  }

  setAmountReceived(amount) {
    this.amountReceived = Number(amount) || 0;
    this.updateCheckoutModal();
  }

  getDiscountTypeLabel(type) {
    const labels = { none: 'None', percent: '%', flat: '₨' };
    return labels[type] || type;
  }

  getQuickDiscountButtons() {
    if (this.discountType === 'percent') {
      return PERCENT_VALUES.map(
        (v) =>
          `<button onclick="posScreen.applyQuickPercent(${v})" class="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200">${v}%</button>`
      ).join('');
    }

    if (this.discountType === 'flat') {
      return FLAT_VALUES.map(
        (v) =>
          `<button onclick="posScreen.applyQuickFlat(${v})" class="px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200">₨${v}</button>`
      ).join('');
    }

    return '';
  }

  applyQuickPercent(value) {
    this.discountType = 'percent';
    this.discountValue = value;
    this.updateCheckoutModal();
  }

  applyQuickFlat(value) {
    this.discountType = 'flat';
    this.discountValue = value;
    this.updateCheckoutModal();
  }

  applyExact(amount) {
    this.amountReceived = Math.max(0, Number(amount) || 0);
    this.updateCheckoutModal();
  }

  applyQuickCash(value) {
    this.amountReceived = value;
    this.updateCheckoutModal();
  }

  updateCheckoutModal() {
    if (!this.showCheckout) {
      return;
    }

    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);
    const received = Number(this.amountReceived) || 0;
    const changeDue = Math.max(0, received - grandTotal);
    const amountDue = Math.max(0, grandTotal - received);
    const canConfirm = this.paymentMethod !== 'cash' || received >= grandTotal;

    const discountCard = document.querySelector('[data-discount-card]');
    const taxCard = document.querySelector('[data-tax-card]');
    const paymentCard = document.querySelector('[data-payment-card]');
    const footer = document.querySelector('[data-checkout-footer]');

    if (discountCard) {
      discountCard.innerHTML = this.renderDiscountCard();
    }
    if (taxCard) {
      taxCard.innerHTML = this.renderTaxCard(
        subtotal,
        discountAmt,
        taxAmt,
        grandTotal
      );
    }
    if (paymentCard) {
      paymentCard.innerHTML = this.renderPaymentMethodCard(
        grandTotal,
        amountDue,
        changeDue
      );
    }
    if (footer) {
      footer.innerHTML = this.renderCheckoutFooter(canConfirm);
    }
  }

  // Calculates discount: percentage of subtotal or capped flat amount
  calculateDiscount(subtotal) {
    if (this.discountType === 'percent') {
      return (subtotal * (Number(this.discountValue) || 0)) / 100;
    } else if (this.discountType === 'flat') {
      return Math.min(Number(this.discountValue) || 0, subtotal);
    }
    return 0;
  }

  confirmPayment() {
    const subtotal = getCartTotal();
    const discountAmt = this.calculateDiscount(subtotal);
    const subAfterDiscount = Math.max(0, subtotal - discountAmt);
    const taxAmt = (subAfterDiscount * this.taxRate) / 100;
    const grandTotal = Math.max(0, subAfterDiscount + taxAmt);

    if (this.paymentMethod === 'cash' && this.amountReceived < grandTotal) {
      toast('Insufficient cash received', 'error');
      return;
    }

    const order = placeOrder(this.paymentMethod, {
      subtotal,
      discountType: this.discountType,
      discountValue: discountAmt,
      taxRate: this.taxRate,
      taxAmount: taxAmt,
      total: grandTotal,
      paymentStatus: this.paymentMethod === 'unpaid' ? 'unpaid' : 'paid',
      amountReceived: this.paymentMethod === 'cash' ? this.amountReceived : 0,
      changeDue:
        this.paymentMethod === 'cash'
          ? Math.max(0, this.amountReceived - grandTotal)
          : 0,
    });

    if (order) {
      this.lastOrderId = order.id;
      this.showCheckout = false;
      this.closeCheckoutModal();
      this.showSuccess = true;
      window.app.render();
      toast('Order placed successfully!', 'success');
    }
  }

  /**
   * Start a new order.
   */
  startNewOrder() {
    this.showSuccess = false;
    this.discountType = 'none';
    this.discountValue = 0;
    this.amountReceived = 0;
    this.paymentMethod = 'cash';
    this.lastOrderId = null;
    clearCart();
    window.app.navigate('new-order');
  }

  printReceipt(orderId) {
    const order = store.state.orders.find((ord) => ord.id == orderId);
    if (!order) {
      return;
    }

    const html = this.getReceiptHTML(order);
    const w = window.open('', 'PRINT', 'height=650,width=400');

    if (!w) {
      toast('Please allow popups to print receipts', 'warning');
      return;
    }

    w.document.write(html);
    w.document.close();
    w.focus();
  }

  getReceiptHTML(order) {
    return `
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: system-ui, Arial, sans-serif; padding: 16px; max-width: 400px; }
            h1 { font-size: 18px; margin: 0 0 8px; }
            .muted { color: #555; font-size: 14px; }
            .line { display: flex; justify-content: space-between; margin: 4px 0; }
            .items { margin: 12px 0; border-top: 1px dashed #ccc; padding-top: 8px; }
            .total { font-weight: 700; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>GrillMaster POS</h1>
          <div class="muted">Order #${order.id}</div>
          <div class="muted">${new Date(order.timestamp).toLocaleString()}</div>
          <div class="items">
            ${order.items.map((item) => `<div class="line"><span>${item.quantity}x ${item.name}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`).join('')}
          </div>
          <div class="line"><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
          ${order.discountValue > 0 ? `<div class="line"><span>Discount</span><span>-${formatCurrency(order.discountValue)}</span></div>` : ''}
          ${order.taxAmount > 0 ? `<div class="line"><span>Tax (${order.taxRate}%)</span><span>${formatCurrency(order.taxAmount)}</span></div>` : ''}
          <div class="line total"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
          ${order.amountReceived ? `<div class="line"><span>Received</span><span>${formatCurrency(order.amountReceived)}</span></div>` : ''}
          ${order.changeDue > 0 ? `<div class="line"><span>Change</span><span>${formatCurrency(order.changeDue)}</span></div>` : ''}
          <div class="muted" style="margin-top: 12px;">Payment: ${order.paymentMethod}</div>
          <div class="muted" style="margin-top: 12px; text-align: center;">Thank you!</div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;
  }

  updateCartSection() {
    updateSection('[data-cart-section]', this.renderCartSection());
  }

  updateProductGrid() {
    const products = this.getFilteredProducts();
    updateSection(
      '[data-products-grid]',
      this.renderProductGridContent(products),
      false
    );
  }

  renderProductGridContent(products) {
    return products
      .map(
        (product) => `
        <div 
          class="bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer border border-gray-200 hover:border-primary/30 hover-lift animate-press" 
          onclick="posScreen.handleAddToCart('${product.id}')"
        >
          <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center text-6xl">
            ${product.image || '🍽️'}
          </div>
          <div class="p-4">
            <div class="font-semibold text-gray-900 mb-1 line-clamp-1">${product.name}</div>
            <div class="text-sm text-gray-500 mb-2">${product.category}</div>
            <div class="text-lg font-bold text-primary">${formatCurrency(product.price)}</div>
          </div>
        </div>
      `
      )
      .join('');
  }

  updateCategoryTabs() {
    const categories = ['All', ...getCategories(store.state.products)];
    updateSection('[data-category-tabs]', this.renderCategoryTabs(categories));
  }

  mount() {
    window.posScreen = this;
    clearCart();
  }

  unmount() {
    delete window.posScreen;
    this.closeCheckoutModal();
  }
}

export default POSScreen;
