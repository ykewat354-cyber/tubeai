/**
 * Dashboard — Main Generator Page
 *
 * Features:
 * - Topic input with format selector
 * - AI content generation with loading states
 * - Recent generation history list
 * - Usage tracking display
 *
 * Responsive:
 * - Mobile: Single column, stacked form elements, bottom nav (DashboardLayout)
 * - Desktop: Centered max-width form with sidebar navigation
 */
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardPage() {
  var user = { name: 'Creator', plan: 'free' }; // Placeholder, fetched from API in real app

  var children = \`
    <script>
      // Auth check — redirect to login if no token
      if (typeof window !== 'undefined') {
        var token = tryGetToken();
        if (!token) { window.location.href = '/auth/login'; }
      }
      function tryGetToken() {
        try { return localStorage.getItem('token'); } catch(e) { return null; }
      }
    <\/script>

    <div class="max-w-2xl lg:max-w-4xl mx-auto">
      <div class="mb-4 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Generate YouTube Content</h2>
        <p class="text-dark-400 text-sm sm:text-base">Describe your video topic and AI will create ideas, titles, and scripts.</p>
      </div>

      <!-- Generation Form -->
      <div class="card mb-6 sm:mb-8">
        <form id="generate-form" class="space-y-5 sm:space-y-6">
          <div>
            <label for="topic-input" class="block text-sm text-dark-400 mb-2">What is your video about?</label>
            <textarea id="topic-input" class="input-field min-h-[120px] resize-y text-sm sm:text-base" placeholder="e.g., A tutorial on how to start a vegetable garden in small spaces. Target audience is beginners who live in apartments." required></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div class="w-full sm:w-auto">
              <label for="format-select" class="block text-sm text-dark-400 mb-2">Output Format</label>
              <select id="format-select" class="input-field min-h-[44px] w-full sm:w-64 text-sm">
                <option value="all">Ideas + Titles + Script</option>
                <option value="ideas">Video Ideas Only</option>
                <option value="titles">Titles Only</option>
                <option value="script">Full Script Only</option>
              </select>
            </div>
            <button type="submit" id="generate-btn" class="btn-primary w-full sm:w-auto min-h-[44px]">✨ Generate</button>
          </div>
        </form>

        <!-- Error -->
        <div id="error-message" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden" role="alert"></div>

        <!-- Loading -->
        <div id="loading-state" class="mt-6 text-center hidden">
          <div class="inline-block spinner mb-3"></div>
          <p class="text-dark-400 text-sm">AI is working its magic... This may take a moment.</p>
        </div>

        <!-- Result -->
        <div id="result-container" class="mt-6 hidden fade-in">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm sm:text-base font-semibold text-white">Generated Content</h3>
            <span id="usage-badge" class="text-xs text-dark-500 bg-dark-800 px-2 sm:px-3 py-1 rounded-full"></span>
          </div>
          <div id="result-content" class="bg-dark-950 border border-dark-800 rounded-lg p-4 sm:p-6 text-dark-300 text-xs sm:text-sm whitespace-pre-wrap overflow-auto max-h-[50vh] sm:max-h-[600px]"></div>
        </div>
      </div>

      <!-- Recent Generations -->
      <div>
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-lg font-semibold text-white">Recent Generations</h3>
          <a href="/dashboard/history" class="text-xs sm:text-sm text-primary-500 hover:text-primary-400">View All →</a>
        </div>
        <div id="recent-generations" class="space-y-2 sm:space-y-3">
          <div class="text-center py-8 text-dark-500 text-sm">📭 No generations yet. Create your first one above!</div>
        </div>
      </div>
    </div>

    <script>
      (function() {
        var API_URL = '/api';

        function getToken() {
          try { return localStorage.getItem('token'); } catch(e) { return null; }
        }

        async function loadRecentGenerations() {
          var token = getToken();
          try {
            var res = await fetch(API_URL + '/history?page=1&limit=5', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
              var data = await res.json();
              var container = document.getElementById('recent-generations');
              if (data.data.length === 0) return;
              container.innerHTML = data.data.map(function(item) {
                var date = new Date(item.createdAt).toLocaleDateString();
                return '<div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-dark-900/50 border border-dark-800 rounded-lg gap-2">' +
                  '<div><p class="text-white font-medium text-sm truncate max-w-md">' + item.topic + '</p>' +
                  '<div class="flex gap-2 mt-1"><span class="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded">' + item.format + '</span>' +
                  '<span class="text-xs text-dark-500">' + date + '</span></div></div>' +
                  '<a href="/dashboard/history/detail/' + item.id + '" class="text-sm text-primary-500 hover:text-primary-400 flex-shrink-0">View</a></div>';
              }).join('');
            }
          } catch(e) {
            console.error('Failed to load history:', e);
          }
        }

        var form = document.getElementById('generate-form');
        form.addEventListener('submit', async function(e) {
          e.preventDefault();

          var topic = document.getElementById('topic-input').value.trim();
          var format = document.getElementById('format-select').value;
          var btn = document.getElementById('generate-btn');
          var loading = document.getElementById('loading-state');
          var errorDiv = document.getElementById('error-message');
          var resultContainer = document.getElementById('result-container');
          var resultContent = document.getElementById('result-content');

          if (!topic) return;

          errorDiv.classList.add('hidden');
          resultContainer.classList.add('hidden');
          loading.classList.remove('hidden');
          btn.disabled = true;
          btn.textContent = '⏳ Generating...';

          try {
            var token = getToken();
            var res = await fetch(API_URL + '/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({ topic: topic, format: format }),
            });
            var data = await res.json();

            if (!res.ok) {
              if (res.status === 429) {
                throw new Error('Daily limit reached (' + data.used + '/' + data.limit + '). Upgrade to Pro for more.');
              }
              throw new Error(data.error || 'Generation failed');
            }

            try {
              var resultText = typeof data.data.result === 'string' ? data.data.result : JSON.stringify(data.data.result, null, 2);
              resultContent.textContent = resultText;
            } catch (parseErr) {
              resultContent.textContent = JSON.stringify(data.data, null, 2);
            }
            resultContainer.classList.remove('hidden');

            if (data.usage) {
              document.getElementById('usage-badge').textContent = 'Usage: ' + data.usage.used + '/' + data.usage.limit + ' today';
            }
            await loadRecentGenerations();
          } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
          } finally {
            loading.classList.add('hidden');
            btn.disabled = false;
            btn.textContent = '✨ Generate';
          }
        });

        // Load recent on mount
        if (typeof window !== 'undefined' && document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadRecentGenerations);
        } else {
          loadRecentGenerations();
        }
      })();
    <\/script>
  \`;

  return DashboardLayout({ user: user, children: children });
}
