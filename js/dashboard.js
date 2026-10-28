/**
 * PeerLink Dashboard Logic (Skillshare-Inspired Layout + Violet Palette)
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('dashboard');

  // Sidebar & Grid Elements
  const categoryNavList = document.getElementById('category-nav-list');
  const countAllCategories = document.getElementById('count-all-categories');
  const statSkills = document.getElementById('sidebar-stat-skills');
  const statListings = document.getElementById('sidebar-stat-listings');
  const statRequests = document.getElementById('sidebar-stat-requests');
  const currentCategoryTitle = document.getElementById('current-category-title');
  const cardsGrid = document.getElementById('cards-grid');

  // Local state
  let allListings = [];
  let allCategories = [];
  let currentCategoryId = 'all';

  // --- 1. SVG Geometric Banner Generator (Violet & Warm Yellow Palette) ---
  function getBannerSvg(categoryId, index) {
    const banners = [
      // Banner 1: Violet Lilac Spotlight & Geometric Angles
      `<svg class="card-banner-svg" viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="180" fill="#201E3C"/>
        <circle cx="90" cy="90" r="110" fill="#9D8DE2" opacity="0.6"/>
        <polygon points="260,20 380,180 180,180" fill="#B5A5EC" opacity="0.4"/>
        <circle cx="290" cy="70" r="45" fill="#F6D049"/>
        <path d="M40 140 Q 120 40 220 120 T 360 80" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.3"/>
      </svg>`,
      // Banner 2: Code & Logic Flow in Deep Violet & Yellow
      `<svg class="card-banner-svg" viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="180" fill="#181824"/>
        <rect x="30" y="30" width="160" height="110" rx="10" fill="#2C2B54" stroke="#9D8DE2" stroke-width="2"/>
        <line x1="50" y1="55" x2="110" y2="55" stroke="#F6D049" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="75" x2="160" y2="75" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
        <line x1="50" y1="95" x2="130" y2="95" stroke="#B5A5EC" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="280" cy="100" r="60" fill="#9D8DE2" opacity="0.7"/>
        <polygon points="280,50 340,150 220,150" fill="#F6D049" opacity="0.4"/>
      </svg>`,
      // Banner 3: Calculus & Precision Geometry
      `<svg class="card-banner-svg" viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="180" fill="#242244"/>
        <circle cx="300" cy="90" r="90" fill="#B5A5EC" opacity="0.5"/>
        <circle cx="120" cy="110" r="70" fill="#9D8DE2" opacity="0.6"/>
        <polygon points="120,40 180,140 60,140" fill="#F6D049"/>
        <line x1="30" y1="160" x2="350" y2="20" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 6" opacity="0.4"/>
      </svg>`,
      // Banner 4: Design & Creative UI/UX Canvas
      `<svg class="card-banner-svg" viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="180" fill="#1C1B30"/>
        <circle cx="190" cy="90" r="80" fill="#9D8DE2" opacity="0.5"/>
        <rect x="80" y="45" width="100" height="80" rx="8" fill="#F6D049" opacity="0.85"/>
        <rect x="200" y="65" width="110" height="70" rx="8" fill="#B5A5EC" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle cx="95" cy="60" r="6" fill="#18181B"/>
      </svg>`
    ];

    const idx = (categoryId ? Number(categoryId) + index : index) % banners.length;
    return banners[idx];
  }

  // --- 2. Render 3-Column Card Grid ---
  function renderListings(listings) {
    if (!cardsGrid) return;

    if (!listings || listings.length === 0) {
      cardsGrid.innerHTML = `
        <div class="dash-empty-state">
          <h3 class="dash-empty-title">No offerings found</h3>
          <p class="dash-empty-text">No active peer listings match this category yet. Be the first to post!</p>
          <a href="/features.html" class="dash-cta-btn">Offer a Skill on Campus +</a>
        </div>
      `;
      return;
    }

    cardsGrid.innerHTML = listings.map((l, index) => {
      const bannerSvg = getBannerSvg(l.category_id, index);
      const isPick = index % 2 === 0;
      const stickerHtml = isPick
        ? `<span class="card-sticker">Peer Pick.</span>`
        : `<span class="card-sticker yellow">★ Top Rated</span>`;

      // Mock rating for demo realism like Skillshare
      const ratingVal = (4.8 + ((l.listing_id * 3) % 3) * 0.1).toFixed(1);
      const reviewCount = 6 + (l.listing_id * 4);

      return `
        <article class="peer-card" data-listing-id="${l.listing_id}">
          <div class="card-banner">
            ${bannerSvg}
            ${stickerHtml}
            <span class="card-category-badge">${l.category_name}</span>
          </div>

          <div class="card-body">
            <div class="card-provider-row">
              <span class="card-provider" title="${l.provider_department || 'Student'}">
                ${l.provider_name}
                <span class="provider-dot" title="Verified Student">●</span>
              </span>
              <span class="card-rating">
                <span class="star-icon">★</span> ${ratingVal}
                <span class="rating-count">(${reviewCount})</span>
              </span>
            </div>

            <h3 class="card-title">${l.title}</h3>

            <div class="card-chips">
              <span class="skill-chip violet">${l.skill_name || l.category_name}</span>
              <span class="skill-chip">${l.is_free ? 'Free Tutoring' : 'Exchange'}</span>
            </div>

            <div class="card-footer">
              <div class="card-meta-group">
                <span class="card-meta-item">📶 All levels</span>
                <span class="card-meta-item">⏱ ${l.availability || 'Flexible'}</span>
              </div>
              <button type="button" class="btn-bookmark" aria-label="Save listing" title="Save to bookmarks">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card click handlers (leads to features.html)
    document.querySelectorAll('.peer-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent click if bookmark button was clicked
        if (e.target.closest('.btn-bookmark')) {
          e.stopPropagation();
          const bookmarkBtn = e.target.closest('.btn-bookmark');
          bookmarkBtn.classList.toggle('bookmarked');
          const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
          bookmarkBtn.setAttribute('title', isBookmarked ? 'Saved to bookmarks' : 'Save to bookmarks');
          return;
        }

        window.location.href = '/features.html';
      });
    });
  }

  // --- 3. Category Filter Trigger ---
  function filterByCategory(categoryId, categoryName) {
    currentCategoryId = categoryId;

    // Update active class in sidebar
    document.querySelectorAll('.category-nav-item').forEach(item => {
      const btn = item.querySelector('button');
      if (btn && btn.getAttribute('data-category-id') === String(categoryId)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (categoryId === 'all') {
      currentCategoryTitle.textContent = 'Popular Offerings';
      renderListings(allListings);
    } else {
      currentCategoryTitle.textContent = `${categoryName} Offerings`;
      const filtered = allListings.filter(l => String(l.category_id) === String(categoryId));
      renderListings(filtered);
    }
  }

  // --- 4. Intercept search enter on dashboard for instant in-page filtering ---
  const headerSearchInput = document.getElementById('dash-header-search-input');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', () => {
      const query = headerSearchInput.value.trim().toLowerCase();
      if (!query) {
        if (currentCategoryId === 'all') {
          currentCategoryTitle.textContent = 'Popular Offerings';
          renderListings(allListings);
        } else {
          const cat = allCategories.find(c => String(c.category_id) === String(currentCategoryId));
          filterByCategory(currentCategoryId, cat ? cat.name : 'Campus');
        }
        return;
      }

      const filtered = allListings.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        (l.skill_name && l.skill_name.toLowerCase().includes(query)) ||
        (l.category_name && l.category_name.toLowerCase().includes(query)) ||
        l.provider_name.toLowerCase().includes(query)
      );

      currentCategoryTitle.textContent = `Search results for "${headerSearchInput.value.trim()}"`;
      renderListings(filtered);
    });
  }

  // --- 5. Load Data from Backend ---
  try {
    const meRes = await window.api.get('/auth/me');
    const user = meRes.data.user;

    // Fetch User Stats for sidebar
    try {
      const skillsRes = await window.api.get('/skills/my');
      if (statSkills) statSkills.textContent = skillsRes.data?.length || 0;
    } catch {
      if (statSkills) statSkills.textContent = '0';
    }

    try {
      const myListingsRes = await window.api.get('/listings', { provider_id: user.user_id });
      if (statListings) statListings.textContent = myListingsRes.data?.length || 0;
    } catch {
      if (statListings) statListings.textContent = '0';
    }

    if (statRequests) statRequests.textContent = '0';

    // Fetch Categories
    try {
      const catRes = await window.api.get('/skills/categories');
      allCategories = catRes.data || [];

      if (categoryNavList && allCategories.length > 0) {
        const allBtnHtml = `
          <li class="category-nav-item active">
            <button type="button" data-category-id="all">
              <span>All Offerings</span>
              <span class="meta-tag" id="count-all-categories">-</span>
            </button>
          </li>
        `;

        const categoriesHtml = allCategories.map(c => `
          <li class="category-nav-item">
            <button type="button" data-category-id="${c.category_id}" data-category-name="${c.name}">
              <span>${c.name}</span>
            </button>
          </li>
        `).join('');

        categoryNavList.innerHTML = allBtnHtml + categoriesHtml;

        categoryNavList.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-category-id');
            const catName = btn.getAttribute('data-category-name') || 'Campus';
            filterByCategory(catId, catName);
          });
        });
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }

    // Fetch All Active Listings
    try {
      const listRes = await window.api.get('/listings');
      allListings = listRes.data || [];

      const countEl = document.getElementById('count-all-categories');
      if (countEl) countEl.textContent = allListings.length;

      renderListings(allListings);
    } catch (err) {
      if (cardsGrid) {
        cardsGrid.innerHTML = '<p class="error-inline">Failed to load campus offerings.</p>';
      }
    }

  } catch (err) {
    console.error('Failed to initialize dashboard:', err);
  }
});
