/**
 * PeerLink Service Requests Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('requests');

  const incomingContainer = document.getElementById('incoming-requests-list');
  const outgoingContainer = document.getElementById('outgoing-requests-list');
  const currentUser = window.api.getUser();

  async function loadRequests() {
    try {
      const res = await window.api.get('/requests');
      const all = res.data || [];

      const incoming = all.filter(r => Number(r.provider_id) === Number(currentUser.userId));
      const outgoing = all.filter(r => Number(r.requester_id) === Number(currentUser.userId));

      renderList(incomingContainer, incoming, 'incoming');
      renderList(outgoingContainer, outgoing, 'outgoing');

    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  }

  function renderList(container, items, type) {
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">No ${type} service requests.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(r => {
      let statusClass = 'badge-pending';
      if (r.status === 'ACCEPTED') statusClass = 'badge-verified';
      if (r.status === 'REJECTED') statusClass = 'badge-rejected';

      const isPending = r.status === 'PENDING';
      const isProvider = type === 'incoming';

      const actionButtons = (isProvider && isPending) ? `
        <div class="request-actions">
          <button type="button" class="btn btn-primary btn-sm" data-action="accept" data-request-id="${r.request_id}">Accept</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="reject" data-request-id="${r.request_id}">Reject</button>
        </div>
      ` : '';

      const peerLabel = isProvider
        ? `From: <strong>${r.requester_name}</strong> (${r.requester_university_id})`
        : `To: <strong>${r.provider_name}</strong> (${r.provider_university_id})`;

      return `
        <li class="editorial-list-item">
          <div class="editorial-content">
            <h4 class="editorial-title">${r.listing_title}</h4>
            <p class="editorial-snippet">"${r.message}"</p>
            <p class="editorial-meta">
              ${peerLabel} ·
              <span class="badge ${statusClass}">● ${r.status}</span>
              <span class="meta-secondary">· ${new Date(r.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          <div class="editorial-action">
            ${actionButtons}
          </div>
        </li>
      `;
    }).join('');

    // Attach button listeners
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        const reqId = e.target.getAttribute('data-request-id');

        try {
          if (action === 'accept') {
            await window.api.patch(`/requests/${reqId}/accept`);
          } else if (action === 'reject') {
            await window.api.patch(`/requests/${reqId}/reject`);
          }
          loadRequests();
        } catch (err) {
          alert(`Error updating request: ${err.message}`);
        }
      });
    });
  }

  loadRequests();
});
