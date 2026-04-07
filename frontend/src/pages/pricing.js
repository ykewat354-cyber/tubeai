import Layout from '../components/Layout';

export default function PricingPage() {
  return Layout({
    showNav: true,
    children: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-950 py-12 px-4">
      <div class="max-w-5xl w-full">
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p class="text-dark-400 text-lg">Upgrade to unlock the full power of AI</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Free -->
          <div class="card">
            <h3 class="text-lg font-semibold text-dark-400">Free</h3>
            <p class="text-4xl font-bold text-white mt-2">$0<span class="text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-6 space-y-3 text-dark-400 text-sm">
              <li>✅ 3 generations/day</li>
              <li>✅ GPT-4o-mini model</li>
              <li>✅ Save & view history</li>
              <li class="text-dark-700">❌ Export</li>
            </ul>
            <div class="mt-8 p-3 bg-dark-800 rounded-lg text-center text-dark-400 text-sm">
              Current plan (or create a free account)
            </div>
          </div>

          <!-- Pro Monthly -->
          <div class="card border-primary-500/50 relative">
            <span class="absolute top-0 right-4 -mt-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">Most Popular</span>
            <h3 class="text-lg font-semibold text-primary-500">Pro Monthly</h3>
            <p class="text-4xl font-bold text-white mt-2">$19<span class="text-lg font-normal text-dark-400">/mo</span></p>
            <ul class="mt-6 space-y-3 text-dark-400 text-sm">
              <li>✅ 50 generations/day</li>
              <li>✅ GPT-4o (Advanced)</li>
              <li>✅ Unlimited history</li>
              <li>✅ Export as PDF</li>
              <li>✅ Priority support</li>
            </ul>
            <button id="pro-monthly-btn" class="mt-8 w-full btn-primary">Upgrade to Pro</button>
          </div>

          <!-- Pro Yearly -->
          <div class="card">
            <h3 class="text-lg font-semibold text-dark-400">Pro Yearly</h3>
            <p class="text-4xl font-bold text-white mt-2">$149<span class="text-lg font-normal text-dark-400">/yr</span></p>
            <p class="text-primary-500 text-sm mt-1">Save $79/year</p>
            <ul class="mt-4 space-y-3 text-dark-400 text-sm">
              <li>✅ Everything in Pro</li>
              <li>✅ 2 months free</li>
              <li>✅ API access</li>
            </ul>
            <button id="pro-yearly-btn" class="mt-6 w-full btn-secondary">Go Yearly</button>
          </div>
        </div>

        <a href="/dashboard" class="block text-center mt-8 text-dark-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </a>
      </div>
    </div>

    <script>
      document.getElementById('pro-monthly-btn').addEventListener('click', handleCheckout('pro'));
      document.getElementById('pro-yearly-btn').addEventListener('click', handleCheckout('pro-yearly'));

      function handleCheckout(plan) {
        return async () => {
          const token = localStorage.getItem('token');
          if (!token) {
            window.location.href = '/auth/login';
            return;
          }

          try {
            const res = await fetch('/api/subscription/checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            window.location.href = data.url;
          } catch (err) {
            alert(err.message);
          }
        };
      }
    </script>
  `
});
}
