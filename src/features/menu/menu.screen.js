/**
 * @fileoverview Menu Screen - Manage products/menu items.
 */

import {
  store,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../../data/store.js';
import { Header } from '../../ui/header.js';
import { confirm, toast, createModal } from '../../ui/modal.js';
import { formatCurrency, getCategories } from '../../utils/helpers.js';

/**
 * Menu screen controller.
 */
export class MenuScreen {
  /**
   * @param {Object} options - Screen options
   */
  constructor(options = {}) {
    this.router = options.router;
    this.selectedCategory = 'All';
    this.showModal = false;
    this.editingProduct = null;
    this.searchQuery = '';
    this.sortBy = 'name';
  }

  /**
   * Render the menu screen.
   * @returns {string} HTML string
   */
  render() {
    const categories = ['All', ...getCategories(store.state.products)];
    const filteredProducts = this.getFilteredProducts();

    return `
      <div class="min-h-screen flex flex-col bg-gray-50">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-gray-600 hover:text-gray-900 text-xl">← Back</button>',
          center: '<h1 class="text-xl font-bold">Menu Management</h1>',
          right:
            '<button onclick="menuScreen.openModal()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm">+ Add Item</button>',
        })}

        ${this.renderStatsBar(categories)}
        ${this.renderSearchFilters()}
        ${this.renderCategoryTabs(categories)}
        ${this.renderProductsGrid(filteredProducts)}
      </div>
    `;
  }

  /**
   * Render stats bar.
   * @param {string[]} categories - Categories list
   * @returns {string} Stats HTML
   */
  renderStatsBar(categories) {
    const products = store.state.products;
    const avgPrice =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length
        : 0;

    return `
      <div class="bg-white border-b px-6 py-4">
        <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${products.length}</div>
            <div class="text-sm text-gray-500">Total Items</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${categories.length - 1}</div>
            <div class="text-sm text-gray-500">Categories</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">${formatCurrency(avgPrice)}</div>
            <div class="text-sm text-gray-500">Avg Price</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${this.getFilteredProducts().length}</div>
            <div class="text-sm text-gray-500">Showing</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render search and filter controls.
   * @returns {string} Controls HTML
   */
  renderSearchFilters() {
    return `
      <div class="bg-white border-b px-6 py-4">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value="${this.searchQuery}"
            oninput="menuScreen.updateSearchQuery(this.value)"
            class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
          <select
            onchange="menuScreen.setSortBy(this.value)"
            class="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-medium"
          >
            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Sort by Name</option>
            <option value="price-low" ${this.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price-high" ${this.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
            <option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>Sort by Category</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Render category tabs.
   * @param {string[]} categories - Categories list
   * @returns {string} Tabs HTML
   */
  renderCategoryTabs(categories) {
    return `
      <div class="bg-white border-b px-6 py-3 overflow-x-auto" data-category-tabs>
        <div class="max-w-6xl mx-auto flex gap-2">
          ${categories
            .map(
              (cat) => `
            <button 
              onclick="menuScreen.selectCategory('${cat}')"
              class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                this.selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }"
            >
              ${cat} ${
                cat === 'All'
                  ? `(${store.state.products.length})`
                  : `(${store.state.products.filter((prod) => prod.category === cat).length})`
              }
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render products grid.
   * @param {Array} products - Filtered products
   * @returns {string} Grid HTML
   */
  renderProductsGrid(products) {
    if (products.length === 0) {
      return `
        <div class="flex-1 overflow-y-auto p-6">
          <div class="max-w-6xl mx-auto">
            <div class="text-center py-20 text-gray-400">
              <div class="text-7xl mb-4">🍽️</div>
              <div class="text-xl font-medium">No products found</div>
              <div class="text-sm mt-2">Try adjusting your search or filters</div>
              <button 
                onclick="menuScreen.openModal()" 
                class="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-products-grid>
            ${products.map((product) => this.renderProductCard(product)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a product card.
   * @param {Object} product - Product data
   * @returns {string} Card HTML
   */
  renderProductCard(product) {
    return `
      <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
        <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center text-7xl">
          ${product.image || '🍽️'}
        </div>
        
        <div class="p-5">
          <div class="mb-3">
            <div class="font-bold text-xl text-gray-900 mb-1">${product.name}</div>
            <div class="text-sm text-gray-500">${product.category}</div>
          </div>
          
          <div class="text-2xl font-bold text-primary mb-4">
            ${formatCurrency(product.price)}
          </div>

          <div class="flex gap-2">
            <button 
              onclick="menuScreen.openEditModal('${product.id}')"
              class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
            >
              Edit
            </button>
            <button 
              onclick="menuScreen.handleDelete('${product.id}')"
              class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get filtered and sorted products.
   * @returns {Array} Filtered products
   */
  getFilteredProducts() {
    let products = [...store.state.products];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      products = products.filter(
        (prod) => prod.category === this.selectedCategory
      );
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      products = products.filter(
        (prod) =>
          prod.name.toLowerCase().includes(query) ||
          prod.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'category':
        products.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        products.sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  selectCategory(category) {
    this.selectedCategory = category;
    this.updateProductsGrid();
    this.updateCategoryTabs();
  }

  updateSearchQuery(query) {
    this.searchQuery = query;
    this.updateProductsGrid();
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    this.updateProductsGrid();
  }

  openModal() {
    this.editingProduct = null;
    this.showProductModal();
  }

  openEditModal(productId) {
    this.editingProduct = store.state.products.find(
      (prod) => prod.id == productId
    );
    if (this.editingProduct) {
      this.showProductModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
  }

  /**
   * Get product form HTML.
   * @param {Object} product - Product data
   * @param {Array} categories - Available categories
   * @returns {string} Form HTML
   */
  getProductFormHtml(product, categories) {
    const categoryOptions = categories
      .map((cat) => `<option value="${cat}">`)
      .join('');
    return `
      <form id="product-form" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" value="${product.name}" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="Product name" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Price *</label><input type="number" name="price" value="${product.price}" required min="0" step="0.01" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="0.00" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Category *</label><input type="text" name="category" value="${product.category}" required list="categories" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="Select or type category" /><datalist id="categories">${categoryOptions}</datalist></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Image (emoji)</label><input type="text" name="image" value="${product.image || ''}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="🍔" /></div>
      </form>
    `;
  }

  /**
   * Show product add/edit modal.
   */
  showProductModal() {
    const categories = getCategories(store.state.products);
    const isEdit = !!this.editingProduct;
    const product = this.editingProduct || {
      name: '',
      price: '',
      category: '',
      image: '',
    };

    createModal({
      title: isEdit ? 'Edit Product' : 'Add Product',
      html: this.getProductFormHtml(product, categories),
      actions: [
        { label: 'Cancel', variant: 'secondary' },
        {
          label: isEdit ? 'Save Changes' : 'Add Product',
          variant: 'primary',
          onClick: () => this.handleSaveProduct(isEdit),
        },
      ],
    });
  }

  /**
   * Handle save product.
   * @param {boolean} isEdit - Whether editing
   */
  handleSaveProduct(isEdit) {
    const form = document.getElementById('product-form');
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const image = formData.get('image') || '🍽️';

    if (!name || !category || isNaN(price)) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    if (isEdit && this.editingProduct) {
      updateProduct(this.editingProduct.id, { name, price, category, image });
      toast('Product updated', 'success');
    } else {
      addProduct(name, price, category, image);
      toast('Product added', 'success');
    }

    this.editingProduct = null;
    this.closeModal();
    this.updateProductsGrid();
    this.updateCategoryTabs();
  }

  async handleDelete(productId) {
    const product = store.state.products.find((prod) => prod.id == productId);
    if (!product) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      confirmText: 'Delete',
      danger: true,
    });

    if (confirmed) {
      deleteProduct(productId);
      toast('Product deleted', 'info');
      this.updateProductsGrid();
      this.updateCategoryTabs();
    }
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================

  updateProductsGrid() {
    const products = this.getFilteredProducts();
    const gridEl = document.querySelector('[data-products-grid]');

    if (gridEl) {
      gridEl.innerHTML = products
        .map((prod) => this.renderProductCard(prod))
        .join('');
    }
  }

  updateCategoryTabs() {
    const categories = ['All', ...getCategories(store.state.products)];
    const tabsEl = document.querySelector('[data-category-tabs]');

    if (tabsEl) {
      tabsEl.innerHTML = `
        <div class="flex gap-2 flex-wrap">
          ${categories
            .map(
              (cat) => `
            <button
              onclick="menuScreen.selectCategory('${cat}')"
              class="px-4 py-2 rounded-lg text-sm font-medium transition ${
                this.selectedCategory === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }"
            >${cat}</button>
          `
            )
            .join('')}
        </div>
      `;
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  mount() {
    window.menuScreen = this;
  }

  unmount() {
    delete window.menuScreen;
  }
}

export default MenuScreen;
