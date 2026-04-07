/**
 * Registration Page
 * Responsive: Full-width card centered on all screens
 * Touch-friendly inputs (44px min height)
 */
export default function RegisterPage() {
  return \`
    <div class="min-h-screen flex items-center justify-center bg-dark-950 py-8 sm:py-12 px-4">
      <div class="w-full max-w-sm sm:max-w-md card fade-in p-5 sm:p-6">
        <div class="text-center mb-6 sm:mb-8">
          <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">🎬 Tube<span class="text-primary-500">AI</span></a>
          <h2 class="text-xl font-semibold text-white mt-4">Create your account</h2>
          <p class="text-dark-400 text-sm mt-1">Start generating AI-powered YouTube content</p>
        </div>

        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm text-dark-400 mb-1.5">Full Name</label>
            <input type="text" id="name" class="input-field min-h-[44px]" placeholder="John Doe" autocomplete="name" required />
          </div>
          <div>
            <label for="email" class="block text-sm text-dark-400 mb-1.5">Email</label>
            <input type="email" id="email" class="input-field min-h-[44px]" placeholder="you@example.com" autocomplete="email" required />
          </div>
          <div>
            <label for="password" class="block text-sm text-dark-400 mb-1.5">Password (min 8 characters)</label>
            <input type="password" id="password" class="input-field min-h-[44px]" placeholder="••••••••" minlength="8" autocomplete="new-password" required />
          </div>
        </div>

        <div id="error-message" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden" role="alert"></div>

        <button id="register-btn" class="w-full btn-primary mt-6 min-h-[44px]" type="button">Create Account</button>

        <div class="text-center mt-6">
          <a href="/auth/login" class="text-sm text-primary-500 hover:text-primary-400">Already have an account? Log in</a>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('register-btn').addEventListener('click', async function() {
              var name = document.getElementById('name').value.trim();
              var email = document.getElementById('email').value.trim();
              var password = document.getElementById('password').value;
              var errorDiv = document.getElementById('error-message');
              var btn = document.getElementById('register-btn');

              // Client-side validation
              if (!name || !email || !password) {
                errorDiv.textContent = 'Please fill in all fields';
                errorDiv.classList.remove('hidden');
                return;
              }
              if (password.length < 8) {
                errorDiv.textContent = 'Password must be at least 8 characters';
                errorDiv.classList.remove('hidden');
                return;
              }

              errorDiv.classList.add('hidden');
              btn.disabled = true;
              btn.textContent = 'Creating account...';

              try {
                var res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: name, email: email, password: password }),
                });
                var data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Registration failed');

                try { localStorage.setItem('token', data.token); } catch(e) {}
                window.location.href = '/dashboard';
              } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = 'Create Account';
              }
            });

            // Allow Enter key to submit
            var inputs = document.querySelectorAll('#name, #email, #password');
            inputs.forEach(function(input) {
              input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('register-btn').click();
              });
            });
          });
        <\/script>
      </div>
    </div>
  \`;
}
