/**
 * Dashboard Page — Updated with subscription status card (cancel/upgrade)
 */
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardPage() {
  return DashboardLayout({
    user: { name: 'Creator', plan: 'free' }, // placeholder
    children: `
    <script>
      if (typeof window !== 'undefined') {
        try { if (!localStorage.getItem('token')) window.location.href = '/auth/login'; }
        catch(e) { window.location.href = '/auth/login'; }
      }
    <\/script>
    <div class="max-w-2xl lg:max-w-4xl mx-auto">
      <!-- Subscription Status Banner -->
      <div id="subscription-banner" class="mb-6"></div>

      <div class="mb-4 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">Generate YouTube Content</h2>
        <p class="text-dark-400 text-sm sm:text-base">Describe your video topic and AI will create ideas, titles, and scripts.</p>
      </div>

      <div class="card mb-6 sm:mb-8">
        <form id="generate-form" class="space-y-5 sm:space-y-6">
          <div><label for="topic-input" class="block text-sm text-dark-400 mb-2">What is your video about?</label>
            <textarea id="topic-input" class="input-field min-h-[120px] resize-y text-sm sm:text-base" placeholder="e.g., A beginner's guide to growing vegetables in small apartment spaces." required></textarea>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div class="w-full sm:w-auto"><label for="format-select" class="block text-sm text-dark-400 mb-2">Output</label>
              <select id="format-select" class="input-field min-h-[44px] w-full sm:w-56 text-sm"><option value="all">Full (Ideas + Titles + Script)</option><option value="ideas">Video Ideas Only</option><option value="titles">Titles Only</option><option value="script">Full Script</option></select>
            </div>
            <button type="submit" id="generate-btn" class="btn-primary w-full sm:w-auto min-h-[44px]">✨ Generate</button>
          </div>
        </form>
        <div id="error-msg" class="mt-4 hidden"><div class="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400" role="alert"><p id="error-text" class="text-sm"></p><button id="retry-btn" class="btn-secondary text-sm mt-3 min-h-[40px] px-4">Retry</button></div></div>
        <div id="loading-state" class="mt-6 hidden"><div class="flex flex-col items-center py-6 text-dark-400"><div class="spinner mb-3"></div><p class="text-sm">AI is working... This may take up to 30 seconds.</p></div></div>
        <div id="result-container" class="mt-6 hidden animate-fade-in">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm sm:text-base font-semibold text-white">Generated Content</h3>
            <div class="flex items-center gap-2">
              <span id="usage-badge" class="text-xs text-dark-500 bg-dark-800 px-2 sm:px-3 py-1 rounded-full"></span>
              <button id="copy-btn" class="text-xs text-primary-500 hover:text-primary-400 min-h-[36px] px-2">Copy</button>
            </div>
          </div>
          <div class="bg-dark-950 border border-dark-800 rounded-lg max-h-[50vh] sm:max-h-[600px] overflow-auto"><pre id="result-content" class="p-4 sm:p-6 text-dark-300 text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto"></pre></div>
        </div>
      </div>

      <div><div class="flex items-center justify-between mb-3 sm:mb-4"><h3 class="text-sm sm:text-lg font-semibold text-white">Recent</h3><a href="/dashboard/history" class="text-xs sm:text-sm text-primary-500 hover:text-primary-400">All →</a></div>
        <div id="recent-list" class="space-y-2"><div class="text-center py-8 text-dark-500 text-sm">📭 No generations yet.</div></div>
      </div>
    </div>

    <script>
      (function() {
        var API = '/api';
        function tk() { try { return localStorage.getItem('token'); } catch(e) { return null; } }
        function loadSub() {
          tk() && fetch(API + '/subscription/status', { headers: { 'Authorization': 'Bearer ' + tk() } })
            .then(function(r) { return r.ok ? r.json() : null; })
            .then(function(d) {
              if (!d) return;
              var banner = document.getElementById('subscription-banner');
              var plan = (d.data && d.data.plan) || 'free';
              var sub = d.data && d.data.stripe;
              var html = '';
              if (plan === 'free') {
                html = '<div class="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary-500/5 border-primary-500/20"><div><p class="text-sm text-dark-400">You are on the <strong class="text-white">Free</strong> plan (3 gens/day)</p></div><a href="/pricing" class="btn-primary text-sm min-h-[40px] px-4 flex-shrink-0">Upgrade to Pro →</a></div>';
              } else {
                var cancelNote = (sub && sub.cancelAtPeriodEnd) ? '<p class="text-yellow-400 text-xs mt-1">⚠️ Cancels at ' + new Date(sub.currentPeriodEnd).toLocaleDateString() + '</p>' : '';
                html = '<div class="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p class="text-sm text-dark-400">You are on <strong class="text-primary-500 capitalize">' + plan + '</strong></p>' + cancelNote + '</div><div class="flex gap-2 flex-shrink-0"><a href="/pricing" class="btn-secondary text-sm min-h-[40px] px-3">Change Plan</a><button id="cancel-sub-btn" class="text-sm text-dark-500 hover:text-red-400 min-h-[40px] px-3">Cancel</button></div></div>';
              }
              banner.innerHTML = html;
              if (sub && sub.cancelAtPeriodEnd) document.getElementById('cancel-sub-btn').textContent = 'Resume';
              if (document.getElementById('cancel-sub-btn')) {
                document.getElementById('cancel-sub-btn').addEventListener('click', async function() {
                  if (!confirm('Cancel your subscription? You keep access until the billing period ends.')) return;
                  var method = sub && sub.cancelAtPeriodEnd ? 'resume' : 'cancel';
                  try {
                    var res = await fetch(API + '/subscription/' + method, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk() } });
                    var data = await res.json();
                    alert(data.message || (method === 'cancel' ? 'Subscription cancelled.' : 'Subscription resumed.'));
                    loadSub();
                  } catch(e) { alert('Failed: ' + e.message); }
                });
              }
            }).catch(function() {});
        }
        function showError(m) { var c = document.getElementById('error-msg'); document.getElementById('error-text').textContent = m; c.classList.remove('hidden'); hideLoading(); }
        function hideError() { document.getElementById('error-msg').classList.add('hidden'); }
        function showLoading() { hideError(); document.getElementById('result-container').classList.add('hidden'); document.getElementById('loading-state').classList.remove('hidden'); var b = document.getElementById('generate-btn'); b.disabled = true; b.textContent = '⏳ Generating...'; }
        function hideLoading() { document.getElementById('loading-state').classList.add('hidden'); var b = document.getElementById('generate-btn'); b.disabled = false; b.textContent = '✨ Generate'; }
        async function loadRecent() {
          try { var res = await fetch(API + '/history?page=1&limit=5', { headers: { 'Authorization': 'Bearer ' + tk() } });
            if (!res.ok) return;
            var data = (await res.json()).data;
            if (data.length === 0) return;
            document.getElementById('recent-list').innerHTML = data.map(function(i) {
              return '<div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-dark-900/50 border border-dark-800 rounded-lg gap-2"><div class="min-w-0"><p class="text-white font-medium text-sm truncate">' + (i.topic.length > 60 ? i.topic.substring(0,60) + '...' : i.topic) + '</p><div class="flex gap-2 mt-1"><span class="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded">' + i.format + '</span><span class="text-xs text-dark-500">' + new Date(i.createdAt).toLocaleDateString() + '</span></div></div><a href="/dashboard/history/detail/' + i.id + '" class="text-sm text-primary-500 hover:text-primary-400 flex-shrink-0">View</a></div>';
            }).join('');
          } catch(e) {}
        }
        document.getElementById('generate-form').addEventListener('submit', async function(e) {
          e.preventDefault(); hideError();
          var topic = document.getElementById('topic-input').value.trim();
          var format = document.getElementById('format-select').value;
          if (!topic || topic.length < 3) { showError('Please describe your topic (at least 3 characters).'); return; }
          showLoading();
          try {
            var res = await fetch(API + '/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk() }, body: JSON.stringify({ topic: topic, format: format }) });
            var data = await res.json();
            if (!res.ok) { showError(res.status === 429 ? ('Daily limit reached. Upgrade to Pro for more.') : (data.error || data.message || 'Failed.')); return; }
            var content = typeof data.data.result === 'string' ? data.data.result : JSON.stringify(data.data.result, null, 2);
            document.getElementById('result-content').textContent = content;
            document.getElementById('result-container').classList.remove('hidden');
            hideLoading();
            if (data.meta) document.getElementById('usage-badge').textContent = 'Usage: ' + data.meta.used + '/' + data.meta.limit + ' today';
            loadRecent();
          } catch(e) { showError('Network error. Check your connection.'); }
        });
        document.getElementById('retry-btn').addEventListener('click', function() { document.getElementById('generate-form').requestSubmit(); });
        var copyBtn = document.getElementById('copy-btn');
        if (copyBtn) copyBtn.addEventListener('click', function() {
          navigator.clipboard && navigator.clipboard.writeText(document.getElementById('result-content').textContent).then(function() {
            copyBtn.textContent = '✅ Copied!'; setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
          });
        });
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', function() { loadRecent(); loadSub(); }) : (loadRecent(), loadSub());
      })();
    <\/script>
  `});
}