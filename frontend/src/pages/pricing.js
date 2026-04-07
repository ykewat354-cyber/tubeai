/**
 * Pricing Page
 * Shows free and paid plans with Stripe checkout integration
 * Responsive: Stacked cards on mobile, 3-column grid on desktop
 */
export default function PricingPage() {
  var children = \`
    <div class="min-h-screen bg-dark-950 flex items-start justify-center py-12 sm:py-16 lg:py-20 px-4">
      <div class="w-full max-w-md lg:max-w-5xl">
        <div class="text-center mb-8 sm:mb-12">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Choose Your Plan</h1>
          <p class="text-dark-400 text-base sm:text-lg">Upgrade to unlock the full power of AI</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <!-- Free -->
          <div class="card">
            <h3 class="text-lg font-semibold text-dark-400">Free</h3>
            <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$0<span class="text-base sm:text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-dark-400 text-sm">
              <li>✅ 3 generations/day</li>
              <li>✅ GPT-4o-mini model</li>
              <li>✅ Save & view history</li>
            </ul>
            <div class="mt-6 sm:mt-8 p-3 bg-dark-800 rounded-lg text-center text-dark-400 text-sm">Create a free account</div>
          </div>

          <!-- Pro Monthly -->
          <div class="card border-primary-500/50 relative">
            <span class="absolute top-0 right-4 -mt-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">Most Popular</span>
            <h3 class="text-lg font-semibold text-primary-500">Pro Monthly</h3>
            <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$19<span class="text-base sm:text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-dark-400 text-sm">
              <li>✅ 50 generations/day</li>
              <li>✅ GPT-4o (Advanced)</li>
              <li>✅ Unlimited history</li>
              <li>✅ Export as PDF</li>
              <li>✅ Priority support</li>
            </ul>
            <button id="pro-monthly-btn" class="mt-6 sm:mt-8 w-full btn-primary min-h-[44px]">Upgrade to Pro</button>
          </div>

          <!-- Pro Yearly -->
          <div class="card sm:col-span-2 lg:col-span-1">
            <h3 class="text-lg font-semibold text-dark-400">Pro Yearly</h3>
            <p class="text-3xl sm:text-4xl font-bold text-white mt-2">$149<span class="text-base sm:text-lg font-normal text-dark-400">/yr</span></p>
            <p class="text-primary-500 text-sm mt-1">Save $79/year</p>
            <ul class="mt-4 space-y-2 sm:space-y-3 text-dark-400 text-sm">
              <li>✅ Everything in Pro</li>
              <li>✅ 2 months free</li>
              <li>✅ API access</li>
            </ul>
            <button id="pro-yearly-btn" class="mt-4 sm:mt-6 w-full btn-secondary min-h-[44px]">Go Yearly</button>
          </div>
        </div>

        <a href="/dashboard" class="block text-center mt-6 sm:mt-8 text-dark-400 hover:text-white transition-colors text-sm min-h-[36px]">← Back to Dashboard</a>
      </div>
    </div>
  \`;

  // Minimal nav for standalone page
  return \`
    <div class="min-h-screen bg-dark-950">
      <header class="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm fixed w-full z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" class="text-xl font-bold text-white">🎬 Tube<span class="text-primary-500">AI</span></a>
          <div class="flex gap-3 sm:gap-4 items-center">
            <a href="/auth/login" class="text-dark-400 hover:text-white transition-colors text-sm">Log in</a>
            <a href="/auth/register" class="btn-primary text-sm min-h-[36px] px-4">Get Started</a>
          </div>
        </nav>
      </header>
      <main class="pt-16" id="main-content">\${children}</main>

      <script>
        (function() {
          try {
            document.getElementById('pro-monthly-btn').addEventListener('click', handleCheckout('pro'));
            document.getElementById('pro-yearly-btn').addEventListener('click', handleCheckout('pro-yearly'));
          } catch(e) {}

          function handleCheckout(plan) {
            return async function() {
              var token = tryGetToken();
              if (!token) { window.location.href = '/auth/login'; return; }
              try {
                var res = await fetch('/api/subscription/checkout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                  },
                  body: JSON.stringify({ plan: plan }),
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.error);
                window.location.href = data.url;
              } catch(e) { alert(e.message); }
            };
          }
        })();
        function tryGetToken() { try { return localStorage.getItem('token'); } catch(e) { return null; } }
      <\/script>
    </div>
  \`;
}
