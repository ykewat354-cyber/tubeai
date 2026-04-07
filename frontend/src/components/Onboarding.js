/**
 * Onboarding Tooltip / First-Login Guide
 * Shown on first login to guide new users
 */

export default function OnboardingGuide() {
  return `
    <style>
      .onboarding-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; }
      .onboarding-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; max-width: 450px; width: 90%; text-align: center; }
      .onboarding-step { display: none; }
      .onboarding-step.active { display: block; }
      .onboarding-dots { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
      .onboarding-dot { width: 8px; height: 8px; border-radius: 50%; background: #475569; }
      .onboarding-dot.active { background: #ef4444; }
    </style>

    <div id="onboarding-root" class="hidden">
      <div class="onboarding-overlay" id="onboarding-overlay">
        <div class="onboarding-card">
          <!-- Step 1 -->
          <div class="onboarding-step active" data-step="0">
            <div class="text-4xl sm:text-5xl mb-4">🎬</div>
            <h2 class="text-xl font-bold text-white mb-2">Welcome to TubeAI!</h2>
            <p class="text-dark-400 text-sm">Let's get you started with your first AI-generated YouTube content.</p>
          </div>
          <!-- Step 2 -->
          <div class="onboarding-step" data-step="1">
            <div class="text-4xl sm:text-5xl mb-4">✏️</div>
            <h2 class="text-xl font-bold text-white mb-2">Describe Your Topic</h2>
            <p class="text-dark-400 text-sm">Tell AI what your video is about. The more specific, the better the results!</p>
          </div>
          <!-- Step 3 -->
          <div class="onboarding-step" data-step="2">
            <div class="text-4xl sm:text-5xl mb-4">✨</div>
            <h2 class="text-xl font-bold text-white mb-2">Generate & Create</h2>
            <p class="text-dark-400 text-sm">Click Generate and get ideas, titles, and scripts in seconds. You get <strong class="text-primary-500">3 free generations per day</strong>.</p>
          </div>
          <!-- Step 4 -->
          <div class="onboarding-step" data-step="3">
            <div class="text-4xl sm:text-5xl mb-4">🚀</div>
            <h2 class="text-xl font-bold text-white mb-2">Ready!</h2>
            <p class="text-dark-400 text-sm">You're all set. Start creating and upgrade to Pro for 50+ generations/day and better AI models.</p>
          </div>

          <!-- Dots -->
          <div class="onboarding-dots" id="onboarding-dots">
            <span class="onboarding-dot active"></span>
            <span class="onboarding-dot"></span>
            <span class="onboarding-dot"></span>
            <span class="onboarding-dot"></span>
          </div>

          <!-- Nav -->
          <div class="flex justify-between mt-4">
            <button id="onboard-skip" class="text-sm text-dark-500 hover:text-dark-400 min-h-[36px] px-2">Skip</button>
            <button id="onboard-next" class="btn-primary text-sm min-h-[40px] px-6">Next →</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      (function() {
        var STORAGE_KEY = 'tubeai_onboarding_done';
        // Check if user has seen onboarding
        try { if (localStorage.getItem(STORAGE_KEY)) return; } catch(e) { return; }

        var root = document.getElementById('onboarding-root');
        if (!root) return;
        root.classList.remove('hidden');

        var current = 0;
        var steps = document.querySelectorAll('.onboarding-step');
        var dots = document.querySelectorAll('.onboarding-dot');

        function showStep(idx) {
          steps.forEach(function(s) { s.classList.remove('active'); });
          dots.forEach(function(d) { d.classList.remove('active'); });
          steps[idx].classList.add('active');
          dots[idx].classList.add('active');

          var nextBtn = document.getElementById('onboard-next');
          if (idx === steps.length - 1) {
            nextBtn.textContent = 'Get Started 🚀';
          } else {
            nextBtn.textContent = 'Next →';
          }
        }

        document.getElementById('onboard-next').addEventListener('click', function() {
          if (current < steps.length - 1) {
            current++;
            showStep(current);
          } else {
            dismissOnboarding();
          }
        });

        document.getElementById('onboard-skip').addEventListener('click', dismissOnboarding);

        document.getElementById('onboarding-overlay').addEventListener('click', function(e) {
          if (e.target === this) dismissOnboarding();
        });

        function dismissOnboarding() {
          root.classList.add('hidden');
          try { localStorage.setItem(STORAGE_KEY, 'true'); } catch(e) {}
        }

        showStep(0);
      })();
    </script>
  `;
}
