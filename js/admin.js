/**
 * PeerLink Administrator Verification Controller
 * Handles user identity verification, status changes, and filter management.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Enforce authentication and administrative role guard
  if (!window.api || !window.api.isLoggedIn()) {
    window.location.href = '/login.html?redirect=/admin.html';
    return;
  }

  const currentUser = window.api.getUser();
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Access Restricted: You must be signed in with an Administrator account to access verification.');
    window.location.href = '/dashboard.html';
    return;
  }

  // Render unified header navigation
  if (window.auth && typeof window.auth.updateNavigation === 'function') {
    window.auth.updateNavigation('admin');
  }

  // 2. State & DOM references
  let allUsers = [];
  let currentFilter = 'PENDING'; // Default to pending to immediately highlight actionable items
  let searchQuery = '';

  const statPending = document.getElementById('stat-pending');
  const statVerified = document.getElementById('stat-verified');
  const statRejected = document.getElementById('stat-rejected');
  const statTotal = document.getElementById('stat-total');

  const tabPending = document.getElementById('tab-count-pending');
  const tabAll = document.getElementById('tab-count-all');
  const tabVerified = document.getElementById('tab-count-verified');
  const tabRejected = document.getElementById('tab-count-rejected');

  const usersListContainer = document.getElementById('admin-users-list');
  const searchInput = document.getElementById('admin-search-input');
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const toastBanner = document.getElementById('admin-toast');
  const toastMessage = document.getElementById('toast-message');

  let toastTimeout = null;

  function showToast(message, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toastBanner.className = `admin-toast-banner toast-${type} show`;
    toastTimeout = setTimeout(() => {
      toastBanner.classList.remove('show');
    }, 3500);
  }

  function getInitials(name, fallbackId) {
    const raw = (name || fallbackId || 'ST').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  }

  function formatDate(isoString) {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }

  function updateMetrics() {
    const pendingCount = allUsers.filter(u => u.verification_status === 'PENDING').length;
    const verifiedCount = allUsers.filter(u => u.verification_status === 'VERIFIED').length;
    const rejectedCount = allUsers.filter(u => u.verification_status === 'REJECTED').length;
    const totalCount = allUsers.length;

    if (statPending) statPending.textContent = pendingCount;
    if (statVerified) statVerified.textContent = verifiedCount;
    if (statRejected) statRejected.textContent = rejectedCount;
    if (statTotal) statTotal.textContent = totalCount;

    if (tabPending) tabPending.textContent = pendingCount;
    if (tabAll) tabAll.textContent = totalCount;
    if (tabVerified) tabVerified.textContent = verifiedCount;
    if (tabRejected) tabRejected.textContent = rejectedCount;

    // If there are no pending users, switch initial tab to ALL
    if (pendingCount === 0 && currentFilter === 'PENDING') {
      currentFilter = 'ALL';
      tabButtons.forEach(btn => {
        const matches = btn.dataset.filter === 'ALL';
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-selected', String(matches));
      });
    }
  }

  function renderUsers() {
    if (!usersListContainer) return;

    let filtered = allUsers.filter(u => {
      // Filter by status tab
      if (currentFilter !== 'ALL' && u.verification_status !== currentFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (u.name || '').toLowerCase().includes(q);
        const idMatch = (u.university_id || '').toLowerCase().includes(q);
        const deptMatch = (u.department || '').toLowerCase().includes(q);
        return nameMatch || idMatch || deptMatch;
      }

      return true;
    });

    if (filtered.length === 0) {
      const filterLabel = currentFilter === 'ALL' ? '' : currentFilter.toLowerCase();
      usersListContainer.innerHTML = `
        <div class="admin-empty-state">
          <p style="font-size: 1.1rem; font-weight: 600; color: #18181B; margin-bottom: 0.25rem;">No ${filterLabel} students found</p>
          <p style="font-size: 0.9rem; color: #71717A;">${searchQuery ? `No matching records found for "${searchQuery}".` : 'All students in this category have been processed.'}</p>
        </div>
      `;
      return;
    }

    usersListContainer.innerHTML = filtered.map(u => {
      const initials = getInitials(u.name, u.university_id);
      const isSelf = u.user_id === currentUser.userId;
      const formattedDate = formatDate(u.created_at);

      // Status badge
      let badgeHtml = '';
      if (u.verification_status === 'VERIFIED') {
        badgeHtml = `<span class="badge badge-verified">✓ Verified</span>`;
      } else if (u.verification_status === 'REJECTED') {
        badgeHtml = `<span class="badge badge-rejected">✕ Rejected</span>`;
      } else {
        badgeHtml = `<span class="badge badge-pending">● Pending Review</span>`;
      }

      // Action buttons
      let actionButtons = '';
      if (isSelf) {
        actionButtons = `<span class="admin-self-tag">Current Admin (You)</span>`;
      } else if (u.verification_status === 'PENDING') {
        actionButtons = `
          <button type="button" class="btn-action-verify" data-action="VERIFIED" data-id="${u.user_id}" data-uid="${u.university_id}" data-name="${u.name}">
            ✓ Verify Student
          </button>
          <button type="button" class="btn-action-reject" data-action="REJECTED" data-id="${u.user_id}" data-uid="${u.university_id}" data-name="${u.name}">
            ✕ Reject
          </button>
        `;
      } else if (u.verification_status === 'REJECTED') {
        actionButtons = `
          <button type="button" class="btn-action-reverify" data-action="VERIFIED" data-id="${u.user_id}" data-uid="${u.university_id}" data-name="${u.name}">
            Re-verify Student
          </button>
        `;
      } else if (u.verification_status === 'VERIFIED') {
        actionButtons = `
          <button type="button" class="btn-action-reject" data-action="REJECTED" data-id="${u.user_id}" data-uid="${u.university_id}" data-name="${u.name}">
            Revoke Access
          </button>
        `;
      }

      const roleBadge = u.role === 'admin'
        ? `<span class="user-role-tag">Admin</span>`
        : '';

      const yearText = u.year ? `Year ${u.year}` : 'Student';

      return `
        <article class="admin-user-row" id="user-row-${u.user_id}">
          <div class="user-identity-cell">
            <div class="user-avatar-initials" aria-hidden="true">${initials}</div>
            <div class="user-name-id">
              <span class="user-full-name">${u.name || u.university_id}</span>
              <div class="user-id-role">
                <span class="user-id-tag">${u.university_id}</span>
                ${roleBadge}
              </div>
            </div>
          </div>

          <div class="user-department-cell">
            <span class="user-dept-text">${u.department || 'Undergraduate'}</span>
            <span class="user-year-text">${yearText}</span>
          </div>

          <div class="user-date-cell">
            <span>Joined ${formattedDate}</span>
          </div>

          <div class="user-status-cell">
            ${badgeHtml}
          </div>

          <div class="user-actions-cell">
            ${actionButtons}
          </div>
        </article>
      `;
    }).join('');

    // Attach action events
    attachActionListeners();
  }

  function attachActionListeners() {
    const actionButtons = usersListContainer.querySelectorAll('button[data-action]');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        const targetUserId = button.dataset.id;
        const targetUid = button.dataset.uid;
        const targetName = button.dataset.name || targetUid;
        const newStatus = button.dataset.action;

        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = 'Updating...';

        try {
          const res = await window.api.patch(`/auth/users/${targetUserId}/verify`, {
            status: newStatus
          });

          if (res && res.success) {
            // Update user in local state
            const targetUser = allUsers.find(u => u.user_id === Number(targetUserId));
            if (targetUser) {
              targetUser.verification_status = newStatus;
            }

            const actionLabel = newStatus === 'VERIFIED' ? 'verified' : 'rejected';
            showToast(`Student ${targetUid} (${targetName}) has been ${actionLabel}.`, newStatus === 'VERIFIED' ? 'success' : 'danger');

            updateMetrics();
            renderUsers();
          } else {
            showToast(res.error || 'Failed to update verification status.', 'danger');
            button.disabled = false;
            button.innerHTML = originalText;
          }
        } catch (err) {
          showToast(err.message || 'Failed to update verification status.', 'danger');
          button.disabled = false;
          button.innerHTML = originalText;
        }
      });
    });
  }

  // 3. Tab filter events
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      tabButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
      renderUsers();
    });
  });

  // 4. Instant search event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderUsers();
    });
  }

  // 5. Initial Data Fetch
  try {
    const response = await window.api.get('/auth/users');
    if (response && response.success && Array.isArray(response.data)) {
      allUsers = response.data;
      updateMetrics();
      renderUsers();
    } else {
      usersListContainer.innerHTML = `
        <div class="admin-empty-state">
          <p style="color: #DC2626; font-weight: 600;">Unable to load campus users.</p>
          <p style="font-size: 0.9rem; color: #71717A;">${response.error || 'Server error occurred while fetching user list.'}</p>
        </div>
      `;
    }
  } catch (err) {
    usersListContainer.innerHTML = `
      <div class="admin-empty-state">
        <p style="color: #DC2626; font-weight: 600;">Failed to connect to verification service.</p>
        <p style="font-size: 0.9rem; color: #71717A;">${err.message}</p>
      </div>
    `;
  }
});
