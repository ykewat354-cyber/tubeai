import Layout from '../components/Layout';

export default function HomePage() {
  return `
    ${Layout({ 
      showNav: true, 
      children: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div class="text-center">
          <div class="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-500 text-sm font-medium rounded-full mb-6">
            ✨ AI-Powered YouTube Content Generator
          </div>
          <h1 class="text-4xl sm:text-6xl font-bold text-white leading-tight">
            Stop staring at a blank screen.<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-500">
              Let AI create your next viral video.
            </span>
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-dark-400 max-w-3xl mx-auto">
            Generate video ideas, click-worthy titles, and full scripts in seconds. 
            Perfect for creators, agencies, and content teams.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register" class="btn-primary text-lg px-8 py-3">
              Start Generating Free →
            </a>
            <a href="/pricing" class="btn-secondary text-lg px-8 py-3">
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 bg-dark-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white text-center mb-12">Everything You Need</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="card fade-in">
            <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">
              💡
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Video Ideas</h3>
            <p class="text-dark-400">Get fresh, trending video ideas tailored to your niche. Never run out of content inspiration.</p>
          </div>
          <!-- Feature 2 -->
          <div class="card fade-in">
            <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">
              ✍️
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Catchy Titles</h3>
            <p class="text-dark-400">AI-optimized titles that maximize click-through rates. More clicks, more views.</p>
          </div>
          <!-- Feature 3 -->
          <div class="card fade-in">
            <div class="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center text-2xl mb-4">
              📝
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Full Scripts</h3>
            <p class="text-dark-400">Complete video scripts with hooks, body content, and calls-to-action. Ready to record.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white text-center mb-16">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-12">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">1</div>
            <h3 class="text-xl font-semibold text-white mt-6 mb-2">Describe Your Topic</h3>
            <p class="text-dark-400">Tell AI what your video is about. Be as specific or broad as you want.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">2</div>
            <h3 class="text-xl font-semibold text-white mt-6 mb-2">AI Generates Content</h3>
            <p class="text-dark-400">Get ideas, titles, and a full script — all in seconds.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">3</div>
            <h3 class="text-xl font-semibold text-white mt-6 mb-2">Create & Upload</h3>
            <p class="text-dark-400">Use the script, record your video, and hit publish!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="py-20 bg-dark-900/30" id="pricing">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white text-center mb-12">Simple Pricing</h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Free -->
          <div class="card">
            <h3 class="text-lg font-semibold text-dark-400">Free</h3>
            <p class="text-4xl font-bold text-white mt-2">$0<span class="text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-6 space-y-3 text-dark-400 text-sm">
              <li class="flex gap-2">✅ 3 generations/day</li>
              <li class="flex gap-2">✅ Basic AI model</li>
              <li class="flex gap-2">✅ Save history</li>
            </ul>
            <a href="/auth/register" class="mt-8 block btn-secondary text-center">Get Started</a>
          </div>
          <!-- Pro Monthly -->
          <div class="card border-primary-500/50 relative">
            <span class="absolute top-0 right-4 -mt-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">Popular</span>
            <h3 class="text-lg font-semibold text-primary-500">Pro</h3>
            <p class="text-4xl font-bold text-white mt-2">$19<span class="text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-6 space-y-3 text-dark-400 text-sm">
              <li class="flex gap-2">✅ 50 generations/day</li>
              <li class="flex gap-2">✅ Advanced AI (GPT-4o)</li>
              <li class="flex gap-2">✅ Priority support</li>
              <li class="flex gap-2">✅ Export as PDF</li>
            </ul>
            <a href="/auth/register" class="mt-8 block btn-primary text-center">Start Pro Trial</a>
          </div>
          <!-- Pro Yearly -->
          <div class="card">
            <h3 class="text-lg font-semibold text-dark-400">Pro Yearly</h3>
            <p class="text-4xl font-bold text-white mt-2">$149<span class="text-lg font-normal text-dark-400">/yr</span></p>
            <ul class="mt-6 space-y-3 text-dark-400 text-sm">
              <li class="flex gap-2">✅ Everything in Pro</li>
              <li class="flex gap-2">✅ 2 months free</li>
              <li class="flex gap-2">✅ API access</li>
            </ul>
            <a href="/auth/register" class="mt-8 block btn-secondary text-center">Go Yearly</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20">
      <div class="max-w-3xl mx-auto text-center px-4">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to create amazing content?</h2>
        <p class="text-dark-400 mb-8">Join thousands of creators using TubeAI to grow their channels.</p>
        <a href="/auth/register" class="btn-primary text-lg px-8 py-3">
          Start Free Today →
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-dark-800 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-dark-500 text-sm">© 2025 TubeAI. All rights reserved.</p>
        <div class="flex gap-6 text-sm text-dark-500">
          <a href="#" class="hover:text-dark-400">Privacy</a>
          <a href="#" class="hover:text-dark-400">Terms</a>
          <a href="#" class="hover:text-dark-400">Contact</a>
        </div>
      </div>
    </footer>
  ` 
})}
  `;
}
