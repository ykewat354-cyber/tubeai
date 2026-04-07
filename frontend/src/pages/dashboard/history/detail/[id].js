export default function HistoryDetailPage() {
  return `
    <div class="min-h-screen bg-dark-950">
      <div class="max-w-4xl mx-auto p-6">
        <a href="/dashboard/history" class="text-sm text-primary-500 hover:text-primary-400 mb-6 inline-block">← Back to History</a>

        <div id="detail-container" class="space-y-6">
          <div class="text-center py-12 text-dark-500">Loading...</div>
        </div>
      </div>

      <script>
        const API_URL = '/api';
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        async function loadDetail() {
          const token = localStorage.getItem('token');
          try {
            const res = await fetch(API_URL + '/generate/' + id, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Generation not found');
            
            const data = await res.json();
            const generation = data.data;
            const date = new Date(generation.createdAt).toLocaleString();

            document.getElementById('detail-container').innerHTML = \`
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-white">\${generation.topic}</h1>
                  <div class="flex gap-2 mt-2">
                    <span class="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-medium uppercase">\${generation.format}</span>
                    <span class="text-xs text-dark-500">via \${generation.model}</span>
                    <span class="text-xs text-dark-500">• \${date}</span>
                  </div>
                </div>
                <button onclick="copyToClipboard()" class="btn-secondary text-sm">📋 Copy</button>
              </div>

              <div class="card">
                <pre id="content-display" class="whitespace-pre-wrap text-dark-300 font-mono text-sm overflow-auto max-h-[70vh]"></pre>
              </div>
            \`;

            // Display the result
            const content = JSON.stringify(generation.result, null, 2);
            document.getElementById('content-display').textContent = content;

          } catch (err) {
            document.getElementById('detail-container').innerHTML = \`
              <div class="text-center py-12 text-red-400">
                <p>\${err.message}</p>
                <a href="/dashboard/history" class="text-primary-500 hover:text-primary-400 inline-block mt-2">Go back</a>
              </div>
            \`;
          }
        }

        function copyToClipboard() {
          const content = document.getElementById('content-display').textContent;
          navigator.clipboard.writeText(content);
          alert('Copied to clipboard!');
        }

        loadDetail();
      <\/script>
    </div>
  `;
}
