/**
 * Dashboard — Main Generator Page
 * Features: topic input, format selector, AI generation, history list
 * Responsive: mobile bottom nav, desktop sidebar, touch targets ≥44px
 * UI States: loading (skeleton), error (retry), empty, results
 */
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardPage() {
  var user = { name: "Creator", plan: "free" };

  var children = `
    <script>
      if (typeof window !== 'undefined') {
        try {
          if (!localStorage.getItem('token')) window.location.href = '/auth/login';
        } catch(e) { window.location.href = '/auth/login'; }
      }
    <\/script>

    <div class="max-w-2xl lg:max-w-4xl mx-auto">
      <div class="mb-4 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">Generate YouTube Content</h2>
        <p class="text-dark-400 text-sm sm:text-base">Describe your video topic and AI will create ideas, titles, and scripts.</p>
      </div>

      <!-- Generation Form -->
      <div class="card mb-6 sm:mb-8">
        <form id="generate-form" class="space-y-5 sm:space-y-6">
          <div>
            <label for="topic-input" class="block text-sm text-dark-400 mb-2">What is your video about?</label>
            <textarea id="topic-input" class="input-field min-h-[120px] resize-y text-sm sm:text-base" placeholder="e.g., A tutorial on how to start a vegetable garden in small spaces." required></textarea>
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

        <!-- Error (hidden by default) -->
        <div id="error-container" class="mt-4 hidden">
          <div class="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400" role="alert">
            <p id="error-message" class="text-sm"></p>
            <button id="retry-btn" class="btn-secondary text-sm mt-3 min-h-[40px] px-4">Retry</button>
          </div>
        </div>

        <!-- Loading skeleton (hidden by default) -->
        <div id="loading-container" class="mt-6 hidden">
          <div class="flex flex-col items-center justify-center py-8 text-dark-400">
            <div class="spinner mb-4"></div>
            <p class="text-sm text-center">AI is working its magic... This may take up to 30 seconds.</p>
            <p class="text-xs text-dark-500 mt-2">For scripts, it might take a bit longer.</p>
          </div>
        </div>

        <!-- Result (hidden by default) -->
        <div id="result-container" class="mt-6 hidden animate-fade-in">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm sm:text-base font-semibold text-white">Generated Content</h3>
            <div class="flex items-center gap-2">
              <span id="usage-badge" class="text-xs text-dark-500 bg-dark-800 px-2 sm:px-3 py-1 rounded-full"></span>
              <button id="copy-btn" class="text-xs text-primary-500 hover:text-primary-400 min-h-[36px] px-2">Copy</button>
            </div>
          </div>
          <div class="bg-dark-950 border border-dark-800 rounded-lg max-h-[50vh] sm:max-h-[600px] overflow-auto">
            <pre id="result-content" class="p-4 sm:p-6 text-dark-300 text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto"></pre>
          </div>
        </div>
      </div>

      <!-- Recent Generations with skeleton loading -->
      <div>
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-lg font-semibold text-white">Recent Generations</h3>
          <a href="/dashboard/history" class="text-xs sm:text-sm text-primary-500 hover:text-primary-400">View All →</a>
        </div>
        <div id="recent-generations">
          <!-- Skeleton loading state -->
          <div class="space-y-2 sm:space-y-3">
            <div class="card p-3 sm:p-4"><div class="skeleton-line skeleton-line-long"></div><div class="skeleton-line skeleton-line-short mt-2"></div></div>
            <div class="card p-3 sm:p-4"><div class="skeleton-line skeleton-line-medium"></div><div class="skeleton-line skeleton-line-short mt-2"></div></div>
          </div>
        </div>
      </div>
    </div>

    <script>
      (function() {
        var API_URL = '/api';

        function getToken() { try { return localStorage.getItem('token'); } catch(e) { return null; } }

        function showError(message) {
          var container = document.getElementById('error-container');
          document.getElementById('error-message').textContent = message;
          container.classList.remove('hidden');
          hideLoading();
        }

        function hideError() {
          document.getElementById('error-container').classList.add('hidden');
        }

        function showLoading() {
          hideError();
          document.getElementById('result-container').classList.add('hidden');
          document.getElementById('loading-container').classList.remove('hidden');
          setBtnState(true, '⏳ Generating...');
        }

        function hideLoading() {
          document.getElementById('loading-container').classList.add('hidden');
          setBtnState(false, '✨ Generate');
        }

        function setBtnState(disabled, text) {
          var btn = document.getElementById('generate-btn');
          btn.disabled = disabled;
          btn.textContent = text;
        }

        function showResult(data, usage) {
          var container = document.getElementById('result-container');
          var content = document.getElementById('result-content');

          try {
            content.textContent = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
          } catch(e) {
            content.textContent = JSON.stringify(data, null, 2);
          }

          container.classList.remove('hidden');
          hideLoading();

          if (usage) {
            document.getElementById('usage-badge').textContent = 'Usage: ' + usage.used + '/' + usage.limit + ' today';
          }
        }

        function formatTopic(text, maxLen) {
          if (!text) return '';
          return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
        }

        async function loadRecentGenerations() {
          var container = document.getElementById('recent-generations');
          try {
            var res = await fetch(API_URL + '/history?page=1&limit=5', {
              headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            if (res.ok) {
              var data = await res.json();
              var list = data.data;

              if (list.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-dark-500 text-sm"><p>📭 No generations yet. Create your first one above!</p></div>';
                return;
              }

              container.innerHTML = '<div class="space-y-2 sm:space-y-3">' + list.map(function(item) {
                var date = new Date(item.createdAt).toLocaleDateString();
                return '<div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-dark-900/50 border border-dark-800 rounded-lg gap-2">' +
                  '<div class="min-w-0"><p class="text-white font-medium text-sm truncate">' + formatTopic(item.topic, 60) + '</p>' +
                  '<div class="flex gap-2 mt-1"><span class="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded">' + item.format + '</span>' +
                  '<span class="text-xs text-dark-500">' + date + '</span></div></div>' +
                  '<a href="/dashboard/history/detail/' + item.id + '" class="text-sm text-primary-500 hover:text-primary-400 flex-shrink-0">View</a></div>';
              }).join('') + '</div>';
            } else {
              container.innerHTML = '<div class="text-center py-8 text-dark-500 text-sm"><p>📭 No generations yet. Create your first one above!</p></div>';
            }
          } catch(e) {
            // Silently fail — history isn't critical for the generation flow
            container.innerHTML = '';
          }
        }

        // Form submission
        var form = document.getElementById('generate-form');
        form.addEventListener('submit', async function(e) {
          e.preventDefault();
          hideError();

          var topic = document.getElementById('topic-input').value.trim();
          var format = document.getElementById('format-select').value;

          if (!topic) return;
          if (topic.length < 3) {
            showError('Please describe your topic in more detail (at least 3 characters).');
            return;
          }

          showLoading();

          try {
            var res = await fetch(API_URL + '/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken(),
              },
              body: JSON.stringify({ topic: topic, format: format }),
            });
            var data = await res.json();

            if (!res.ok) {
              if (res.status === 429) {
                showError('Daily limit reached (' + (data.data ? data.data.used : '?') + '/' + (data.meta ? data.meta.limit : '?') + '). Upgrade to Pro for more.');
              } else if (res.status === 503) {
                showError('AI service is temporarily busy. Please try again in a few seconds.');
              } else {
                showError(data.error || data.message || 'Generation failed. Please try again.');
              }
              return;
            }

            showResult(data.data, data.meta);
            await loadRecentGenerations();
          } catch(err) {
            showError('Network error. Please check your connection and try again.');
          }
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', function() {
          hideError();
          document.getElementById('generate-form').requestSubmit();
        });

        // Copy button
        var copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', function() {
            var content = document.getElementById('result-content').textContent;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(content).then(function() {
                copyBtn.textContent = '✅ Copied!';
                setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
              });
            }
          });
        }

        // Initial load
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadRecentGenerations);
        } else {
          loadRecentGenerations();
        }
      })();
    <\/script>
  `;

  return DashboardLayout({ user: user, children: children });
}
