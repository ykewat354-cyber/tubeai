/**
 * Skeleton Loading Components
 * Lightweight placeholder UI while data loads
 * Pure CSS — no JS animation, GPU-accelerated
 */

/**
 * Card skeleton — used for history list items
 */
function cardSkeleton(count = 3) {
  var items = "";
  for (var i = 0; i < count; i++) {
    items += '<div class="card p-4">' +
      '<div class="skeleton-line skeleton-line-long"></div>' +
      '<div class="skeleton-line skeleton-line-short"></div>' +
    '</div>';
  }
  return items;
}

/**
 * Single content area skeleton
 */
function contentSkeleton() {
  return '<div class="skeleton-content">' +
    '<div class="skeleton-line skeleton-line-medium"></div>' +
    '<div class="skeleton-line skeleton-line-long"></div>' +
    '<div class="skeleton-line skeleton-line-short"></div>' +
    '<div class="skeleton-line skeleton-line-medium"></div>' +
  '</div>';
}

/**
 * Pricing card skeleton
 */
function pricingSkeleton() {
  return '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">' +
    '<div class="card p-6 skeleton-card">' +
      '<div class="skeleton-line skeleton-line-medium"></div>' +
      '<div class="skeleton-line skeleton-line-long mt-3"></div>' +
      '<div class="skeleton-line skeleton-line-short mt-3"></div>' +
      '<div class="skeleton-line skeleton-line-medium mt-6"></div>' +
      '<div class="skeleton-line skeleton-line-short mt-2"></div>' +
      '<div class="skeleton-line skeleton-line-medium mt-8"></div>' +
    '</div>'.repeat(3) +
  '</div>';
}

var Skeleton = {
  card: cardSkeleton,
  content: contentSkeleton,
  pricing: pricingSkeleton,
};

module.exports = Skeleton;
