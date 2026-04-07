/**
 * Admin Panel — Basic dashboard for admins
 *
 * Access: ?admin_key=YOUR_ADMIN_API_KEY
 *
 * Features:
 * - Platform stats (users, generations, MRR)
 * - User list with search
 * - User detail view
 * - Plan management
 */

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function AdminPage() {
  return `
    <div class="min-h-screen bg-dark-950">
      <!-- Top bar -->
      <header class="border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <span class="text-lg font-bold text-white">🛡️ Tube<span class="text-primary-500">AI</span> Admin</span>
          <div class="flex items-center gap-3">
            <input type="password" id="admin-key-input" class="input-field min-h-[36px] text-sm w-48" placeholder="Admin API Key" value="${ADMIN_KEY}" />
            <button id="connect-btn" class="btn-primary text-sm min-h-[36px] px-3">Connect</button>
            <a href="/" class="text-sm text-dark-400 hover:text-white">← Back to App</a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto p-4 sm:p-6">
        <!-- Stats Cards -->
        <div id="stats-section" class="mb-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-grid">
            <div class="card text-center"><p class="text-dark-400 text-sm">Users</p><p id="stat-users" class="text-2xl font-bold text-white">--</p></div>
            <div class="card text-center"><p class="text-dark-400 text-sm">Active Today</p><p id="stat-active" class="text-2xl font-bold text-green-400">--</p></div>
            <div class="card text-center"><p class="text-dark-400 text-sm">Generations</p><p id="stat-gens" class="text-2xl font-bold text-primary-500">--</p></div>
            <div class="card text-center"><p class="text-dark-400 text-sm">Est. MRR</p><p id="stat-mrr" class="text-2xl font-bold text-yellow-400">--</p></div>
          </div>
        </div>

        <!-- Plan Distribution -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-white mb-3">Plan Distribution</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="plan-grid">
            <div class="card"><p class="text-dark-400 text-sm">Free</p><p id="plan-free" class="text-xl font-bold text-white">--</p></div>
            <div class="card"><p class="text-dark-400 text-sm">Pro Monthly</p><p id="plan-pro" class="text-xl font-bold text-primary-500">--</p></div>
            <div class="card"><p class="text-dark-400 text-sm">Pro Yearly</p><p id="plan-pro-yearly" class="text-xl font-bold text-green-400">--</p></div>
          </div>
        </div>

        <!-- User List -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold text-white">Users</h2>
            <div class="flex gap-2">
              <input type="text" id="user-search" class="input-field min-h-[40px] text-sm" placeholder="Search users..." />
              <button id="search-users-btn" class="btn-secondary text-sm min-h-[40px] px-4">Search</button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-dark-400 text-left border-b border-dark-800">
                  <th class="py-2 px-3">Name</th>
                  <th class="py-2 px-3 hidden sm:table-cell">Email</th>
                  <th class="py-2 px-3">Plan</th>
                  <th class="py-2 px-3 hidden md:table-cell">Gens</th>
                  <th class="py-2 px-3 hidden lg:table-cell">Verified</th>
                  <th class="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody id="users-body">
                <tr><td colspan="6" class="py-8 text-center text-dark-500 text-sm">Click "Connect" to load data</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4">
            <p id="user-count" class="text-dark-400 text-sm"></p>
            <div class="flex gap-2">
              <button id="prev-page" class="btn-secondary text-sm min-h-[36px] px-3" disabled>Previous</button>
              <button id="next-page" class="btn-secondary text-sm min-h-[36px] px-3">Next</button>
            </div>
          </div>
        </div>

        <!-- User Detail Modal -->
        <div id="user-modal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div class="card max-w-lg w-full max-h-[80vh] overflow-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-white" id="modal-title">User Detail</h3>
              <button onclick="closeModal()" class="text-dark-400 hover:text-white text-xl">&times;</button>
            </div>
            <div id="modal-content"></div>
          </div>
        </div>
      </main>

      <script>
        (function() {
          var adminKey = '${ADMIN_KEY}';
          var currentPage = 1;

          document.getElementById('connect-btn').addEventListener('click', function() {
            adminKey = document.getElementById('admin-key-input').value.trim();
            if (!adminKey) { alert('Enter admin API key'); return; }
            loadStats();
            loadUsers(1);
          });

          function headers() { return { 'x-admin-key': adminKey }; }

          async function loadStats() {
            try {
              var res = await fetch('${API_URL}/admin/stats', { headers: headers() });
              if (!res.ok) { alert('Auth failed or stats unavailable'); return; }
              var data = (await res.json()).data;

              document.getElementById('stat-users').textContent = data.totalUsers || 0;
              document.getElementById('stat-active').textContent = data.activeUsersToday || 0;
              document.getElementById('stat-gens').textContent = data.totalGenerations || 0;
              document.getElementById('stat-mrr').textContent = data.estimatedMRR || '$0';

              if (data.planDistribution) {
                data.planDistribution.forEach(function(p) {
                  var id = 'plan-' + p.plan;
                  var el = document.getElementById(id);
                  if (el) el.textContent = p._count.id || 0;
                });
              }
            } catch (e) { console.error('Stats load failed:', e); }
          }

          async function loadUsers(page) {
            var search = document.getElementById('user-search').value.trim();
            var url = '${API_URL}/admin/users?page=' + page + '&limit=20' + (search ? '&search=' + encodeURIComponent(search) : '');

            try {
              var res = await fetch(url, { headers: headers() });
              if (!res.ok) { alert('Failed to load users'); return; }
              var json = await res.json();
              var users = json.data.users;
              var pagination = json.meta;

              var tbody = document.getElementById('users-body');
              if (!users || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-dark-500 text-sm">No users found</td></tr>';
                return;
              }

              tbody.innerHTML = users.map(function(u) {
                return '<tr class="border-b border-dark-800">' +
                  '<td class="py-2 px-3"><button class="text-primary-500 hover:text-primary-400 text-sm font-medium" onclick="loadUserDetail(\\'' + u.id + '\\')">' + u.name + '</button></td>' +
                  '<td class="py-2 px-3 text-dark-400 hidden sm:table-cell text-xs">' + u.email + '</td>' +
                  '<td class="py-2 px-3"><span class="text-xs px-2 py-0.5 rounded ' + planBadge(u.plan) + '">' + u.plan + '</span></td>' +
                  '<td class="py-2 px-3 text-dark-400 hidden md:table-cell">' + (u._count && u._count.generations) + '</td>' +
                  '<td class="py-2 px-3 hidden lg:table-cell">' + (u.emailVerified ? '✅' : '❌') + '</td>' +
                  '<td class="py-2 px-3"><button onclick="loadUserDetail(\\'' + u.id + '\\')" class="text-xs text-primary-500 hover:text-primary-400">View</button></td>' +
                '</tr>';
              }).join('');

              if (pagination) {
                document.getElementById('user-count').textContent = 'Showing ' + users.length + ' of ' + pagination.total;
                document.getElementById('next-page').disabled = page >= pagination.totalPages;
                document.getElementById('prev-page').disabled = page <= 1;
              }
            } catch (e) { console.error('Users load failed:', e); }
          }

          window.loadUserDetail = async function(id) {
            try {
              var res = await fetch('${API_URL}/admin/user/' + id, { headers: headers() });
              var data = (await res.json()).data;
              var u = data.user;

              document.getElementById('modal-title').textContent = u.name;

              var gensHtml = (u.generations || []).map(function(g) {
                return '<div class="flex justify-between text-sm py-1 border-b border-dark-800"><span class="text-dark-300 truncate max-w-xs">' + g.topic + '</span><span class="text-dark-500 text-xs">' + new Date(g.createdAt).toLocaleDateString() + ' — ' + g.format + '</span></div>';
              }).join('') || '<p class="text-dark-500 text-sm">No generations</p>';

              document.getElementById('modal-content').innerHTML =
                '<div class="space-y-3 text-sm">' +
                '<div><span class="text-dark-400">Email:</span> <span class="text-white">' + u.email + '</span></div>' +
                '<div><span class="text-dark-400">Plan:</span> <span class="text-white capitalize">' + u.plan + '</span></div>' +
                '<div><span class="text-dark-400">Verified:</span> <span>' + (u.emailVerified ? '✅ Yes' : '❌ No') + '</span></div>' +
                '<div><span class="text-dark-400">Total generations:</span> <span class="text-white">' + (u._count && u._count.generations) + '</span></div>' +
                '<div><span class="text-dark-400">Joined:</span> <span class="text-white">' + new Date(u.createdAt).toLocaleDateString() + '</span></div>' +
                '<div class="mt-4">' +
                '<h4 class="text-white font-medium mb-2">Recent Generations</h4>' + gensHtml +
                '</div>' +
                '</div>';

              document.getElementById('user-modal').classList.remove('hidden');
            } catch (e) { alert('Failed to load user detail'); }
          };

          window.closeModal = function() {
            document.getElementById('user-modal').classList.add('hidden');
          };

          function planBadge(plan) {
            if (plan === 'pro') return 'bg-primary-500/10 text-primary-500';
            if (plan === 'pro-yearly') return 'bg-green-500/10 text-green-500';
            return 'bg-dark-800 text-dark-400';
          }

          document.getElementById('search-users-btn').addEventListener('click', function() { loadUsers(1); });
          document.getElementById('prev-page').addEventListener('click', function() { loadUsers(currentPage - 1); });
          document.getElementById('next-page').addEventListener('click', function() { loadUsers(currentPage + 1); });

          // Close modal on escape
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
          });
        })();
      <\\/script>
    </div>
  `;
}
