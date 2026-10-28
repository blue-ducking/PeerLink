/**
 * PeerLink AI Assistant Frontend Extension Point
 * Member 5 Integration Surface
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('ai');

  const aiForm = document.getElementById('ai-assistant-form');
  const aiPromptInput = document.getElementById('ai-prompt');
  const aiOutputContainer = document.getElementById('ai-response-container');
  const submitBtn = document.getElementById('ai-submit-btn');

  if (aiForm) {
    aiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = aiPromptInput.value.trim();
      if (!prompt) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing query...';

      aiOutputContainer.innerHTML = `
        <div class="ai-processing-state">
          <p class="meta-secondary">Analyzing campus listings and skill requests...</p>
        </div>
      `;

      try {
        const res = await window.api.post('/ai/query', { prompt });

        let resultHtml = '';
        if (!res.configured) {
          resultHtml = `
            <div class="extension-notice-box">
              <h3 class="notice-title">AI Module Architecture Status</h3>
              <p class="notice-body">${res.message}</p>
              <div class="notice-meta">
                <p><strong>Extension Owner:</strong> ${res.data.extensionOwner}</p>
                <p><strong>Source of Truth:</strong> ${res.data.sourceOfTruth}</p>
              </div>
              <div class="notice-fallback-action">
                <p>In the prototype, natural queries map to SQL search:</p>
                <a href="/search.html?q=${encodeURIComponent(res.data.suggestedKeywords?.[0] || prompt)}" class="btn btn-secondary">
                  Search campus database for "${res.data.suggestedKeywords?.[0] || prompt}" →
                </a>
              </div>
            </div>
          `;
        } else {
          resultHtml = `
            <div class="ai-results-box">
              <h3>Recommendations for: "${res.data.prompt}"</h3>
              <p>Matched listings will appear here once ranked by LLM pipeline.</p>
            </div>
          `;
        }

        aiOutputContainer.innerHTML = resultHtml;

      } catch (err) {
        aiOutputContainer.innerHTML = `<p class="error-inline">${err.message || 'AI request failed'}</p>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Find Help →';
      }
    });
  }
});
