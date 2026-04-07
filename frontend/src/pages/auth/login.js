/**
 * Login Page
 * Responsive: Full-width card centered on all screen sizes
 * Touch-friendly inputs and buttons
 */
export default function LoginPage() {
  return \`
    <div class="min-h-screen flex items-center justify-center bg-dark-950 py-8 sm:py-12 px-4">
      <div class="w-full max-w-sm sm:max-w-md card fade-in p-5 sm:p-6">
        <div class="text-center mb-6 sm:mb-8">
          <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">🎬 Tube<span class="text-primary-500">AI</span></a>
          <h2 class="text-xl font-semibold text-white mt-4">Welcome back</h2>
          <p class="text-dark-400 text-sm mt-1">Log in to continue generating</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm text-dark-400 mb-1.5">Email</label>
            <input type="email" id="email" class="input-field min-h-[44px]" placeholder="you@example.com" autocomplete="email" required />
          </div>
          <div>
            <label for="password" class="block text-sm text-dark-400 mb-1.5">Password</label>
            <input type="password" id="password" class="input-field min-h-[44px]" placeholder="••••••••" autocomplete="current-password" required />
          </div>
        </div>

        <div id="error-message" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden" role="alert"></div>

        <button id="login-btn" class="w-full btn-primary mt-6 min-h-[44px]" type="button">Log In</button>

        <div class="text-center mt-6">
          <div class="text-center mt-4">
            <a href="/auth/register" class="text-sm text-primary-500 hover:text-primary-400">Don't have an account? Sign up</a>
          </div>
          <div class="text-center mt-2">
            <a href="/auth/reset-password" class="text-sm text-dark-500 hover:text-dark-400">Forgot password?</a>
          </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('login-btn').addEventListener('click', async function() {
              var email = document.getElementById('email').value.trim();
              var password = document.getElementById('password').value;
              var errorDiv = document.getElementById('error-message');
              var btn = document.getElementById('login-btn');

              // Client-side validation
              if (!email || !password) {
                errorDiv.textContent = 'Please fill in all fields';
                errorDiv.classList.remove('hidden');
                return;
              }

              errorDiv.classList.add('hidden');
              btn.disabled = true;
              btn.textContent = 'Logging in...';

              try {
                var res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email, password: password }),
                });
                var data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Login failed');

                try { localStorage.setItem('token', data.token); } catch(e) {}
                window.location.href = '/dashboard';
              } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = 'Log In';
              }
            });

            // Allow Enter key to submit
            var inputs = document.querySelectorAll('#email, #password');
            inputs.forEach(function(input) {
              input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('login-btn').click();
              });
            });
          });
        <\/script>
      </div>
    </div>
  \`;
}
