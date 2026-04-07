export default function LoginPage() {
  return `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-950 py-12 px-4">
      <div class="max-w-md w-full card fade-in">
        <div class="text-center mb-8">
          <a href="/" class="text-2xl font-bold text-white inline-flex items-center gap-2">
            🎬 Tube<span class="text-primary-500">AI</span>
          </a>
          <h2 class="text-xl font-semibold text-white mt-4">Welcome back</h2>
          <p class="text-dark-400 text-sm">Log in to continue generating</p>
        </div>

        <div id="login-form">
          <div class="mb-4">
            <label class="block text-sm text-dark-400 mb-1">Email</label>
            <input type="email" id="email" class="input-field" placeholder="you@example.com" required />
          </div>
          <div class="mb-6">
            <label class="block text-sm text-dark-400 mb-1">Password</label>
            <input type="password" id="password" class="input-field" placeholder="••••••••" required />
          </div>

          <div id="error-message" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden"></div>

          <button id="login-btn" class="w-full btn-primary" type="button">Log In</button>

          <div class="text-center mt-6">
            <a href="/auth/register" class="text-sm text-primary-500 hover:text-primary-400">
              Don't have an account? Sign up
            </a>
          </div>
        </div>

        <script>
          document.getElementById('login-btn').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            const btn = document.getElementById('login-btn');

            errorDiv.classList.add('hidden');
            btn.disabled = true;
            btn.textContent = 'Logging in...';

            try {
              const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
              });
              const data = await res.json();

              if (!res.ok) throw new Error(data.error);

              localStorage.setItem('token', data.token);
              window.location.href = '/dashboard';
            } catch (err) {
              errorDiv.textContent = err.message;
              errorDiv.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Log In';
            }
          });
        </script>
      </div>
    </div>
  `;
}
