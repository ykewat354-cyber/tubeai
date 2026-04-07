import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardPage() {
  const user = { name: 'Creator', plan: 'free' }; // Placeholder

  return DashboardLayout({
    user,
    children: `
    <script>
      // Check auth
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
      }
    </script>

    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">Generate YouTube Content</h2>
        <p class="text-dark-400">Describe your video topic and AI will create ideas, titles, and scripts.</p>
      </div>

      <!-- Generation Form -->
      <div class="card mb-8">
        <form id="generate-form" class="space-y-6">
          <div>
            <label class="block text-sm text-dark-400 mb-2">What is your video about?</label>
            <textarea
              id="topic-input"
              class="input-field min-h-[120px] resize-y"
              placeholder="e.g., A tutorial on how to start a vegetable garden in small spaces. Target audience is beginners who live in apartments."
              required
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <label class="block text-sm text-dark-400 mb-2">Output Format</label>
              <select id="format-select" class="input-field sm:w-64">
                <option value="all">Ideas + Titles + Script</option>
                <option value="ideas">Video Ideas Only</option>
                <option value="titles">Titles Only</option>
                <option value="script">Full Script Only</option>
              </select>
            </div>
            <button type="submit" id="generate-btn" class="btn-primary">
              ✨ Generate Content
            </button>
          </div>
        </form>

        <!-- Error message -->
        <div id="error-message" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden"></div>

        <!-- Loading state -->
        <div id="loading-state" class="mt-6 text-center hidden">
          <div class="inline-block spinner mb-4"></div>
          <p class="text-dark-400 text-sm">AI is working its magic... This may take a moment.</p>
        </div>

        <!-- Result display -->
        <div id="result-container" class="mt-6 hidden fade-in">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Generated Content</h3>
            <span id="usage-badge" class="text-xs text-dark-500 bg-dark-800 px-3 py-1 rounded-full"></span>
          </div>
          <div id="result-content" class="bg-dark-950 border border-dark-800 rounded-lg p-6 text-dark-300 whitespace-pre-wrap overflow-auto max-h-[600px]"></div>
        </div>
      </div>

      <!-- Recent Generations -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Recent Generations</h3>
          <a href="/dashboard/history" class="text-sm text-primary-500 hover:text-primary-400">View All →</a>
        </div>
        <div id="recent-generations" class="space-y-3">
          <!-- Populated by JS -->
          <div class="text-center py-8 text-dark-500">
            <p>📭 No generations yet. Create your first one above!</p>
          </div>
        </div>
      </div>
    </div>

    <script>
      const API_URL = '/api';

      // Load recent history
      async function loadRecentGenerations() {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(API_URL + '/history?page=1&limit=5', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('recent-generations');
            if (data.data.length === 0) return;

            container.innerHTML = data.data.map(item => {
              const date = new Date(item.createdAt).toLocaleDateString();
              return \`
                <div class="flex items-center justify-between p-4 bg-dark-900/50 border border-dark-800 rounded-lg hover:border-dark-700 transition-colors">
                  <div>
                    <p class="text-white font-medium truncate max-w-md">\${item.topic}</p>
                    <div class="flex gap-2 mt-1">
                      <span class="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded">\${item.format}</span>
                      <span class="text-xs text-dark-500">\${date}</span>
                    </div>
                  </div>
                  <a href="/dashboard/history/detail/\${item.id}" class="text-sm text-primary-500 hover:text-primary-400">View</a>
                </div>
              \`;
            }).join('');
          }
        } catch (err) {
          console.error('Failed to load history:', err);
        }
      }

      // Handle form submission
      document.getElementById('generate-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic-input').value.trim();
        const format = document.getElementById('format-select').value;
        const btn = document.getElementById('generate-btn');
        const loading = document.getElementById('loading-state');
        const errorDiv = document.getElementById('error-message');
        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');

        if (!topic) return;

        // Reset states
        errorDiv.classList.add('hidden');
        resultContainer.classList.add('hidden');
        loading.classList.remove('hidden');
        btn.disabled = true;
        btn.textContent = '⏳ Generating...';

        try {
          const token = localStorage.getItem('token');
          const res = await fetch(API_URL + '/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({ topic, format }),
          });
          
          const data = await res.json();

          if (!res.ok) {
            if (res.status === 429) {
              throw new Error(\`Daily limit reached (\${data.used}/\${data.limit}). Upgrade to Pro for more.\`);
            }
            throw new Error(data.error);
          }

          // Display result
          const resultText = JSON.stringify(data.data.result, null, 2);
          resultContent.textContent = resultText;
          resultContainer.classList.remove('hidden');

          // Show usage badge
          if (data.usage) {
            document.getElementById('usage-badge').textContent = 
              \`Usage: \${data.usage.used}/\${data.usage.limit} today\`;
          }

          // Refresh recent list
          await loadRecentGenerations();

        } catch (err) {
          errorDiv.textContent = err.message;
          errorDiv.classList.remove('hidden');
        } finally {
          loading.classList.add('hidden');
          btn.disabled = false;
          btn.textContent = '✨ Generate Content';
        }
      });

      // Load on mount
      loadRecentGenerations();
    </script>
  `
});
}
