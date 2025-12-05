/**
 * @fileoverview Simple hash-based router for SPA navigation.
 * Handles route changes and screen lifecycle.
 */

import { DEFAULT_ROUTE } from './constants.js';

/**
 * @typedef {Object} Route
 * @property {string} path - Route path
 * @property {Function} handler - Screen class or factory
 */

/**
 * @typedef {Object} RouterConfig
 * @property {HTMLElement} root - Root element for rendering
 * @property {Object<string, Function>} routes - Route definitions
 * @property {string} [defaultRoute] - Default route path
 */

/**
 * Get current route from URL hash.
 * @param {string} defaultRoute - Default route fallback
 * @returns {string} Current route path
 */
function getCurrentRoute(defaultRoute) {
  return window.location.hash.slice(1) || defaultRoute;
}

/**
 * Unmount a screen if it has an unmount method.
 * @param {Object} screen - Screen instance
 */
function unmountScreen(screen) {
  if (screen && typeof screen.unmount === 'function') {
    screen.unmount();
  }
}

/**
 * Mount a screen if it has a mount method.
 * @param {Object} screen - Screen instance
 */
function mountScreen(screen) {
  if (screen && typeof screen.mount === 'function') {
    screen.mount();
  }
}

/**
 * Creates a router instance for hash-based navigation.
 * @param {RouterConfig} config - Router configuration
 * @returns {Object} Router instance
 */
export function createRouter(config) {
  const { root, routes, defaultRoute = DEFAULT_ROUTE } = config;
  let currentScreen = null;
  let currentRoute = '';

  function navigate(route, params = {}) {
    unmountScreen(currentScreen);
    const ScreenClass = routes[route] || routes[defaultRoute];
    if (!ScreenClass) {
      console.error(`Route not found: ${route}`);
      return;
    }
    currentRoute = route;
    window.location.hash = route;
    currentScreen = new ScreenClass({ router: routerInstance, params });
    render();
    window.scrollTo(0, 0);
    mountScreen(currentScreen);
  }

  function render() {
    if (!currentScreen || !root) {
      return;
    }
    root.innerHTML =
      typeof currentScreen.render === 'function' ? currentScreen.render() : '';
  }

  function handleHashChange() {
    const route = getCurrentRoute(defaultRoute);
    if (route !== currentRoute) {
      navigate(route);
    }
  }

  function init() {
    window.addEventListener('hashchange', handleHashChange);
    navigate(getCurrentRoute(defaultRoute));
  }

  const routerInstance = {
    navigate,
    render,
    init,
  };
  return routerInstance;
}
