/**
 * PeerLink Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('dashboard');

  const greetingEl = document.getElementById('dashboard-greeting');
  const activitySkillsEl = document.getElementById('stat-skills');
  const activityListingsEl = document.getElementById('stat-listings');
  const activityRequestsEl = document.getElementById('stat-requests');
  const recentListingsContainer = document.getElementById('recent-listings-list');
  const searchInput = document.getElementById('dashboard-quick-search');

  // Handle quick search submit
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          window.location.href = `/search.html?q=${encodeURIComponent(val)}`;
        }
      }
    });
  }

  try {
    // 1. Fetch current user identity & profile
    const meRes = await window.api.get('/auth/me');
    const user = meRes.data.user;
    const profile = meRes.data.profile;

    if (greetingEl) {
      const now = new Date();
      const hour = now.getHours();
      let timeOfDay = 'morning';
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17) timeOfDay = 'evening';

      const displayName = profile?.name || user.university_id;
      greetingEl.textContent = `Good ${timeOfDay}, ${displayName}.`;
    }

    // 2. Fetch skills count
    try {
      const skillsRes = await window.api.get('/skills/my');
      if (activitySkillsEl) activitySkillsEl.textContent = skillsRes.data?.length || 0;
    } catch {
      if (activitySkillsEl) activitySkillsEl.textContent = '0';
    }

    // 3. Fetch listings by current user
    try {
      const listingsRes = await window.api.get('/listings', { provider_id: user.user_id });
      if (activityListingsEl) activityListingsEl.textContent = listingsRes.data?.length || 0;
    } catch {
      if (activityListingsEl) activityListingsEl.textContent = '0';
    }

    // 4. Fetch service requests
    try {
      const requestsRes = await window.api.get('/requests');
      if (activityRequestsEl) activityRequestsEl.textContent = requestsRes.data?.length || 0;
    } catch {
      if (activityRequestsEl) activityRequestsEl.textContent = '0';
    }

    // 5. Load recent campus service offerings
    try {
      const recentRes = await window.api.get('/listings');
      const listings = recentRes.data || [];

      if (recentListingsContainer) {
        if (listings.length === 0) {
          recentListingsContainer.innerHTML = `
            <div class="empty-state">
              <p class="empty-state-text">No active service listings found on campus yet.</p>
              <a href="/listings.html" class="action-link">Post the first campus listing →</a>
            </div>
          `;
        } else {
          recentListingsContainer.innerHTML = listings.slice(0, 4).map(l => `
            <li class="editorial-list-item">
              <div class="editorial-content">
                <a href="/listing-details.html?id=${l.listing_id}" class="editorial-title">${l.title}</a>
                <p class="editorial-meta">
                  <span class="meta-tag">${l.category_name}</span> ·
                  ${l.provider_name} (${l.provider_department || 'Student'}) ·
                  ${l.availability}
                </p>
              </div>
              <div class="editorial-action">
                <a href="/listing-details.html?id=${l.listing_id}" class="text-link">View details →</a>
              </div>
            </li>
          `).join('');
        }
      }
    } catch (err) {
      if (recentListingsContainer) {
        recentListingsContainer.innerHTML = '<p class="error-inline">Failed to load recent listings.</p>';
      }
    }

  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
});
