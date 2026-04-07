export default function DashboardLayout({ children, user }) {
  return `
    <div class="min-h-screen bg-dark-950 flex">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-dark-800 bg-dark-900/50 p-6 hidden md:block">
        <div class="mb-8">
          <a href="/dashboard" class="text-xl font-bold text-white flex items-center gap-2">
            🎬 Tube<span class="text-primary-500">AI</span>
          </a>
        </div>

        <nav class="space-y-2">
          <a href="/dashboard" class="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary-500/10 text-primary-500 font-medium">
            ✏️ Generate
          </a>
          <a href="/dashboard/history" class="flex items-center gap-3 px-4 py-2 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors">
            📋 History
          </a>
          <a href="/pricing" class="flex items-center gap-3 px-4 py-2 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors">
            ⭐ Upgrade
          </a>
        </nav>

        <!-- User info -->
        <div class="mt-8 p-4 bg-dark-800 rounded-lg">
          <p class="text-sm text-dark-400">Plan</p>
          <p class="text-white font-semibold capitalize">${user?.plan || 'Free'}</p>
          ${user?.plan === 'free' ? `
            <a href="/pricing" class="mt-2 block text-xs text-primary-500 hover:text-primary-400">
              Upgrade to Pro →
            </a>
          ` : ''}
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-h-screen">
        <!-- Top Bar -->
        <header class="border-b border-dark-800 px-6 py-4 flex items-center justify-between">
          <h1 class="text-xl font-semibold text-white">Dashboard</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-dark-400">${user?.name || 'User'}</span>
            <button onclick="handleLogout()" class="text-sm text-dark-400 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 p-6">
          ${children}
        </div>
      </main>
    </div>
  `;
}
