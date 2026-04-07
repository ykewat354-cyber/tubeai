/**
 * Dashboard Layout Component
 *
 * Provides sidebar navigation for authenticated users.
 * Responsive design:
 * - Mobile: Bottom navigation bar (full width, 44px+ touch targets)
 * - Tablet (md+): Left sidebar (200px)
 * - Desktop (lg+): Full sidebar (256px)
 *
 * @param {object} props
 * @param {string} props.children - Page content
 * @param {object} props.user - Current user object
 * @returns {string} HTML string for SSR
 */
export default function DashboardLayout({ children, user }) {
  return \`
    <div class="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      <!-- Top bar for mobile (sticky) -->
      <header class="md:hidden border-b border-dark-800 px-4 h-14 flex items-center justify-between bg-dark-950 sticky top-0 z-40">
        <span class="text-lg font-bold text-white">🎬 Tube<span class="text-primary-500">AI</span></span>
        <div class="flex items-center gap-3">
          <span class="text-sm text-dark-400">\${user?.name || 'User'}</span>
          <button onclick="handleLogout()" class="text-dark-400 hover:text-white p-2" aria-label="Logout">⬅</button>
        </div>
      </header>

      <!-- Desktop Sidebar (hidden on mobile) -->
      <aside class="hidden md:block w-52 lg:w-64 border-r border-dark-800 bg-dark-900/50 p-4 lg:p-6 flex-shrink-0">
        <div class="mb-6 lg:mb-8">
          <a href="/dashboard" class="text-xl font-bold text-white flex items-center gap-2">🎬 Tube<span class="text-primary-500">AI</span></a>
        </div>
        <nav class="space-y-1 lg:space-y-2">
          <a href="/dashboard" class="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 rounded-lg bg-primary-500/10 text-primary-500 font-medium text-sm">✏️ Generate</a>
          <a href="/dashboard/history" class="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors text-sm">📋 History</a>
          <a href="/pricing" class="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors text-sm">⭐ Upgrade</a>
        </nav>
        <div class="mt-6 lg:mt-8 p-3 lg:p-4 bg-dark-800 rounded-lg">
          <p class="text-xs lg:text-sm text-dark-400">Plan</p>
          <p class="text-sm lg:text-base text-white font-semibold capitalize mt-1">\${user?.plan || 'Free'}</p>
          \${user?.plan === 'free' ? '<a href="/pricing" class="mt-2 block text-xs text-primary-500 hover:text-primary-400">Upgrade to Pro →</a>' : ''}
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        <!-- Desktop Top Bar -->
        <header class="hidden md:flex border-b border-dark-800 px-4 lg:px-6 py-3 lg:py-4 items-center justify-between flex-shrink-0">
          <h1 class="text-lg lg:text-xl font-semibold text-white">Dashboard</h1>
          <div class="flex items-center gap-3 lg:gap-4">
            <span class="text-sm text-dark-400">\${user?.name || 'User'}</span>
            <button onclick="handleLogout()" class="text-sm text-dark-400 hover:text-white transition-colors min-h-[36px] px-3 py-1.5">Logout</button>
          </div>
        </header>
        <main class="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          \${children}
        </main>
      </div>

      <!-- Mobile Bottom Navigation -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 border-t border-dark-800 bg-dark-900/95 backdrop-blur-sm z-40">
        <div class="flex h-14">
          <a href="/dashboard" class="flex-1 flex flex-col items-center justify-center text-primary-500 text-xs min-w-0">✏️<br/>Generate</a>
          <a href="/dashboard/history" class="flex-1 flex flex-col items-center justify-center text-dark-400 text-xs min-w-0">📋<br/>History</a>
          <a href="/pricing" class="flex-1 flex flex-col items-center justify-center text-dark-400 text-xs min-w-0">⭐<br/>Upgrade</a>
        </div>
      </nav>

      <!-- Bottom padding for mobile nav -->
      <div class="md:hidden h-14"></div>

      <script>
        function handleLogout() {
          try { localStorage.removeItem('token'); } catch (e) {}
          window.location.href = '/auth/login';
        }
      <\/script>
    </div>
  \`;
}
