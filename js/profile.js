/**
 * PeerLink Profile Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('profile');

  const profileNameEl = document.getElementById('profile-name');
  const profileSubEl = document.getElementById('profile-sub');
  const profileBioEl = document.getElementById('profile-bio');
  const profileUniIdEl = document.getElementById('profile-uni-id');
  const profileVerificationEl = document.getElementById('profile-verification');
  const profileSkillsContainer = document.getElementById('profile-skills-list');
  const profileListingsContainer = document.getElementById('profile-listings-list');

  // Edit form elements
  const editModal = document.getElementById('edit-profile-modal');
  const openEditBtn = document.getElementById('open-edit-profile-btn');
  const closeEditBtn = document.getElementById('close-edit-modal-btn');
  const editForm = document.getElementById('edit-profile-form');
  const editNameInput = document.getElementById('edit-name');
  const editDeptInput = document.getElementById('edit-department');
  const editYearInput = document.getElementById('edit-year');
  const editBioInput = document.getElementById('edit-bio');
  const formFeedback = document.getElementById('edit-form-feedback');

  const currentUser = window.api.getUser();
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id') || currentUser.userId;
  const isOwnProfile = Number(targetId) === Number(currentUser.userId);

  if (!isOwnProfile && openEditBtn) {
    // Hide edit button when viewing someone else's profile
    openEditBtn.style.display = 'none';
  }

  async function loadProfile() {
    try {
      const res = await window.api.get(`/profile/${targetId}`);
      const data = res.data;

      if (profileNameEl) profileNameEl.textContent = data.name;
      if (profileSubEl) {
        const parts = [];
        if (data.department) parts.push(data.department);
        if (data.year) parts.push(`Year ${data.year}`);
        profileSubEl.textContent = parts.length > 0 ? parts.join(' · ') : 'University Student';
      }
      if (profileBioEl) {
        profileBioEl.textContent = data.bio || 'No personal bio added yet.';
      }
      if (profileUniIdEl) {
        profileUniIdEl.textContent = data.university_id;
      }
      if (profileVerificationEl) {
        const isVer = data.verification_status === 'VERIFIED';
        profileVerificationEl.innerHTML = isVer
          ? `<span class="badge badge-verified">● Verified Student</span>`
          : `<span class="badge badge-pending">● ${data.verification_status}</span>`;
      }

      // Populate edit inputs
      if (editNameInput) editNameInput.value = data.name || '';
      if (editDeptInput) editDeptInput.value = data.department || '';
      if (editYearInput) editYearInput.value = data.year || '';
      if (editBioInput) editBioInput.value = data.bio || '';

      // Render Skills
      if (profileSkillsContainer) {
        if (!data.skills || data.skills.length === 0) {
          profileSkillsContainer.innerHTML = `
            <div class="empty-state">
              <p class="empty-state-text">No skills listed yet.</p>
              ${isOwnProfile ? '<a href="/skills.html" class="action-link">Add skills to your profile →</a>' : ''}
            </div>
          `;
        } else {
          profileSkillsContainer.innerHTML = data.skills.map(s => `
            <li class="editorial-list-item">
              <span class="skill-name">${s.name}</span>
              <span class="meta-tag">${s.proficiency_level}</span>
            </li>
          `).join('');
        }
      }

      // Render Listings
      if (profileListingsContainer) {
        if (!data.listings || data.listings.length === 0) {
          profileListingsContainer.innerHTML = `
            <div class="empty-state">
              <p class="empty-state-text">No active service listings published.</p>
              ${isOwnProfile ? '<a href="/listings.html" class="action-link">Create a listing →</a>' : ''}
            </div>
          `;
        } else {
          profileListingsContainer.innerHTML = data.listings.map(l => `
            <li class="editorial-list-item">
              <div>
                <a href="/listing-details.html?id=${l.listing_id}" class="editorial-title">${l.title}</a>
                <p class="editorial-meta">${l.category_name} · ${l.availability}</p>
              </div>
              <a href="/listing-details.html?id=${l.listing_id}" class="text-link">View →</a>
            </li>
          `).join('');
        }
      }

    } catch (err) {
      console.error('Failed to load profile:', err);
      alert('Could not load student profile.');
    }
  }

  // Modal open/close handlers
  if (openEditBtn && editModal) {
    openEditBtn.addEventListener('click', () => {
      editModal.showModal();
    });
  }

  if (closeEditBtn && editModal) {
    closeEditBtn.addEventListener('click', () => {
      editModal.close();
    });
  }

  // Handle Profile Update Submission
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formFeedback) {
        formFeedback.textContent = '';
        formFeedback.className = 'form-feedback';
      }

      const payload = {
        name: editNameInput.value.trim(),
        department: editDeptInput.value.trim(),
        year: editYearInput.value ? Number(editYearInput.value) : null,
        bio: editBioInput.value.trim()
      };

      try {
        await window.api.put(`/profile/${targetId}`, payload);
        if (formFeedback) {
          formFeedback.textContent = 'Profile updated successfully.';
          formFeedback.classList.add('feedback-success');
        }
        setTimeout(() => {
          if (editModal) editModal.close();
          loadProfile();
        }, 600);
      } catch (err) {
        if (formFeedback) {
          formFeedback.textContent = err.message || 'Failed to update profile.';
          formFeedback.classList.add('feedback-error');
        }
      }
    });
  }

  loadProfile();
});
