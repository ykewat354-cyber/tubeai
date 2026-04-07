/**
 * Error Message Component
 * Displays user-friendly error messages with retry option
 *
 * @param {object} props
 * @param {string} props.message - Error text
 * @param {function} props.onRetry - Optional retry handler
 * @param {string} props.type - Type: "error" | "warning" | "info"
 * @returns {string}
 */
function ErrorMessage(props) {
  var type = props.type || "error";
  var message = props.message || "Something went wrong";
  var icon = type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️";
  var colorClass = type === "error" ? "border-red-500/20 bg-red-500/10 text-red-400"
    : type === "warning" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
    : "border-blue-500/20 bg-blue-500/10 text-blue-400";

  var retryBtn = props.onRetry
    ? '<button onclick="(' + props.onRetry.toString() + ')()" class="btn-secondary text-sm mt-3 min-h-[40px] px-4">Retry</button>'
    : "";

  return '<div class="card p-4 sm:p-6 text-center ' + colorClass + '" role="alert">' +
    '<div class="text-3xl sm:text-4xl mb-2">' + icon + '</div>' +
    '<p class="text-sm sm:text-base">' + message + '</p>' +
    retryBtn +
  '</div>';
}

module.exports = ErrorMessage;
