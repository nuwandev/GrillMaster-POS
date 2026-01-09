<div align="center">

# 🍔 GrillMaster POS

### A Professional Point of Sale System for Restaurant Operations

_Built with Vanilla JavaScript • Zero Dependencies • Modern Architecture_

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.x-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📖 About

**GrillMaster POS** is a professional, production-quality Point of Sale system designed specifically for restaurant operations. Built entirely with vanilla JavaScript (no frameworks), it demonstrates modern web development practices while maintaining excellent performance and zero runtime dependencies.

### Why GrillMaster POS?

- 🚀 **Lightning Fast** - No framework overhead, pure JavaScript performance
- 📦 **Zero Dependencies** - No runtime dependencies to manage or update
- 🎨 **Modern UI** - Beautiful, responsive interface with Tailwind CSS
- 💾 **Offline Ready** - Works without internet using localStorage
- 🔧 **Easy to Customize** - Clean, modular architecture
- 🔄 **API Ready** - Architecture designed for easy backend integration

---

## 💾 Data Persistence

### Current: localStorage-Based

All data is stored locally in your browser using localStorage. This means:

**Advantages:**

- ✅ Works completely offline
- ✅ No backend server required
- ✅ Instant response times
- ✅ Free hosting (static site)
- ✅ Perfect for single-device use

**Limitations:**

- ⚠️ Data is device-specific (not synced across devices)
- ⚠️ Storage limit: ~5-10MB (sufficient for thousands of orders)
- ⚠️ Clearing browser data will erase all data

**Data Stored:**

- Products (menu items)
- Orders (transaction history)
- Customers (contact information)
- Current cart
- Current order type (dine-in/takeaway/delivery)

### Future: API Integration

The codebase is architected for easy migration to a REST API backend:

```javascript
// Current: localStorage (immediate)
addProduct(name, price) → localStorage → Done

// Future: API (simple change)
addProduct(name, price) → API Call → Backend Database
```

