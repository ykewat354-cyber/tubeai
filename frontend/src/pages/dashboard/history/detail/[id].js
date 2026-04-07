/**
 * History Detail Page
 * Shows full generated content for a specific generation
 * Responsive: Full-width content with copy button
 */
export default function HistoryDetailPage() {
  return \`
    <div class="min-h-screen bg-dark-950">
      <div class="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
        <a href="/dashboard/history" class="text-sm text-primary-500 hover:text-primary-400 mb-4 sm:mb-6 inline-block min-h-[36px]">← Back to History</a>

        <div id="detail-container" class="space-y-4 sm:space-y-6">
          <div class="text-center py-12 text-dark-500 text-sm">Loading...</div>
        </div>
      </div>

      <script>
        (function() {
          var API_URL = '/api';
          var pathParts = window.location.pathname.split('/');
          var id = pathParts[pathParts.length - 1];

          function getToken() {
            try { return localStorage.getItem('token'); } catch(e) { return null; }
          }

          async function loadDetail() {
            var token = getToken();
            try {
              var res = await fetch(API_URL + '/generate/' + id, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (!res.ok) throw new Error('Generation not found');

              var data = await res.json();
              var gen = data.data;
              var date = new Date(gen.createdAt).toLocaleString();

              var contentDisplay = '';
              try {
                contentDisplay = typeof gen.result === 'string' ? gen.result : JSON.stringify(gen.result, null, 2);
              } catch(e) {
                contentDisplay = JSON.stringify(gen, null, 2);
              }

              document.getElementById('detail-container').innerHTML =
                '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">' +
                '<div><h1 class="text-xl sm:text-2xl font-bold text-white truncate pr-4">' + gen.topic + '</h1>' +
                '<div class="flex flex-wrap gap-2 mt-2">' +
                '<span class="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-medium uppercase">' + gen.format + '</span>' +
                '<span class="text-xs text-dark-500">via ' + gen.model + '</span>' +
                '<span class="text-xs text-dark-500">• ' + date + '</span></div></div>' +
                '<button onclick="copyContent()" class="btn-secondary text-sm min-h-[40px] px-4 flex-shrink-0">📋 Copy</button></div>' +
                '<div class="card"><pre id="content-display" class="whitespace-pre-wrap text-dark-300 text-xs sm:text-sm font-mono overflow-auto max-h-[50vh] sm:max-h-[70vh]">' + escapeHTML(contentDisplay) + '</pre></div>';

            } catch(e) {
              document.getElementById('detail-container').innerHTML =
                '<div class="text-center py-12 text-red-400 text-sm"><p>' + e.message + '</p>' +
                '<a href="/dashboard/history" class="text-primary-500 hover:text-primary-400 inline-block mt-2">Go back</a></div>';
            }
          }

          function escapeHTML(str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
          }

          try {
            window.copyContent = function() {
              var content = document.getElementById('content-display').textContent;
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(content).then(function() { showCopied(); });
              } else {
                var textarea = document.createElement('textarea');
                textarea.value = content;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showCopied();
              }
            };

            function showCopied() {
              var btn = document.querySelector('button[onclick="copyContent()"]');
              if (btn) {
                var original = btn.textContent;
                btn.textContent = '✅ Copied!';
                setTimeout(function() { btn.textContent = original; }, 2000);
              }
            }
          } catch(e) {}

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadDetail);
          } else {
            loadDetail();
          }
        })();
      <\/script>
    </div>
  \`;
}
