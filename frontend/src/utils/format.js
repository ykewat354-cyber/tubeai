/**
 * Format a date to readable string
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

/**
 * Truncate text to max length
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format plan name for display
 */
export function formatPlan(plan) {
  const plans = {
    free: 'Free',
    pro: 'Pro',
    'pro-yearly': 'Pro (Yearly)',
  };
  return plans[plan] || 'Free';
}
