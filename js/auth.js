/**
 * PeerLink Authentication & Navigation Handler
 * Coordinates dynamic header navigation, session state checking, and auth form submissions.
 */

function updateNavigation(activeKey = '') {
  const navContainer = document.getElementById('main-nav');
  if (!navContainer) return;

  const isLoggedIn = window.api && window.api.isLoggedIn();
  const user = window.api ? window.api.getUser() : null;

  let links = [];

  if (isLoggedIn) {
    links = [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard.html' },
      { key: 'profile', label: 'Profile', href: '/profile.html' },
      { key: 'skills', label: 'Skills', href: '/skills.html' },
      { key: 'services', label: 'Services', href: '/listings.html' },
      { key: 'search', label: 'Search', href: '/search.html' },
      { key: 'requests', label: 'Requests', href: '/requests.html' },
      { key: 'ai', label: 'AI Assistant', href: '/ai.html' }
    ];
  } else {
    links = [
      { key: 'home', label: 'Home', href: '/index.html' },
      { key: 'login', label: 'Login', href: '/login.html' },
      { key: 'register', label: 'Register', href: '/register.html' }
    ];
  }

  const linksHtml = links
    .map(link => {
      const isActive = link.key === activeKey ? 'aria-current="page" class="nav-link active"' : 'class="nav-link"';
      return `<li><a href="${link.href}" ${isActive}>${link.label}</a></li>`;
    })
    .join('');

  let userMetaHtml = '';
  if (isLoggedIn && user) {
    const isPending = user.verificationStatus === 'PENDING';
    const statusBadge = isPending
      ? `<span class="badge badge-pending" title="Verification Pending">● Pending</span>`
      : `<span class="badge badge-verified" title="Verified Student">● Verified</span>`;

    userMetaHtml = `
      <div class="nav-user-meta">
        <span class="nav-user-id">${user.universityId}</span>
        ${statusBadge}
        <button id="nav-logout-btn" class="nav-logout-action" type="button">Logout</button>
      </div>
    `;
  }

  navContainer.innerHTML = `
    <div class="nav-inner">
      <a href="/index.html" class="nav-brand">peerlink<span class="brand-dot">.</span></a>
      <ul class="nav-links">
        ${linksHtml}
      </ul>
      ${userMetaHtml}
    </div>
  `;

  // Attach logout handler
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.api.logout();
    });
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
