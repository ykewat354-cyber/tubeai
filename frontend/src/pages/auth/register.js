export default function RegisterPage() {
  return `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-950 py-12 px-4">
      <div class="max-w-md w-full card fade-in">
        <div class="text-center mb-8">
          <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">
            🎬 Tube<span class="text-primary-500">AI</span>
          </a>
          <h2 class="text-xl font-semibold text-white mt-4">Create your account</h2>
          <p class="text-dark-400 text-sm">Start generating AI-powered YouTube content</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm text-dark-400 mb-1">Full Name</label>
          <input type="text" id="name" class="input-field" placeholder="John Doe" required />
        </div>
        <div class="mb-4">
          <label class="block text-sm text-dark-400 mb-1">Email</label>
          <input type="email" id="email" class="input-field" placeholder="you@example.com" required />
        </div>
        <div class="mb-6">
          <label class="block text-sm text-dark-400 mb-1">Password (min 8 characters)</label>
          <input type="password" id="password" class="input-field" placeholder="••••••••" minlength="8" required />
        </div>

        <div id="error-message" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden"></div>

        <button id="register-btn" class="w-full btn-primary" type="button">Create Account</button>

        <div class="text-center mt-6">
          <a href="/auth/login" class="text-sm text-primary-500 hover:text-primary-400">
            Already have an account? Log in
          </a>
        </div>

        <script>
          document.getElementById('register-btn').addEventListener('click', async () => {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            const btn = document.getElementById('register-btn');

            errorDiv.classList.add('hidden');

            if (password.length < 8) {
              errorDiv.textContent = 'Password must be at least 8 characters';
              errorDiv.classList.remove('hidden');
              return;
            }

            btn.disabled = true;
            btn.textContent = 'Creating account...';

            try {
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
              });
              const data = await res.json();

              if (!res.ok) throw new Error(data.error);

              localStorage.setItem('token', data.token);
              window.location.href = '/dashboard';
            } catch (err) {
              errorDiv.textContent = err.message;
              errorDiv.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Create Account';
            }
          });
        </script>
      </div>
    </div>
  `;
}
