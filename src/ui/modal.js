/**
 * @fileoverview Modal dialog component.
 */

import { TOAST_DURATION_MS } from '../core/constants.js';

/** Toast fade animation duration in ms. */
const TOAST_FADE_DURATION = 300;

/** Button variant CSS classes. */
const BUTTON_VARIANTS = {
  primary: 'px-4 py-2 rounded-xl bg-primary text-white hover:bg-blue-600',
  secondary: 'px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100',
};

/**
 * Create a button element for modal actions.
 * @param {ModalAction} action - Action config
 * @param {Function} cleanup - Cleanup function
 * @returns {HTMLButtonElement} Button element
 */
function createActionButton(action, cleanup) {
  const btn = document.createElement('button');
  btn.textContent = action.label;
  btn.className = BUTTON_VARIANTS[action.variant] || BUTTON_VARIANTS.secondary;
  btn.onclick = () => {
    if (action.onClick) {
      action.onClick();
    }
    cleanup();
  };
  return btn;
}

/**
 * @typedef {Object} ModalAction
 * @property {string} label - Button label
 * @property {'primary'|'secondary'|'danger'} [variant='secondary'] - Button variant
 * @property {() => void} [onClick] - Click handler
 */

/**
 * @typedef {Object} ModalOptions
 * @property {string} title - Modal title
 * @property {string} html - Modal body HTML
 * @property {ModalAction[]} [actions=[]] - Footer actions
 * @property {boolean} [closeOnOverlay=true] - Close when clicking overlay
 */

/**
 * Create modal DOM elements.
 * @param {string} title - Modal title
 * @param {string} html - Modal body HTML
 * @returns {{overlay: HTMLElement, box: HTMLElement, header: HTMLElement, body: HTMLElement, footer: HTMLElement}}
 */
function createModalElements(title, html) {
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-backdrop';
  const box = document.createElement('div');
  box.className =
    'bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal';
  const header = document.createElement('div');
  header.className = 'px-6 pt-6 text-xl font-bold text-gray-900';
  header.textContent = title;
  const body = document.createElement('div');
  body.className = 'px-6 py-4 max-h-[60vh] overflow-y-auto text-gray-700';
  body.innerHTML = html;
  const footer = document.createElement('div');
  footer.className = 'px-6 pb-6 pt-2 flex flex-wrap gap-2 justify-end';
  return { overlay, box, header, body, footer };
}

/**
 * Set up modal event listeners.
 * @param {HTMLElement} overlay - Overlay element
 * @param {boolean} closeOnOverlay - Whether to close on overlay click
 * @param {Function} cleanup - Cleanup function
 */
function setupModalEvents(overlay, closeOnOverlay, cleanup) {
  if (closeOnOverlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
      }
    });
  }
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Create and display a modal dialog.
 * @param {ModalOptions} options - Modal options
 * @returns {() => void} Cleanup function to close modal
 */
export function createModal(options) {
  const {
    title = '',
    html = '',
    actions = [],
    closeOnOverlay = true,
  } = options;
  const { overlay, box, header, body, footer } = createModalElements(
    title,
    html
  );

  const cleanup = () => {
    try {
      document.body.removeChild(overlay);
    } catch (_e) {
      /* Already removed */
    }
  };

  actions.forEach((action) =>
    footer.appendChild(createActionButton(action, cleanup))
  );
  box.appendChild(header);
  box.appendChild(body);
  if (actions.length > 0) {
    box.appendChild(footer);
  }
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  setupModalEvents(overlay, closeOnOverlay, cleanup);
  return cleanup;
}

/**
 * Show a confirmation dialog.
 * @param {Object} options - Options
 * @param {string} [options.title='Confirm'] - Dialog title
 * @param {string} [options.message='Are you sure?'] - Dialog message
 * @param {string} [options.confirmText='Confirm'] - Confirm button text
 * @param {string} [options.cancelText='Cancel'] - Cancel button text
 * @param {boolean} [options.danger=false] - Use danger styling
 * @returns {Promise<boolean>} True if confirmed
 */
export function confirm(options = {}) {
  const {
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
  } = options;

  return new Promise((resolve) => {
    createModal({
      title,
      html: `<p>${message}</p>`,
      actions: [
        {
          label: cancelText,
          variant: 'secondary',
          onClick: () => resolve(false),
        },
        {
          label: confirmText,
          variant: danger ? 'danger' : 'primary',
          onClick: () => resolve(true),
        },
      ],
    });
  });
}

/**
 * Show a toast notification.
 * @param {string} message - Toast message
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - Toast type
 * @param {number} [duration] - Duration in ms
 */
export function toast(message, type = 'info', duration = TOAST_DURATION_MS) {
  // Remove existing toast
  const existingToast = document.querySelector('[data-toast]');
  if (existingToast) {
    existingToast.remove();
  }

  const typeConfig = {
    info: { bg: 'bg-gray-800', icon: 'ℹ️' },
    success: { bg: 'bg-green-600', icon: '✓' },
    warning: { bg: 'bg-yellow-500', icon: '⚠️' },
    error: { bg: 'bg-red-600', icon: '✕' },
  };

  const config = typeConfig[type] || typeConfig.info;

  const toast = document.createElement('div');
  toast.setAttribute('data-toast', '');
  toast.className = `
    fixed bottom-6 left-1/2 -translate-x-1/2 z-50
    ${config.bg} text-white px-6 py-3 rounded-xl shadow-lg
    flex items-center gap-3
    animate-toast-in
  `;
  toast.innerHTML = `
    <span class="text-lg">${config.icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => toast.remove(), TOAST_FADE_DURATION);
  }, duration);
}
