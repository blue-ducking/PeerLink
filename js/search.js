/**
 * PeerLink Search Module Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('search');

  const searchInput = document.getElementById('search-query-input');
  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('search-results-list');
  const resultsCountEl = document.getElementById('search-results-count');

  // Check URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  async function executeSearch(query = '') {
    try {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<li class="editorial-list-item"><p class="meta-secondary">Searching campus listings...</p></li>';
      }

      const res = await window.api.get('/search/services', { q: query });
      const listings = res.data || [];

      if (resultsCountEl) {
        resultsCountEl.textContent = `${listings.length} result${listings.length === 1 ? '' : 's'}${query ? ` for "${query}"` : ''}`;
      }

      if (!resultsContainer) return;

      if (listings.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-text">No peer services found for "${query}".</p>
            <p class="empty-state-sub">Try searching by skill (e.g. Python, Calculus, Design) or broad topics.</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = listings.map(l => `
        <li class="editorial-list-item">
          <div class="editorial-content">
            <a href="/listing-details.html?id=${l.listing_id}" class="editorial-title">${l.title}</a>
            <p class="editorial-snippet">${l.description}</p>
            <p class="editorial-meta">
              <span class="meta-tag">${l.category_name}</span>
              ${l.skill_name ? `<span class="meta-tag">${l.skill_name}</span>` : ''}
              <span class="meta-secondary">· ${l.provider_name} (${l.provider_department || 'Student'})</span>
              <span class="meta-secondary">· ${l.availability}</span>
            </p>
          </div>
          <div class="editorial-action">
            <a href="/listing-details.html?id=${l.listing_id}" class="btn btn-secondary">Request help →</a>
          </div>
        </li>
      `).join('');

    } catch (err) {
      console.error('Search failed:', err);
      if (resultsContainer) {
        resultsContainer.innerHTML = '<li class="editorial-list-item"><p class="error-inline">Search query failed to execute.</p></li>';
      }
    }
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      // Update browser URL without full reload
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(q)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      executeSearch(q);
    });
  }

  // Initial execution
  executeSearch(initialQuery);
});
