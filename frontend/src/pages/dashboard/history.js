/**
 * Generation History Page
 * Lists all user's past generations with search and pagination
 * Responsive: Mobile single-column, desktop cards with actions row
 */
export default function HistoryPage() {
  return \`
    <div class="min-h-screen bg-dark-950">
      <div class="max-w-4xl lg:max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-white">Generation History</h1>
            <p class="text-dark-400 text-sm mt-1">View and manage all your AI generations</p>
          </div>
          <a href="/dashboard" class="btn-secondary text-sm min-h-[40px] inline-flex items-center justify-center">← Back to Generate</a>
        </div>

        <!-- Search -->
        <div class="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <input type="text" id="search-input" class="input-field flex-1 min-h-[44px] text-sm" placeholder="Search by topic..." />
          <button id="search-btn" class="btn-secondary text-sm min-h-[44px] px-4 sm:px-6 flex-shrink-0">Search</button>
        </div>

        <!-- Generations List -->
        <div id="generations-list" class="space-y-2 sm:space-y-3">
          <div class="text-center py-12 text-dark-500 text-sm">
            <div class="text-3xl sm:text-4xl mb-3">🔍</div>
            <p>Loading history...</p>
          </div>
        </div>

        <!-- Pagination -->
        <div id="pagination" class="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 hidden">
          <button id="prev-btn" class="btn-secondary text-sm min-h-[40px] px-4" disabled>Previous</button>
          <span id="page-info" class="text-dark-400 text-sm">Page 1 of 1</span>
          <button id="next-btn" class="btn-secondary text-sm min-h-[40px] px-4">Next</button>
        </div>
      </div>

      <script>
        (function() {
          var API_URL = '/api';
          var currentPage = 1;
          var totalPages = 1;

          function getToken() {
            try { return localStorage.getItem('token'); } catch(e) { return null; }
          }

          async function fetchHistory(page) {
            var token = getToken();
            if (!token) { window.location.href = '/auth/login'; return; }

            try {
              var res = await fetch(API_URL + '/history?page=' + page + '&limit=20', {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (!res.ok) throw new Error('Failed to load');

              var data = await res.json();
              currentPage = data.pagination.page;
              totalPages = data.pagination.totalPages;

              var container = document.getElementById('generations-list');

              if (data.data.length === 0) {
                container.innerHTML = '<div class="text-center py-12 text-dark-500 text-sm"><div class="text-3xl sm:text-4xl mb-3">📭</div><p>No generations yet.</p><a href="/dashboard" class="text-primary-500 hover:text-primary-400 inline-block mt-2">Create your first →</a></div>';
                document.getElementById('pagination').classList.add('hidden');
                return;
              }

              container.innerHTML = data.data.map(function(item) {
                var date = new Date(item.createdAt).toLocaleString();
                return '<div class="card fade-in p-3 sm:p-4"><div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">' +
                  '<div class="flex-1 min-w-0"><h3 class="text-white font-semibold mb-1 truncate">' + item.topic + '</h3>' +
                  '<div class="flex flex-wrap gap-2 items-center">' +
                  '<span class="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-medium uppercase">' + item.format + '</span>' +
                  '<span class="text-xs text-dark-500">via ' + item.model + '</span>' +
                  '<span class="text-xs text-dark-500 hidden sm:inline">• ' + date + '</span></div></div>' +
                  '<div class="flex gap-2 flex-shrink-0">' +
                  '<a href="/dashboard/history/detail/' + item.id + '" class="btn-secondary text-sm px-3 py-1.5 min-h-[36px]">View</a>' +
                  '<button onclick="deleteGeneration(\'' + item.id + '\')" class="text-sm text-dark-500 hover:text-red-400 px-2 min-w-[36px] min-h-[36px] flex items-center justify-center">🗑</button>' +
                  '</div></div></div>';
              }).join('');

              var paginationEl = document.getElementById('pagination');
              if (totalPages > 1) {
                paginationEl.classList.remove('hidden');
                document.getElementById('page-info').textContent = 'Page ' + currentPage + ' of ' + totalPages;
                document.getElementById('prev-btn').disabled = currentPage <= 1;
                document.getElementById('next-btn').disabled = currentPage >= totalPages;
              } else {
                paginationEl.classList.add('hidden');
              }
            } catch(e) {
              document.getElementById('generations-list').innerHTML = '<div class="text-center py-12 text-red-400 text-sm"><p>Failed to load history. Please try again.</p></div>';
            }
          }

          window.deleteGeneration = async function(id) {
            if (!confirm('Delete this generation?')) return;
            var token = getToken();
            try {
              var res = await fetch(API_URL + '/generate/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (res.ok) fetchHistory(currentPage);
            } catch(e) { alert('Failed to delete'); }
          };

          document.getElementById('prev-btn').addEventListener('click', function() { fetchHistory(currentPage - 1); });
          document.getElementById('next-btn').addEventListener('click', function() { fetchHistory(currentPage + 1); });

          fetchHistory(1);
        })();
      <\/script>
    </div>
  \`;
}
