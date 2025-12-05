/**
 * @fileoverview Header component for screens.
 */

/**
 * @typedef {Object} HeaderOptions
 * @property {string} [left] - Left section HTML
 * @property {string} [center] - Center section HTML
 * @property {string} [right] - Right section HTML
 * @property {string} [className] - Additional classes
 */

/**
 * Render a screen header component.
 * @param {HeaderOptions} options - Header options
 * @returns {string} Header HTML
 */
export function Header(options = {}) {
  const { left = '', center = '', right = '', className = '' } = options;

  return `
    <div class="bg-white shadow-sm px-6 py-4 border-b ${className}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-3">
          ${left}
        </div>
        <div class="flex-1 flex justify-center items-center">
          ${center}
        </div>
        <div class="flex items-center gap-2">
          ${right}
        </div>
      </div>
    </div>
  `;
}
