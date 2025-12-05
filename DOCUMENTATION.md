# 🍔 GrillMaster POS - Technical Documentation

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Core Modules](#4-core-modules)
5. [Feature Modules](#5-feature-modules)
6. [Data Layer](#6-data-layer)
7. [UI Components](#7-ui-components)
8. [Utilities](#8-utilities)
9. [State Management](#9-state-management)
10. [Routing System](#10-routing-system)
11. [Data Persistence](#11-data-persistence)
12. [API Reference](#12-api-reference)
13. [Getting Started](#13-getting-started)
14. [Project Structure](#14-project-structure)

---

## 1. Project Overview

**GrillMaster POS** is a professional, production-quality Point of Sale (POS) system built with vanilla JavaScript. It is designed specifically for restaurant operations, providing a comprehensive solution for order management, menu management, customer tracking, and sales analytics.

### Key Features

| Feature                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| 📊 **Dashboard**           | Real-time analytics, sales overview, top-selling products, and revenue tracking |
| 🛒 **POS Interface**       | Fast product selection with intuitive cart management and checkout flow         |
| 📋 **Order Management**    | Track orders with status updates (preparing, completed, cancelled)              |
| 👥 **Customer Management** | Customer database with contact information and order history                    |
| 🍽️ **Menu Management**     | Full CRUD operations for products with categories                               |
| 💰 **Payment Processing**  | Multiple payment methods, discounts (percentage/flat), and tax calculations     |
| 💾 **Local Storage**       | Persistent data across browser sessions                                         |

### Business Configuration

- **Currency**: Sri Lankan Rupee (LKR)
- **Default Tax Rate**: 15%
- **Order Types**: Dine-in, Takeaway, Delivery

---

## 2. Technology Stack

| Technology       | Version | Purpose                                            |
| ---------------- | ------- | -------------------------------------------------- |
| **JavaScript**   | ES6+    | Core programming language (vanilla, no frameworks) |
| **Vite**         | 5.x     | Build tool and development server                  |
| **Tailwind CSS** | CDN     | Utility-first CSS framework for styling            |
| **ESLint**       | 8.x     | Code linting and quality enforcement               |
| **Prettier**     | 3.x     | Code formatting                                    |

### No Runtime Dependencies

This project intentionally uses **zero runtime dependencies**, relying solely on vanilla JavaScript and browser APIs. This results in:

- Smaller bundle size
- Faster load times
- No dependency management overhead
- Full control over the codebase

---

## 3. Architecture

### Design Patterns

| Pattern              | Implementation           | Purpose                                            |
| -------------------- | ------------------------ | -------------------------------------------------- |
| **Observable State** | `createStore()`          | Reactive state management with subscriptions       |
| **MVC**              | Screens/Store separation | Separation of concerns between views and data      |
| **Module Pattern**   | ES Modules               | Encapsulation, reusability, and tree-shaking       |
| **Factory Pattern**  | `createRouter()`         | Object creation abstraction                        |
| **Barrel Exports**   | `index.js` files         | Clean import paths                                 |
| **Screen-based SPA** | Hash Router              | Single Page Application with hash-based navigation |

### Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                              │                                   │
│                         main.js                                  │
│                              │                                   │
│                         initApp()                                │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │      App Class    │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │  createRouter()   │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│   HomeScreen           POSScreen           OrdersScreen         │
│   MenuScreen        CustomersScreen      NewOrderScreen         │
│                                                                  │
│                    ┌─────────┴─────────┐                        │
│                    │   Central Store   │                        │
│                    │   (Observable)    │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   localStorage    │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Modules

### 4.1 Application Bootstrap (`core/app.js`)

The main entry point that initializes the application.

```javascript
class App {
  constructor()           // Initialize properties
  init()                  // Setup root element and router
  navigate(route)         // Navigate to a specific route
  render()                // Trigger current screen render
}

function initApp()        // Bootstrap the application
```

**Key Responsibilities:**

- Find and validate the root `#app` element
- Create and configure the router
- Expose the app globally via `window.app`

### 4.2 Router (`core/router.js`)

Hash-based SPA router handling navigation between screens.

```javascript
function createRouter(config) {
  // config: { root, routes, defaultRoute }

  return {
    navigate(route, params)  // Navigate to route
    render()                 // Render current screen
    init()                   // Initialize router and listeners
  }
}
```

**Features:**

- Hash-based navigation (`#home`, `#pos`, etc.)
- Screen lifecycle management (mount/unmount)
- Automatic scroll to top on navigation
- Default route fallback

### 4.3 State Management (`core/state.js`)

Observable store implementation for reactive state.

```javascript
function createStore(initialState) {
  return {
    getState()              // Get copy of current state
    setState(updater)       // Update state (object or function)
    subscribe(listener)     // Subscribe to state changes
    state                   // Direct state access (getter)
  }
}
```

**Features:**

- Immutable state updates
- Subscription-based reactivity
- Error handling for listeners
- Functional or object-based updates

### 4.4 Constants (`core/constants.js`)

Centralized configuration and magic values.

```javascript
// Business Constants
DEFAULT_TAX_RATE = 15
CURRENCY = { CODE: 'LKR', LOCALE: 'en-LK', SYMBOL: 'Rs.' }

// Order Types
ORDER_TYPES = { DINE_IN, TAKEAWAY, DELIVERY }

// Storage Keys
STORAGE_KEYS = { PRODUCTS, ORDERS, CUSTOMERS, CART, ... }

// Routes
ROUTES = { HOME, NEW_ORDER, POS, ORDERS, MENU, CUSTOMERS }
```

---

## 5. Feature Modules

Each feature is a self-contained module in the `features/` directory.

### 5.1 Home Screen (`features/home/home.screen.js`)

**Purpose:** Dashboard with analytics and quick navigation.

**Components:**

- Header with real-time clock
- "Start New Order" button
- Stats grid (today's revenue, total revenue, average order value, orders today)
- Top products section
- Quick navigation tiles

**Methods:**
| Method | Description |
|--------|-------------|
| `render()` | Render complete dashboard |
| `renderHeader()` | Render header with clock |
| `renderStatsGrid()` | Render statistics cards |
| `renderTopProducts()` | Render top-selling products |
| `renderQuickNav()` | Render navigation tiles |
| `mount()` | Start clock interval |
| `unmount()` | Clear clock interval |

### 5.2 New Order Screen (`features/new-order/new-order.screen.js`)

**Purpose:** Initialize a new order with type and customer selection.

**Features:**

- Order type selection (Dine-in, Takeaway, Delivery)
- Customer search and selection
- Add new customer inline
- Proceed to POS

**State:**

- `selectedType` - Current order type
- `query` - Customer search query
- `showAddForm` - Toggle add customer form
- `newName`, `newPhone`, `newEmail` - New customer fields

### 5.3 POS Screen (`features/pos/pos.screen.js`)

**Purpose:** Main point of sale interface for order processing.

**Features:**

- Category-based product filtering
- Product grid with images and prices
- Shopping cart management
- Quantity adjustment
- Checkout flow with:
  - Discount application (percentage or flat)
  - Tax calculation
  - Payment method selection
  - Cash amount input with quick values
  - Change calculation

**State:**

```javascript
{
  selectedCategory: 'All',
  showCheckout: false,
  showSuccess: false,
  lastOrderId: null,
  discountType: 'none',      // 'none' | 'percent' | 'flat'
  discountValue: 0,
  taxRate: 15,
  amountReceived: 0,
  paymentMethod: 'cash'      // 'cash' | 'card'
}
```

**Methods:**
| Method | Description |
|--------|-------------|
| `handleAddToCart(productId)` | Add product to cart |
| `handleRemoveFromCart(productId)` | Remove product from cart |
| `handleUpdateQuantity(productId, qty)` | Update item quantity |
| `openCheckout()` | Open checkout modal |
| `processPayment()` | Complete order transaction |

### 5.4 Orders Screen (`features/orders/orders.screen.js`)

**Purpose:** View and manage all orders.

**Features:**

- Order statistics (total, revenue, preparing, unpaid)
- Tab filtering (All/Today)
- Status filtering (completed, preparing, cancelled, paid, unpaid)
- Search by order number or customer
- Order actions:
  - Mark as completed
  - Mark as paid
  - View details
  - Delete order

**Methods:**
| Method | Description |
|--------|-------------|
| `setTab(tab)` | Switch between All/Today |
| `setFilter(filter)` | Apply status filter |
| `updateSearchQuery(query)` | Update search query |
| `updateStatus(orderId, status)` | Update order status |
| `handleMarkPaid(orderId)` | Mark order as paid |
| `viewDetails(orderId)` | Show order details modal |
| `handleDelete(orderId)` | Delete order with confirmation |

### 5.5 Menu Screen (`features/menu/menu.screen.js`)

**Purpose:** Manage menu items (products).

**Features:**

- Product statistics (total items, categories, average price)
- Search products
- Sort by name, price, or category
- Category tabs
- Add/Edit/Delete products
- Product form with emoji picker

**Methods:**
| Method | Description |
|--------|-------------|
| `selectCategory(category)` | Filter by category |
| `updateSearchQuery(query)` | Search products |
| `setSortBy(sortBy)` | Change sort order |
| `openModal()` | Open add/edit modal |
| `saveProduct()` | Save product changes |
| `handleDelete(productId)` | Delete product |

### 5.6 Customers Screen (`features/customers/customers.screen.js`)

**Purpose:** Manage customer records.

**Features:**

- Customer statistics (total, with orders)
- Search by name, phone, or email
- Add new customers
- Edit customer information
- Delete customers (except Guest)
- View order history per customer

**Methods:**
| Method | Description |
|--------|-------------|
| `showAddCustomerForm()` | Show add form modal |
| `editCustomer(customerId)` | Edit customer modal |
| `handleDelete(customerId)` | Delete with confirmation |
| `updateSearchQuery(query)` | Filter customers |

---

## 6. Data Layer

### 6.1 Store (`data/store.js`)

Central data store managing all application state.

#### State Shape

```javascript
{
  products: Product[],
  orders: Order[],
  customers: Customer[],
  cart: CartItem[],
  currentCustomer: Customer | null,
  currentOrderType: 'dine-in' | 'takeaway' | 'delivery'
}
```

#### Type Definitions

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string; // Emoji
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  customer: Customer | null;
  orderType: string;
  subtotal: number;
  discountValue: number;
  discountType: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountReceived: number;
  changeDue: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  status: 'preparing' | 'completed' | 'cancelled';
  timestamp: string;
}
```

#### Exported Actions

| Action                                    | Parameters             | Description            |
| ----------------------------------------- | ---------------------- | ---------------------- |
| `addToCart(product)`                      | Product                | Add product to cart    |
| `removeFromCart(productId)`               | number                 | Remove item from cart  |
| `updateCartQuantity(productId, quantity)` | number, number         | Update quantity        |
| `clearCart()`                             | -                      | Empty the cart         |
| `getCartTotal()`                          | -                      | Calculate cart total   |
| `getCartCount()`                          | -                      | Count cart items       |
| `setCurrentCustomer(customer)`            | Customer               | Set current customer   |
| `addCustomer(name, phone, email)`         | string, string, string | Create customer        |
| `updateCustomer(id, updates)`             | number, object         | Update customer        |
| `deleteCustomer(customerId)`              | number                 | Delete customer        |
| `setOrderType(type)`                      | string                 | Set order type         |
| `placeOrder(paymentMethod, opts)`         | string, object         | Create order           |
| `updateOrder(orderId, updates)`           | string, object         | Update order           |
| `deleteOrder(orderId)`                    | string                 | Delete order           |
| `markOrderPaid(orderId)`                  | string                 | Mark as paid           |
| `addProduct(data)`                        | object                 | Create product         |
| `updateProduct(id, updates)`              | number, object         | Update product         |
| `deleteProduct(productId)`                | number                 | Delete product         |
| `getOrderStats()`                         | -                      | Get order statistics   |
| `resetData()`                             | -                      | Reset to demo data     |
| `loadState()`                             | -                      | Load from localStorage |

### 6.2 Demo Data (`data/demo-data.js`)

Sample data for initial application state.

**Customers:** 11 sample customers including Guest
**Products:** 24 menu items across categories:

- Beef Burgers (4 items)
- Chicken Burgers (3 items)
- Veggie Burger (2 items)
- Sides (4 items)
- Beverages (5 items)
- Desserts (3 items)
- Combos (3 items)

**Orders:** 2 sample completed orders

---

## 7. UI Components

### 7.1 Header (`ui/header.js`)

Reusable screen header component.

```javascript
Header({
  left: string,      // Left section HTML
  center: string,    // Center section HTML
  right: string,     // Right section HTML
  className: string  // Additional CSS classes
}) → string
```

### 7.2 Badge (`ui/badge.js`)

Status indicator badges.

```javascript
Badge({
  text: string,
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info',
  className: string
}) → string

StatusBadge(status, mappings?) → string
```

**Preset Status Mappings:**
| Status | Variant | Display |
|--------|---------|---------|
| preparing | warning | Preparing |
| ready | info | Ready |
| completed | success | Completed |
| cancelled | danger | Cancelled |
| paid | success | Paid |
| unpaid | danger | Unpaid |

### 7.3 Modal (`ui/modal.js`)

Modal dialogs and toast notifications.

```javascript
// Create modal dialog
createModal({
  title: string,
  html: string,
  actions: ModalAction[],
  closeOnOverlay: boolean
}) → { overlay, close }

// Confirmation dialog
confirm(message) → Promise<boolean>

// Toast notification
toast(message, type?) → void
```

**Toast Types:** `success` | `error` | `warning` | `info`

### 7.4 DOM Utilities (`ui/dom-utils.js`)

Helper functions for DOM manipulation.

```javascript
updateSection(selector, html); // Update element innerHTML
updateText(selector, text); // Update element textContent
```

---

## 8. Utilities

### 8.1 Helpers (`utils/helpers.js`)

Pure utility functions.

```javascript
// Format number as LKR currency
formatCurrency(amount) → string
// Example: formatCurrency(1500) → "LKR 1,500.00"

// Format date in friendly format
formatDate(dateInput) → string
// Example: "Dec 5, 2025, 10:30 AM"

// Get unique categories from products
getCategories(products) → string[]

// Generate unique ID
generateId(prefix?) → string
// Example: "m1k2j3h4g5f6d7"
```

### 8.2 Storage (`utils/storage.js`)

LocalStorage utilities with error handling.

```javascript
// Save data to localStorage
saveToStorage(key, data) → boolean

// Load data from localStorage
loadFromStorage(key, defaultValue) → any
```

---

## 9. State Management

The application uses a custom observable store pattern:

### Creating a Store

```javascript
import { createStore } from './core/state.js';

const store = createStore({
  count: 0,
  items: [],
});
```

### Reading State

```javascript
// Get a copy of state
const state = store.getState();

// Direct access (be careful with mutations)
const items = store.state.items;
```

### Updating State

```javascript
// Object update
store.setState({ count: 5 });

// Functional update
store.setState((state) => ({
  count: state.count + 1,
}));
```

### Subscribing to Changes

```javascript
const unsubscribe = store.subscribe((newState) => {
  console.log('State changed:', newState);
});

// Later: cleanup
unsubscribe();
```

---

## 10. Routing System

Hash-based SPA routing for browser compatibility.

### Route Definitions

| Route     | Path         | Screen          |
| --------- | ------------ | --------------- |
| Home      | `#home`      | HomeScreen      |
| New Order | `#new-order` | NewOrderScreen  |
| POS       | `#pos`       | POSScreen       |
| Orders    | `#orders`    | OrdersScreen    |
| Menu      | `#menu`      | MenuScreen      |
| Customers | `#customers` | CustomersScreen |

### Navigation

```javascript
// Using app.navigate()
app.navigate('pos');

// Using HTML onclick
<button onclick="app.navigate('orders')">View Orders</button>;

// Direct hash change
window.location.hash = 'menu';
```

### Screen Lifecycle

Each screen can implement lifecycle methods:

```javascript
class MyScreen {
  constructor(options) {
    this.router = options.router;
  }

  render() {
    return '<div>...</div>';
  }

  mount() {
    // Called after render, setup event listeners
  }

  unmount() {
    // Called before navigating away, cleanup
  }
}
```

---

## 11. Data Persistence

All application data is persisted to browser localStorage.

### Storage Keys

| Key                            | Data               |
| ------------------------------ | ------------------ |
| `grillmaster_products`         | Product catalog    |
| `grillmaster_orders`           | Order history      |
| `grillmaster_customers`        | Customer database  |
| `grillmaster_cart`             | Current cart items |
| `grillmaster_current_customer` | Selected customer  |
| `grillmaster_order_type`       | Current order type |

### Persistence Flow

1. **On State Change:** `saveState()` is called automatically
2. **On App Load:** `loadState()` hydrates store from localStorage
3. **Fallback:** If no stored data, demo data is used

### Manual Reset

```javascript
import { resetData } from './data/store.js';
resetData(); // Clears localStorage and reloads demo data
```

---

## 12. API Reference

### Store Actions Quick Reference

#### Cart Operations

```javascript
addToCart(product)
removeFromCart(productId)
updateCartQuantity(productId, quantity)
clearCart()
getCartTotal() → number
getCartCount() → number
```

#### Customer Operations

```javascript
setCurrentCustomer(customer)
addCustomer(name, phone?, email?) → Customer | false
updateCustomer(id, updates) → Customer | false
deleteCustomer(customerId) → boolean
```

#### Order Operations

```javascript
setOrderType(type)
placeOrder(paymentMethod, options?) → Order | null
updateOrder(orderId, updates) → Order | false
deleteOrder(orderId) → boolean
markOrderPaid(orderId) → boolean
getOrderStats() → { total, today, revenue, todayRevenue }
```

#### Product Operations

```javascript
addProduct(data) → Product
updateProduct(id, updates) → Product | false
deleteProduct(productId) → boolean
```

---

## 13. Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd grillmaster-pos

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start Vite dev server (port 3000) |
| `npm run build`    | Build for production              |
| `npm run preview`  | Preview production build          |
| `npm run lint`     | Run ESLint checks                 |
| `npm run lint:fix` | Auto-fix ESLint issues            |
| `npm run format`   | Format with Prettier              |

### Production Build

```bash
npm run build
```

Creates an optimized build in `dist/` with:

- Minified JavaScript bundles
- Source maps
- Tree-shaken modules

---

## 14. Project Structure

```
grillmaster-pos/
├── src/
│   ├── core/                    # Core application modules
│   │   ├── app.js              # Application bootstrap
│   │   ├── constants.js        # Global constants & config
│   │   ├── router.js           # Hash-based SPA router
│   │   └── state.js            # Observable state management
│   │
│   ├── features/                # Feature-based modules
│   │   ├── home/
│   │   │   └── home.screen.js  # Dashboard screen
│   │   ├── new-order/
│   │   │   └── new-order.screen.js
│   │   ├── pos/
│   │   │   └── pos.screen.js   # Main POS interface
│   │   ├── orders/
│   │   │   └── orders.screen.js
│   │   ├── menu/
│   │   │   └── menu.screen.js  # Product management
│   │   └── customers/
│   │       └── customers.screen.js
│   │
│   ├── ui/                      # Reusable UI components
│   │   ├── badge.js            # Status badges
│   │   ├── dom-utils.js        # DOM helpers
│   │   ├── header.js           # Page header
│   │   └── modal.js            # Modal & toast
│   │
│   ├── utils/                   # Utility functions
│   │   ├── helpers.js          # Formatting, ID generation
│   │   └── storage.js          # localStorage utilities
│   │
│   ├── data/                    # Data layer
│   │   ├── store.js            # Central data store
│   │   └── demo-data.js        # Sample data
│   │
│   └── main.js                  # Application entry point
│
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── .eslintrc.cjs               # ESLint rules
├── .prettierrc                 # Prettier configuration
└── .gitignore                  # Git ignore rules
```

---

## License

MIT License

---

_Documentation generated for GrillMaster POS v1.0.0_
