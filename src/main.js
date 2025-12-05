/**
 * @fileoverview Application entry point
 * @description Bootstraps the GrillMaster POS application
 * @author GrillMaster Dev Team
 * @version 1.0.0
 */

import { initApp } from './core/app.js';

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
