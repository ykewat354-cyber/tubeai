/**
 * Utility functions for formatting dates, text, and display values
 * All functions are pure (no side effects) and safe for SSR
 */

/**
 * Format a date to readable string (e.g., "Jan 15, 2025")
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

/**
 * Format a date with time (e.g., "Jan 15, 2025, 3:30 PM")
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString();
  } catch (e) {
    return '';
  }
}

/**
 * Truncate text to max length with ellipsis
 * @param {string} text
 * @param {number} maxLength - Max characters before truncation (default: 100)
 * @returns {string}
 */
function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format plan key to display name
 * @param {string} plan
 * @returns {string}
 */
function formatPlan(plan) {
  var plans = {
    free: 'Free',
    pro: 'Pro',
    'pro-yearly': 'Pro (Yearly)',
  };
  return plans[plan] || 'Free';
}

/**
 * Escape HTML to prevent XSS when inserting text into innerHTML
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Safely get item from localStorage (handles SSR and private mode)
 * @param {string} key
 * @returns {string|null}
 */
function safeGetItem(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

/**
 * Safely set item in localStorage
 * @param {string} key
 * @param {string} value
 * @returns {boolean} success
 */
function safeSetItem(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
}

module.exports = { formatDate, formatDateTime, truncate, formatPlan, escapeHTML, safeGetItem, safeSetItem };
