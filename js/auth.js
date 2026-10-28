/**
 * PeerLink Authentication & Navigation Handler
 * Coordinates dynamic header navigation, session state checking, and auth form submissions.
 * Renders the Skillshare-style dark header with violet brand accents across the entire project.
 */

function updateNavigation(activeKey = '') {
  const navContainer = document.getElementById('main-nav');
  if (!navContainer) return;

  const isLoggedIn = window.api && window.api.isLoggedIn();
  const user = window.api ? window.api.getUser() : null;

  if (isLoggedIn) {
    const initials = user?.universityId
      ? user.universityId.substring(0, 2).toUpperCase()
      : 'ST';

    navContainer.innerHTML = `
      <div class="dash-nav-inner">
        <!-- Left: Brand Logo (redirects to /dashboard.html) -->
        <div class="dash-nav-left">
          <a href="/dashboard.html" class="dash-brand-logo" title="PeerLink Dashboard">peerlink<span class="brand-dot">.</span></a>
        </div>

        <!-- Center: Search Input -->
        <div class="dash-nav-center">
          <div class="dash-search-container">
            <svg class="dash-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" id="dash-header-search-input" class="dash-header-search" placeholder="Search skills, tutoring, campus services, peers... (Press Enter)" autocomplete="off">
          </div>
        </div>

        <!-- Right: Requests, Notifications, Avatar & Violet CTA -->
        <div class="dash-nav-right">
          ${user?.role === 'admin' ? `
            <a href="/admin.html" class="dash-nav-link ${activeKey === 'admin' ? 'active' : ''}" style="color: #9D8DE2; font-weight: 700;">Admin Console</a>
          ` : ''}
          <a href="/requests.html" class="dash-nav-link ${activeKey === 'requests' ? 'active' : ''}">My Requests</a>

          <button type="button" class="dash-bell-btn" id="btn-notifications" aria-label="Notifications" title="Notifications">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="bell-badge-dot" aria-hidden="true"></span>
          </button>

          <!-- Circular User Avatar -->
          <button type="button" class="dash-avatar-btn" id="btn-avatar-toggle" aria-expanded="false" aria-haspopup="true" title="User Menu">
            <span id="nav-avatar-initials">${initials}</span>
          </button>

          <!-- Violet "Offer a Skill +" Primary Button -->
          <a href="/listings.html" class="dash-cta-btn" id="btn-post-service">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Offer a Skill</span>
          </a>

          <!-- Skillshare-Style Floating Profile Popover Dropdown Card -->
          <div class="profile-popover-menu" id="profile-popover-menu" role="menu">
            <div class="popover-header">
              <div class="popover-avatar-lg">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#18181B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 class="popover-name" id="popover-user-name">${user?.universityId || 'Student'}</h3>
              <p class="popover-headline" id="popover-user-headline">Loading details...</p>
              <a href="/profile.html" class="popover-btn-profile">View Profile</a>
            </div>

            <div class="popover-divider"></div>

            <ul class="popover-nav-list">
              ${user?.role === 'admin' ? `
                <li class="popover-nav-item">
                  <a href="/admin.html" class="${activeKey === 'admin' ? 'active' : ''}" style="color: #6366F1; font-weight: 600;">
                    <span>🛡️ Student Verification</span>
                    <span class="meta-tag" style="background: rgba(99, 102, 241, 0.15); color: #6366F1; font-weight: 700;">ADMIN</span>
                  </a>
                </li>
              ` : ''}
              <li class="popover-nav-item">
                <a href="/requests.html">
                  <span>My Requests</span>
                  <span class="meta-tag" id="popover-requests-count">-</span>
                </a>
              </li>
              <li class="popover-nav-item">
                <a href="/skills.html">
                  <span>My Skills Catalog</span>
                  <span class="meta-tag" id="popover-skills-count">-</span>
                </a>
              </li>
              <li class="popover-nav-item">
                <a href="/profile.html">
                  <span>Verification</span>
                  <span class="popover-status-badge" id="popover-verification-badge">
                    ${user?.verificationStatus === 'VERIFIED' ? '● Verified' : '● Pending'}
                  </span>
                </a>
              </li>
              <li class="popover-nav-item">
                <a href="/ai.html">
                  <span>AI Campus Matchmaker</span>
                </a>
              </li>
            </ul>

            <div class="popover-divider"></div>

            <button type="button" class="popover-logout-btn" id="popover-btn-logout">Sign Out</button>
          </div>
        </div>
      </div>
    `;

    // Attach Avatar Popover toggle events
    const avatarBtn = document.getElementById('btn-avatar-toggle');
    const popoverMenu = document.getElementById('profile-popover-menu');
    const popoverLogoutBtn = document.getElementById('popover-btn-logout');

    if (avatarBtn && popoverMenu) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = popoverMenu.classList.contains('is-open');
        popoverMenu.classList.toggle('is-open', !isOpen);
        avatarBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!popoverMenu.contains(e.target) && e.target !== avatarBtn) {
          popoverMenu.classList.remove('is-open');
          avatarBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popoverMenu.classList.contains('is-open')) {
          popoverMenu.classList.remove('is-open');
          avatarBtn.setAttribute('aria-expanded', 'false');
          avatarBtn.focus();
        }
      });
    }

    if (popoverLogoutBtn) {
      popoverLogoutBtn.addEventListener('click', () => {
        window.api.logout();
      });
    }

    // Attach search enter key event
    const searchInput = document.getElementById('dash-header-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }

    // Asynchronously populate profile details into popover menu
    (async () => {
      try {
        const meRes = await window.api.get('/auth/me');
        const currentUser = meRes.data.user;
        const profile = meRes.data.profile;

        if (currentUser && profile) {
          const initialsEl = document.getElementById('nav-avatar-initials');
          const popoverNameEl = document.getElementById('popover-user-name');
          const popoverHeadlineEl = document.getElementById('popover-user-headline');
          const popoverBadgeEl = document.getElementById('popover-verification-badge');

          const userInitials = (profile.name || currentUser.university_id)
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          if (initialsEl) initialsEl.textContent = userInitials;
          if (popoverNameEl) popoverNameEl.textContent = profile.name || currentUser.university_id;
          if (popoverHeadlineEl) {
            if (currentUser.role === 'admin') {
              popoverHeadlineEl.textContent = 'Platform Administrator';
            } else {
              const dept = profile.department || 'Student';
              const year = profile.year ? `Year ${profile.year}` : 'Undergrad';
              popoverHeadlineEl.textContent = `${dept} · ${year}`;
            }
          }
          if (popoverBadgeEl) {
            popoverBadgeEl.textContent = currentUser.verification_status === 'VERIFIED' ? '● Verified' : '● Pending';
          }
        }

        // Stats counts in popover
        try {
          const skillsRes = await window.api.get('/skills/my');
          const skillsCountEl = document.getElementById('popover-skills-count');
          if (skillsCountEl) skillsCountEl.textContent = skillsRes.data?.length || 0;
        } catch { /* ignore */ }

        try {
          const reqRes = await window.api.get('/requests');
          const reqCountEl = document.getElementById('popover-requests-count');
          if (reqCountEl) reqCountEl.textContent = reqRes.data?.length || 0;
        } catch { /* ignore */ }

      } catch { /* session might still be active */ }
    })();

  } else {
    // Logged-out navbar (e.g. for index.html)
    navContainer.innerHTML = `
      <div class="dash-nav-inner">
        <div class="dash-nav-left">
          <a href="/index.html" class="dash-brand-logo" title="PeerLink">peerlink<span class="brand-dot">.</span></a>
        </div>

        <div class="dash-nav-center">
          <div class="dash-search-container">
            <svg class="dash-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" id="dash-header-search-input" class="dash-header-search" placeholder="Search skills, tutoring, campus services... (Press Enter)" autocomplete="off">
          </div>
        </div>

        <div class="dash-nav-right">
          <a href="/login.html" class="dash-nav-link">Student Login</a>
          <a href="/login.html#register" class="dash-cta-btn">Join PeerLink →</a>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('dash-header-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }
}

function enforceAuthGuard() {
  if (!window.api || !window.api.isLoggedIn()) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${returnUrl}`;
  }
}

function redirectIfAlreadyLoggedIn() {
  if (window.api && window.api.isLoggedIn()) {
    window.location.href = '/dashboard.html';
  }
}

// Attach to global window
window.auth = {
  updateNavigation,
  enforceAuthGuard,
  redirectIfAlreadyLoggedIn
};
