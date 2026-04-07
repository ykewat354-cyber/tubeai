/**
 * Email Verification Page
 *
 * User clicks link from verification email → this page.
 * Token is in URL: /auth/verify-email?token=xxx
 *
 * Flow:
 * 1. Extract token from URL
 * 2. Send to /api/auth/verify-email
 * 3. Show success or error
 * 4. Redirect to dashboard on success
 */

export default function VerifyEmailPage() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-dark-950 py-8 sm:py-12 px-4">
      <div class="w-full max-w-sm sm:max-w-md card fade-in p-6 sm:p-8 text-center">
        <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">🎬 Tube<span class="text-primary-500">AI</span></a>

        <!-- Loading state -->
        <div id="verify-loading" class="py-8">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-dark-400 text-sm">Verifying your email...</p>
        </div>

        <!-- Success state -->
        <div id="verify-success" class="hidden py-4">
          <div class="text-5xl sm:text-6xl mb-4">✅</div>
          <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p class="text-dark-400 text-sm sm:text-base mb-6">Your account is now active. Start creating amazing YouTube content.</p>
          <a href="/dashboard" class="btn-primary min-h-[44px] inline-block px-8">Go to Dashboard →</a>
        </div>

        <!-- Error state -->
        <div id="verify-error" class="hidden py-4">
          <div class="text-5xl sm:text-6xl mb-4">❌</div>
          <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p id="error-message" class="text-red-400 text-sm mb-4">Invalid or expired token.</p>
          <div class="space-y-3">
            <a href="/auth/login" class="btn-primary min-h-[44px] inline-block px-8">Go to Login</a>
            <div><a href="/" class="text-sm text-dark-500 hover:text-dark-400">← Back to home</a></div>
          </div>
        </div>

        <!-- Already verified -->
        <div id="verify-already" class="hidden py-4">
          <div class="text-5xl sm:text-6xl mb-4">ℹ️</div>
          <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Already Verified</h2>
          <p class="text-dark-400 text-sm mb-6">Your email was already verified. You're good to go!</p>
          <a href="/dashboard" class="btn-primary min-h-[44px] inline-block px-8">Go to Dashboard →</a>
        </div>
      </div>

      <script>
        (function() {
          var params = new URLSearchParams(window.location.search);
          var token = params.get('token');

          if (!token) {
            document.getElementById('verify-loading').classList.add('hidden');
            document.getElementById('verify-error').classList.remove('hidden');
            document.getElementById('error-message').textContent = 'No verification token found in URL.';
            return;
          }

          fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token }),
          }).then(function(r) { return r.json(); })
            .then(function(data) {
              document.getElementById('verify-loading').classList.add('hidden');
              if (data.success) {
                if (data.message && data.message.toLowerCase().includes('already')) {
                  document.getElementById('verify-already').classList.remove('hidden');
                } else {
                  // Save token if provided
                  if (data.data && data.data.user && data.data.token) {
                    try { localStorage.setItem('token', data.data.token); } catch(e) {}
                  }
                  document.getElementById('verify-success').classList.remove('hidden');
                }
              } else {
                document.getElementById('verify-error').classList.remove('hidden');
                document.getElementById('error-message').textContent = data.message || 'Verification failed.';
              }
            })
            .catch(function() {
              document.getElementById('verify-loading').classList.add('hidden');
              document.getElementById('verify-error').classList.remove('hidden');
              document.getElementById('error-message').textContent = 'Network error. Please try again.';
            });
        })();
      </script>
    </div>
  `;
}
