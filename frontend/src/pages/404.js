/**
 * 404 Not Found Page
 * Shown when user navigates to an unknown route
 */
export default function NotFoundPage() {
  return \`
    <div class="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-6xl sm:text-8xl font-bold text-primary-500 mb-4 sm:mb-6">404</h1>
        <p class="text-base sm:text-xl text-dark-400 mb-6 sm:mb-8">Page not found</p>
        <a href="/" class="btn-primary min-h-[44px] inline-flex items-center">Go Home →</a>
      </div>
    </div>
  `;
}
