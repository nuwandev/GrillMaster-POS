/**
 * @fileoverview DOM utility functions for UI updates.
 */

/**
 * Update a specific section of the DOM without full re-render.
 * @param {string} selector - CSS selector for the element
 * @param {string} html - New HTML content
 * @param {boolean} [replaceOuter=true] - Replace outerHTML if true, innerHTML if false
 * @returns {boolean} Success status
 */
export function updateSection(selector, html, replaceOuter = true) {
  const element = document.querySelector(selector);

  if (!element) {
    return false;
  }

  if (replaceOuter) {
    element.outerHTML = html;
  } else {
    element.innerHTML = html;
  }

  return true;
}

/**
 * Update text content of an element (faster than innerHTML for text-only).
 * @param {string} selector - CSS selector
 * @param {string} text - New text content
 * @returns {boolean} Success status
 */
export function updateText(selector, text) {
  const element = document.querySelector(selector);

  if (!element) {
    return false;
  }

  element.textContent = text;
  return true;
}
