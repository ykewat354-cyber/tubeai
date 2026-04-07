/**
 * Layout Component — Public pages layout with SEO support
 */
export default function Layout({ showNav = true, children, title = 'TubeAI' }) {
  return `
    <script>
      (function() {
        document.title = '${title} | TubeAI';
        var desc = document.querySelector('meta[name="description"]');
        if (!desc) { desc = document.createElement('meta'); desc.setAttribute('name', 'description'); document.head.appendChild(desc); }
        desc.setAttribute('content', 'AI-powered YouTube content generator — create ideas, titles, and scripts in seconds.');
      })();
    <\/script>
    <div class="min-h-screen bg-dark-950">
      ${showNav ? `
      <header class="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm fixed w-full z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" class="text-xl font-bold text-white">🎬 Tube<span class="text-primary-500">AI</span></a>
          <div class="flex gap-3 sm:gap-4 items-center">
            <a href="/pricing" class="text-dark-400 hover:text-white transition-colors text-sm hidden sm:block">Pricing</a>
            <a href="/auth/login" class="text-dark-400 hover:text-white transition-colors text-sm">Log in</a>
            <a href="/auth/register" class="btn-primary text-sm min-h-[36px] px-4">Get Started</a>
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
