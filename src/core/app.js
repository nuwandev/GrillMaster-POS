/**
 * @fileoverview Application bootstrapping and initialization.
 * Entry point for the GrillMaster POS application.
 */

import { ROUTES } from './constants.js';
import { createRouter } from './router.js';
import { CustomersScreen } from '../features/customers/customers.screen.js';
import { HomeScreen } from '../features/home/home.screen.js';
import { MenuScreen } from '../features/menu/menu.screen.js';
import { NewOrderScreen } from '../features/new-order/new-order.screen.js';
import { OrdersScreen } from '../features/orders/orders.screen.js';
import { POSScreen } from '../features/pos/pos.screen.js';

/**
 * Application class - main entry point.
 * Handles app initialization, routing, and global state.
 */
class App {
  constructor() {
    /** @type {HTMLElement|null} */
    this.root = null;

    /** @type {ReturnType<typeof createRouter>|null} */
    this.router = null;
  }

  /**
   * Initialize the application.
   */
  init() {
    this.root = document.getElementById('app');

    if (!this.root) {
      console.error('Root element #app not found');
      return;
    }

    // Create router with route definitions
    this.router = createRouter({
      root: this.root,
      routes: {
        [ROUTES.HOME]: HomeScreen,
        [ROUTES.NEW_ORDER]: NewOrderScreen,
        [ROUTES.POS]: POSScreen,
        [ROUTES.ORDERS]: OrdersScreen,
        [ROUTES.MENU]: MenuScreen,
        [ROUTES.CUSTOMERS]: CustomersScreen,
      },
    });

    // Expose app globally for screen access
    window.app = this;

    // Initialize router
    this.router.init();
  }

  /**
   * Navigate to a route.
   * @param {string} route - Target route
   */
  navigate(route) {
    if (this.router) {
      this.router.navigate(route);
    }
  }

  /**
   * Render the current screen.
   */
  render() {
    if (this.router) {
      this.router.render();
    }
  }
}

/**
 * Bootstrap the application.
 */
export function initApp() {
  const app = new App();
  app.init();
}

export { App };
