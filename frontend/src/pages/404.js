/* eslint-disable import/no-anonymous-default-export */
export default function NotFoundPage() {
  return `
    <div class="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-8xl font-bold text-primary-500 mb-4">404</h1>
        <p class="text-xl text-dark-400 mb-8">Page not found</p>
        <a href="/" class="btn-primary">Go Home →</a>
      </div>
    </div>
  `;
}