See [ARCHITECTURE.md](ARCHITECTURE.md#future-api-migration-guide) for the complete migration guide.

---

## ✨ Features

### Core Functionality

| Feature                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| 📊 **Dashboard**           | Real-time analytics, sales overview, top-selling products, and revenue tracking |
| 🛒 **POS Interface**       | Fast product selection with intuitive cart management and quick checkout        |
| 📋 **Order Management**    | Track orders with status updates (preparing, completed, cancelled)              |
| 👥 **Customer Management** | Customer database with contact info and order history                           |
| 🍽️ **Menu Management**     | Full CRUD operations for products with categories and emoji icons               |
| 💰 **Payment Processing**  | Cash & card payments, percentage/flat discounts, automatic tax calculation      |
| 💾 **Data Persistence**    | All data persists across browser sessions using localStorage                    |

### Business Features

- **Multiple Order Types**: Dine-in, Takeaway, and Delivery support
- **Flexible Discounts**: Apply percentage or flat amount discounts
- **Tax Calculation**: Configurable tax rate (default 15%)
- **Quick Cash Buttons**: Pre-set amounts for faster checkout
- **Order History**: Complete order tracking with filtering and search
- **Customer Loyalty**: Track customer orders and purchase history

---

## 🎬 Demo

### Screenshots

<details>
<summary>📊 Dashboard</summary>

The dashboard provides a real-time overview of your restaurant's performance:

- Today's revenue and order count
- Total revenue statistics
- Average order value
- Top-selling products
- Quick navigation to all features

</details>

<details>
<summary>🛒 POS Screen</summary>

The main point of sale interface:

- Category-based product filtering
- Visual product grid with images
- Real-time cart updates
- Quantity adjustment controls
- One-click checkout

</details>

<details>
<summary>📋 Order Management</summary>

Complete order tracking system:

- Filter by status (preparing, completed, cancelled)
- Search by order number or customer
- Mark orders as completed or paid
- View detailed order information

</details>

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher

### Quick Start

```bash
# Clone the repository
git clone https://github.com/nuwandev/GrillMaster-POS.git

# Navigate to project directory
cd grillmaster-pos

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start Vite development server with hot reload |
| `npm run build`    | Build optimized production bundle             |
| `npm run preview`  | Preview production build locally              |
| `npm run lint`     | Run ESLint to check code quality              |
| `npm run lint:fix` | Auto-fix ESLint issues                        |
| `npm run format`   | Format code with Prettier                     |

---

## 📚 Documentation

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

The documentation includes:

- Complete API reference
- State management guide
- Routing system details
- Component documentation
- Data layer architecture

---

## 🏗️ Architecture

### Technology Stack

| Technology                    | Purpose                     |
| ----------------------------- | --------------------------- |
| **Vanilla JavaScript (ES6+)** | Core application logic      |
| **Vite 5.x**                  | Build tool and dev server   |
| **Tailwind CSS**              | Utility-first styling       |
| **ESLint + Prettier**         | Code quality and formatting |

### Design Patterns

| Pattern              | Implementation   | Purpose                           |
| -------------------- | ---------------- | --------------------------------- |
| **Observable State** | `createStore()`  | Reactive state with subscriptions |
| **MVC**              | Screens/Store    | Separation of concerns            |
| **Module Pattern**   | ES Modules       | Encapsulation and reusability     |
| **Factory Pattern**  | `createRouter()` | Object creation abstraction       |
| **Screen-based SPA** | Hash Router      | Single page navigation            |

### Project Structure

```
grillmaster-pos/
├── 📁 src/
│   ├── 📁 core/                 # Core application modules
│   │   ├── app.js              # Application bootstrap
│   │   ├── constants.js        # Configuration & constants
│   │   ├── router.js           # Hash-based SPA router
│   │   └── state.js            # Observable state management
│   │
│   ├── 📁 features/             # Feature modules (screens)
│   │   ├── 📁 home/            # Dashboard
│   │   ├── 📁 new-order/       # Order creation flow
│   │   ├── 📁 pos/             # Main POS interface
│   │   ├── 📁 orders/          # Order management
│   │   ├── 📁 menu/            # Product management
│   │   └── 📁 customers/       # Customer management
│   │
│   ├── 📁 ui/                   # Reusable UI components
│   │   ├── badge.js            # Status badges
│   │   ├── dom-utils.js        # DOM helpers
│   │   ├── header.js           # Page header
│   │   └── modal.js            # Modal & toast notifications
│   │
│   ├── 📁 utils/                # Utility functions
│   │   ├── helpers.js          # Formatting, ID generation
│   │   └── storage.js          # localStorage utilities
│   │
│   ├── 📁 data/                 # Data layer
│   │   ├── store.js            # Central data store
│   │   └── demo-data.js        # Sample data
│   │
│   └── main.js                  # Application entry point
│
├── index.html                   # HTML entry point
├── package.json                 # Project configuration
├── vite.config.js              # Vite configuration
└── DOCUMENTATION.md            # Technical documentation
```

---

## 💡 Usage

### Starting a New Order

1. Click **"+ Start New Order"** on the dashboard
2. Select order type (Dine-in, Takeaway, or Delivery)
3. Optionally select or add a customer
4. Click **"Start Order"** to open the POS screen

### Processing an Order

1. Browse products by category or search
2. Click products to add them to the cart
3. Adjust quantities using +/- buttons
4. Click **"Checkout"** when ready
5. Apply discounts if needed
6. Select payment method and process payment

### Managing Orders

1. Navigate to **Orders** from the dashboard
2. Filter orders by status or search
3. Click **"Complete"** to mark orders as done
4. Click **"Mark Paid"** to update payment status

---

## ⚙️ Configuration

### Business Settings

Edit `src/core/constants.js` to customize:

```javascript
// Tax rate (percentage)
export const DEFAULT_TAX_RATE = 15;

// Currency settings
export const CURRENCY = {
  CODE: 'LKR',
  LOCALE: 'en-LK',
  SYMBOL: 'Rs.',
};

// Order types
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};
```

### Sample Data

The application comes with demo data for testing. To reset to default data:

1. Open browser Developer Tools
2. Go to Application → Local Storage
3. Clear all `grillmaster_*` keys
4. Refresh the page

---

## 📦 Build for Production

```bash
# Create production build
npm run build

# Preview the build
npm run preview
```

The build output will be in the `dist/` folder, ready for deployment to any static hosting service.

### Deployment Options

- **Netlify**: Drop the `dist` folder or connect your repository
- **Vercel**: Import your GitHub repository
- **GitHub Pages**: Use the `dist` folder contents
- **Any Static Host**: Upload the `dist` folder

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Nuwan Dev**

- GitHub: [@nuwandev](https://github.com/nuwandev)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the restaurant industry

</div>
