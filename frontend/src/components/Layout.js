export default function Layout({ children, showNav = true }) {
  return `
    <div class="min-h-screen bg-dark-950">
      ${showNav ? `
      <header class="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm fixed w-full z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" class="text-xl font-bold text-white">
            🎬 Tube<span class="text-primary-500">AI</span>
          </a>
          <div class="flex gap-4 items-center">
            <a href="/features" class="text-dark-400 hover:text-white transition-colors text-sm hidden sm:block">Features</a>
            <a href="/pricing" class="text-dark-400 hover:text-white transition-colors text-sm">Pricing</a>
            <a href="/auth/login" class="text-dark-400 hover:text-white transition-colors text-sm">Log in</a>
            <a href="/auth/register" class="btn-primary text-sm">Get Started Free</a>
          </div>
        </nav>
      </header>
      ` : ''}
      <main class="${showNav ? 'pt-16' : ''}">
        ${children}
      </main>
    </div>
  `;
}
