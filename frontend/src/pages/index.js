/**
 * Landing Page — TubeAI Homepage
 *
 * Sections: Hero, Features, How It Works, Pricing, CTA, Footer
 *
 * Responsive Design:
 * - Mobile-first layout (single column by default)
 * - Tablet (sm+): Two-column grids
 * - Desktop (md+): Three-column grids
 * - All buttons ≥44px touch target
 * - Text readable at ≥16px minimum
 */
export default function HomePage() {
  const children = `

    <script>
      // SEO Meta Tags
      (function() {
        document.title = 'TubeAI — AI YouTube Video Idea & Script Generator';
        function addMeta(name, content) {
          var m = document.querySelector('meta[name="' + name + '"]');
          if (!m) { m = document.createElement('meta'); m.setAttribute('name', name); document.head.appendChild(m); }
          m.setAttribute('content', content);
        }
        function addProperty(prop, content) {
          var m = document.querySelector('meta[property="' + prop + '"]');
          if (!m) { m = document.createElement('meta'); m.setAttribute('property', prop); document.head.appendChild(m); }
          m.setAttribute('content', content);
        }
        addMeta('description', 'Generate viral YouTube video ideas, click-worthy titles, and full scripts in seconds with AI. Start free with 3 generations/day.');
        addMeta('keywords', 'youtube, ai, script generator, video ideas, content creator, youtube tools');
        addMeta('robots', 'index, follow');
        addMeta('viewport', 'width=device-width, initial-scale=1');
        addProperty('og:title', 'TubeAI — AI YouTube Video Idea & Script Generator');
        addProperty('og:description', 'Generate viral YouTube video ideas, click-worthy titles, and full scripts in seconds with AI.');
        addProperty('og:type', 'website');
        addProperty('og:site_name', 'TubeAI');
        addProperty('twitter:card', 'summary_large_image');
        addProperty('twitter:title', 'TubeAI — AI YouTube Video Idea & Script Generator');
        addProperty('twitter:description', 'Generate viral YouTube video ideas, click-worthy titles, and full scripts in seconds.');
        // Canonical URL
        var canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
        canonical.setAttribute('href', window.location.origin);
      })();
    <\/script>
    <!-- Hero Section -->
    <section class="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
      <div class="max-w-7xl mx-auto text-center">
        <div class="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-500 text-sm font-medium rounded-full mb-4 sm:mb-6">
          ✨ AI-Powered YouTube Content Generator
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-2">
          Stop staring at a blank screen.<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-500">
            Let AI create your next viral video.
          </span>
        </h1>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-dark-400 max-w-3xl mx-auto leading-relaxed px-4">
          Generate video ideas, click-worthy titles, and full scripts in seconds.
          Perfect for creators, agencies, and content teams.
        </p>
        <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <a href="/auth/register" class="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 min-h-[44px] text-center">
            Start Generating Free →
          </a>
          <a href="/pricing" class="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 min-h-[44px] text-center">
            View Pricing
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-12 sm:py-16 lg:py-20 bg-dark-900/30 px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">Everything You Need</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        <div class="card fade-in">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">💡</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mb-2">Video Ideas</h3>
          <p class="text-dark-400 text-sm sm:text-base">Get fresh, trending video ideas tailored to your niche. Never run out of content inspiration.</p>
        </div>
        <div class="card fade-in">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">✍️</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mb-2">Catchy Titles</h3>
          <p class="text-dark-400 text-sm sm:text-base">AI-optimized titles that maximize click-through rates. More clicks, more views.</p>
        </div>
        <div class="card fade-in sm:sm:col-span-2 lg:col-span-1">
          <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">📝</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mb-2">Full Scripts</h3>
          <p class="text-dark-400 text-sm sm:text-base">Complete video scripts with hooks, body content, and calls-to-action. Ready to record.</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-white text-center mb-10 sm:mb-16">How It Works</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
        <div class="text-center">
          <div class="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto">1</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mt-4 sm:mt-6 mb-2">Describe Your Topic</h3>
          <p class="text-dark-400 text-sm sm:text-base">Tell AI what your video is about. Be as specific or broad as you want.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto">2</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mt-4 sm:mt-6 mb-2">AI Generates Content</h3>
          <p class="text-dark-400 text-sm sm:text-base">Get ideas, titles, and a full script — all in seconds.</p>
        </div>
        <div class="text-center">
          <div class="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto">3</div>
          <h3 class="text-lg sm:text-xl font-semibold text-white mt-4 sm:mt-6 mb-2">Create & Upload</h3>
          <p class="text-dark-400 text-sm sm:text-base">Use the script, record your video, and hit publish!</p>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="py-12 sm:py-16 lg:py-20 bg-dark-900/30 px-4 sm:px-6 lg:px-8" id="pricing">
      <h2 class="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">Simple Pricing</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        <div class="card">
          <h3 class="text-lg font-semibold text-dark-400">Free</h3>
          <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$0<span class="text-base sm:text-lg font-normal text-dark-400">/mo</span></p>
          <ul class="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-dark-400 text-sm">
            <li>✅ 3 generations/day</li>
            <li>✅ Basic AI model</li>
            <li>✅ Save history</li>
          </ul>
          <a href="/auth/register" class="mt-6 sm:mt-8 block btn-secondary text-center min-h-[44px] leading-normal">Get Started</a>
        </div>
        <div class="card border-primary-500/50 relative">
          <span class="absolute top-0 right-4 -mt-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">Popular</span>
          <h3 class="text-lg font-semibold text-primary-500">Pro</h3>
          <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$19<span class="text-base sm:text-lg font-normal text-dark-400">/mo</span></p>
          <ul class="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-dark-400 text-sm">
            <li>✅ 50 generations/day</li>
            <li>✅ Advanced AI (GPT-4o)</li>
            <li>✅ Priority support</li>
            <li>✅ Export as PDF</li>
          </ul>
          <a href="/auth/register" class="mt-6 sm:mt-8 block btn-primary text-center min-h-[44px] leading-normal">Start Pro Trial</a>
        </div>
        <div class="card sm:col-span-2 lg:col-span-1">
          <h3 class="text-lg font-semibold text-dark-400">Pro Yearly</h3>
          <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$149<span class="text-base sm:text-lg font-normal text-dark-400">/yr</span></p>
          <ul class="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-dark-400 text-sm">
            <li>✅ Everything in Pro</li>
            <li>✅ 2 months free</li>
            <li>✅ API access</li>
          </ul>
          <a href="/auth/register" class="mt-6 sm:mt-8 block btn-secondary text-center min-h-[44px] leading-normal">Go Yearly</a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-12 sm:py-16 lg:py-20 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to create amazing content?</h2>
        <p class="text-dark-400 mb-6 sm:mb-8 text-sm sm:text-base">Join thousands of creators using TubeAI to grow their channels.</p>
        <a href="/auth/register" class="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 min-h-[44px] inline-block text-center">
          Start Free Today →
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-dark-800 py-6 sm:py-8 px-4">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-dark-500 text-sm">© 2025 TubeAI. All rights reserved.</p>
        <div class="flex gap-4 sm:gap-6 text-sm text-dark-500">
          <a href="#" class="hover:text-dark-400">Privacy</a>
          <a href="#" class="hover:text-dark-400">Terms</a>
          <a href="#" class="hover:text-dark-400">Contact</a>
        </div>
      </div>
    </footer>
  `;

  // Layout wrapper
  return \`
    <div class="min-h-screen bg-dark-950">
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
      <main class="pt-16">
        \${children}
      </main>
    </div>
  \`;
}
