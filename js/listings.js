/**
 * PeerLink Service Listings Module Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('services');

  const listingsList = document.getElementById('listings-list');
  const categoryFilter = document.getElementById('category-filter');
  const myFilterCheckbox = document.getElementById('filter-mine');
  const openCreateBtn = document.getElementById('open-create-listing-btn');
  const createModal = document.getElementById('create-listing-modal');
  const closeCreateBtn = document.getElementById('close-create-modal-btn');
  const createForm = document.getElementById('create-listing-form');
  const createCategorySelect = document.getElementById('listing-category');
  const createSkillSelect = document.getElementById('listing-skill');
  const createFeedback = document.getElementById('create-listing-feedback');

  const currentUser = window.api.getUser();
  const isVerified = currentUser && currentUser.verificationStatus === 'VERIFIED';

  async function loadCategories() {
    try {
      const res = await window.api.get('/skills/categories');
      const categories = res.data || [];

      if (categoryFilter) {
        categoryFilter.innerHTML = `
          <option value="">All Categories</option>
          ${categories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('')}
        `;
      }

      if (createCategorySelect) {
        createCategorySelect.innerHTML = `
          <option value="">-- Select Category --</option>
          ${categories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async function loadSkillsForCreate() {
    try {
      const res = await window.api.get('/skills');
      const skills = res.data || [];

      if (createSkillSelect) {
        createSkillSelect.innerHTML = `
          <option value="">-- None / General Skill --</option>
          ${skills.map(s => `<option value="${s.skill_id}">${s.name}</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  }

  async function loadListings() {
    try {
      const params = {};
      if (categoryFilter && categoryFilter.value) {
        params.category_id = categoryFilter.value;
      }
      if (myFilterCheckbox && myFilterCheckbox.checked) {
        params.provider_id = currentUser.userId;
      }

      const res = await window.api.get('/listings', params);
      const listings = res.data || [];

      if (!listingsList) return;

      if (listings.length === 0) {
        listingsList.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-text">No service listings found matching criteria.</p>
            <p class="empty-state-sub">Try selecting a different category or share your own skills.</p>
          </div>
        `;
        return;
      }

      listingsList.innerHTML = listings.map(l => {
        const isMine = Number(l.provider_id) === Number(currentUser.userId);
        return `
          <li class="editorial-list-item">
            <div class="editorial-content">
              <a href="/listing-details.html?id=${l.listing_id}" class="editorial-title">${l.title}</a>
              <p class="editorial-snippet">${l.description}</p>
              <p class="editorial-meta">
                <span class="meta-tag">${l.category_name}</span>
                ${l.skill_name ? `<span class="meta-tag">${l.skill_name}</span>` : ''}
                <span class="meta-secondary">· Provided by <strong>${l.provider_name}</strong> (${l.provider_department || 'Student'})</span>
                <span class="meta-secondary">· ${l.availability}</span>
                ${isMine ? '<span class="badge badge-verified">Your Listing</span>' : ''}
              </p>
            </div>
            <div class="editorial-action">
              <a href="/listing-details.html?id=${l.listing_id}" class="btn btn-secondary">Details →</a>
            </div>
          </li>
        `;
      }).join('');

    } catch (err) {
      console.error('Failed to load listings:', err);
      if (listingsList) {
        listingsList.innerHTML = '<p class="error-inline">Failed to load listings.</p>';
      }
    }
  }

  // Filter change listeners
  if (categoryFilter) categoryFilter.addEventListener('change', loadListings);
  if (myFilterCheckbox) myFilterCheckbox.addEventListener('change', loadListings);

  // Modal open check
  if (openCreateBtn && createModal) {
    openCreateBtn.addEventListener('click', () => {
      if (!isVerified && currentUser.role !== 'admin') {
        alert('Your student identity is currently PENDING approval. Only verified campus students can publish service listings.');
        return;
      }
      createModal.showModal();
    });
  }

  if (closeCreateBtn && createModal) {
    closeCreateBtn.addEventListener('click', () => {
      createModal.close();
    });
  }

  // Create listing submission
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (createFeedback) {
        createFeedback.textContent = '';
        createFeedback.className = 'form-feedback';
      }

      const title = document.getElementById('listing-title').value.trim();
      const categoryId = document.getElementById('listing-category').value;
      const skillId = document.getElementById('listing-skill').value;
      const availability = document.getElementById('listing-availability').value.trim();
      const description = document.getElementById('listing-description').value.trim();

      try {
        await window.api.post('/listings', {
          title,
          category_id: Number(categoryId),
          skill_id: skillId ? Number(skillId) : null,
          availability: availability || 'Flexible schedule',
          description,
          is_free: true
        });

        if (createFeedback) {
          createFeedback.textContent = 'Listing published successfully.';
          createFeedback.classList.add('feedback-success');
        }

        createForm.reset();
        setTimeout(() => {
          if (createModal) createModal.close();
          loadListings();
        }, 500);

      } catch (err) {
        if (createFeedback) {
          createFeedback.textContent = err.message || 'Failed to create listing.';
          createFeedback.classList.add('feedback-error');
        }
      }
    });
  }

  await loadCategories();
  await loadSkillsForCreate();
  await loadListings();
});
