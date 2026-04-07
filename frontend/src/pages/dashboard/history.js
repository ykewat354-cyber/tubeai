export default function HistoryPage() {
  return `
    <div class="min-h-screen bg-dark-950">
      <div class="max-w-6xl mx-auto p-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-white">Generation History</h1>
            <p class="text-dark-400 text-sm mt-1">View and manage all your AI generations</p>
          </div>
          <a href="/dashboard" class="btn-secondary">← Back to Generate</a>
        </div>

        <!-- Search Bar -->
        <div class="flex gap-3 mb-6">
          <input type="text" id="search-input" class="input-field flex-1" placeholder="Search by topic..." />
          <button id="search-btn" class="btn-secondary">Search</button>
        </div>

        <!-- Generations List -->
        <div id="generations-list" class="space-y-4">
          <div class="text-center py-12 text-dark-500">
            <div class="text-4xl mb-3">🔍</div>
            <p>Loading history...</p>
          </div>
        </div>

        <!-- Pagination -->
        <div id="pagination" class="flex items-center justify-center gap-4 mt-8 hidden">
          <button id="prev-btn" class="btn-secondary text-sm" disabled>Previous</button>
          <span id="page-info" class="text-dark-400 text-sm">Page 1 of 1</span>
          <button id="next-btn" class="btn-secondary text-sm">Next</button>
        </div>
      </div>

      <script>
        const API_URL = '/api';
        let currentPage = 1;
        let totalPages = 1;

        async function fetchHistory(page = 1) {
          const token = localStorage.getItem('token');
          if (!token) {
            window.location.href = '/auth/login';
            return;
          }

          try {
            const res = await fetch(API_URL + '/history?page=' + page + '&limit=20', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to load');

            const data = await res.json();
            currentPage = data.pagination.page;
            totalPages = data.pagination.totalPages;

            const container = document.getElementById('generations-list');

            if (data.data.length === 0) {
              container.innerHTML = \`
                <div class="text-center py-12 text-dark-500">
                  <div class="text-4xl mb-3">📭</div>
                  <p>No generations yet.</p>
                  <a href="/dashboard" class="text-primary-500 hover:text-primary-400 inline-block mt-2">Create your first →</a>
                </div>
              \`;
              document.getElementById('pagination').classList.add('hidden');
              return;
            }

            container.innerHTML = data.data.map(item => {
              const date = new Date(item.createdAt).toLocaleString();
              return \`
                <div class="card fade-in">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-white font-semibold mb-1">\${item.topic}</h3>
                      <div class="flex gap-2 items-center">
                        <span class="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-medium uppercase">\${item.format}</span>
                        <span class="text-xs text-dark-500">via \${item.model}</span>
                        <span class="text-xs text-dark-500">• \${date}</span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <a href="/dashboard/history/detail/\${item.id}" class="btn-secondary text-sm px-3 py-1.5">View</a>
                      <button onclick="deleteGeneration('\${item.id}')" class="text-sm text-dark-500 hover:text-red-400 px-2">🗑️</button>
                    </div>
                  </div>
                </div>
              \`;
            }).join('');

            // Pagination
            const paginationEl = document.getElementById('pagination');
            if (totalPages > 1) {
              paginationEl.classList.remove('hidden');
              document.getElementById('page-info').textContent = 'Page ' + currentPage + ' of ' + totalPages;
              document.getElementById('prev-btn').disabled = currentPage <= 1;
              document.getElementById('next-btn').disabled = currentPage >= totalPages;
            } else {
              paginationEl.classList.add('hidden');
            }

          } catch (err) {
            document.getElementById('generations-list').innerHTML = \`
              <div class="text-center py-12 text-red-400">
                <p>Failed to load history. Please try again.</p>
              </div>
            \`;
          }
        }

        async function deleteGeneration(id) {
          if (!confirm('Are you sure you want to delete this generation?')) return;
          
          const token = localStorage.getItem('token');
          try {
            const res = await fetch(API_URL + '/generate/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) fetchHistory(currentPage);
          } catch (err) {
            alert('Failed to delete');
          }
        }

        document.getElementById('prev-btn').addEventListener('click', () => {
          fetchHistory(currentPage - 1);
        });

        document.getElementById('next-btn').addEventListener('click', () => {
          fetchHistory(currentPage + 1);
        });

        fetchHistory(1);
      <\/script>
    </div>
  `;
}
