// Password Reset Page - TubeAI Frontend
export default function ResetPasswordPage() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-dark-950 py-8 sm:py-12 px-4">
      <div class="w-full max-w-sm sm:max-w-md card fade-in p-5 sm:p-6">
        <div class="text-center mb-6 sm:mb-8">
          <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">🎬 Tube<span class="text-primary-500">AI</span></a>
          <h2 class="text-xl font-semibold text-white mt-4">Reset your password</h2>
          <p class="text-dark-400 text-sm mt-1">Enter your email to receive a reset code</p>
        </div>

        <!-- Step 1: Request reset -->
        <div id="step-request">
          <div class="mb-4">
            <label for="email-reset" class="block text-sm text-dark-400 mb-1.5">Email</label>
            <input type="email" id="email-reset" class="input-field min-h-[44px]" placeholder="you@example.com" required />
          </div>
          <button id="request-reset-btn" class="w-full btn-primary min-h-[44px]">Send Reset Code</button>
        </div>

        <!-- Step 2: Enter code and new password -->
        <div id="step-verify" class="hidden">
          <div class="mb-4">
            <label for="reset-code" class="block text-sm text-dark-400 mb-1.5">Reset Code (6 digits)</label>
            <input type="text" id="reset-code" class="input-field min-h-[44px] text-center text-2xl tracking-widest" maxlength="6" placeholder="000000" required />
          </div>
          <div class="mb-4">
            <label for="new-password" class="block text-sm text-dark-400 mb-1.5">New Password</label>
            <input type="password" id="new-password" class="input-field min-h-[44px]" placeholder="••••••••" minlength="8" required />
          </div>
          <button id="confirm-reset-btn" class="w-full btn-primary min-h-[44px]">Reset Password</button>
        </div>

        <!-- Success message -->
        <div id="success-msg" class="hidden p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
          <p class="text-lg mb-2">✅ Password Reset!</p>
          <p>You can now log in with your new password.</p>
          <a href="/auth/login" class="text-primary-500 hover:text-primary-400 inline-block mt-3">Go to Login →</a>
        </div>

        <!-- Error -->
        <div id="error-msg" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden" role="alert"></div>

        <div class="text-center mt-6">
          <a href="/auth/login" class="text-sm text-primary-500 hover:text-primary-400">← Back to Login</a>
        </div>

        <script>
          (function() {
            var email = '';
            var step = 'request';

            document.getElementById('request-reset-btn').addEventListener('click', async function() {
              email = document.getElementById('email-reset').value.trim();
              if (!email) { showError('Please enter your email'); return; }

              var btn = document.getElementById('request-reset-btn');
              btn.disabled = true;
              btn.textContent = 'Sending...';

              try {
                var res = await fetch('/api/auth/request-reset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email }),
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.message || data.error);

                // Show step 2
                document.getElementById('step-request').classList.add('hidden');
                document.getElementById('step-verify').classList.remove('hidden');
              } catch(e) {
                showError(e.message);
                btn.disabled = false;
                btn.textContent = 'Send Reset Code';
              }
            });

            document.getElementById('confirm-reset-btn').addEventListener('click', async function() {
              var code = document.getElementById('reset-code').value.trim();
              var password = document.getElementById('new-password').value;

              if (!code || code.length !== 6) { showError('Enter a valid 6-digit code'); return; }
              if (password.length < 8) { showError('Password must be at least 8 characters'); return; }

              var btn = document.getElementById('confirm-reset-btn');
              btn.disabled = true;
              btn.textContent = 'Resetting...';

              try {
                var res = await fetch('/api/auth/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email, code: code, password: password }),
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.message || data.error);

                document.getElementById('step-verify').classList.add('hidden');
                document.getElementById('success-msg').classList.remove('hidden');
              } catch(e) {
                showError(e.message);
                btn.disabled = false;
                btn.textContent = 'Reset Password';
              }
            });

            function showError(msg) {
              var el = document.getElementById('error-msg');
              el.textContent = msg;
              el.classList.remove('hidden');
              setTimeout(function() { el.classList.add('hidden'); }, 5000);
            }
          })();
        <\/script>
      </div>
    </div>
  `;
}
