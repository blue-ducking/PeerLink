/**
 * PeerLink Skills Module Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  window.auth.enforceAuthGuard();
  window.auth.updateNavigation('skills');

  const mySkillsList = document.getElementById('my-skills-list');
  const catalogSelect = document.getElementById('skill-select');
  const levelSelect = document.getElementById('proficiency-select');
  const addSkillForm = document.getElementById('add-skill-form');
  const feedbackEl = document.getElementById('skills-feedback');

  async function loadMySkills() {
    try {
      const res = await window.api.get('/skills/my');
      const skills = res.data || [];

      if (!mySkillsList) return;

      if (skills.length === 0) {
        mySkillsList.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-text">You haven't added any skills to your profile yet.</p>
            <p class="empty-state-sub">Select skills from the catalog below to let peers know what you can help with.</p>
          </div>
        `;
        return;
      }

      mySkillsList.innerHTML = skills.map(s => `
        <li class="editorial-list-item">
          <div>
            <span class="skill-name">${s.name}</span>
            <span class="meta-tag">${s.proficiency_level}</span>
            <span class="meta-secondary">· ${s.category_name || 'General'}</span>
          </div>
          <button type="button" class="btn-text-danger" data-remove-skill="${s.skill_id}">Remove</button>
        </li>
      `).join('');

      // Attach remove handlers
      mySkillsList.querySelectorAll('[data-remove-skill]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const skillId = e.target.getAttribute('data-remove-skill');
          try {
            await window.api.delete(`/skills/my/${skillId}`);
            loadMySkills();
          } catch (err) {
            alert('Could not remove skill: ' + err.message);
          }
        });
      });

    } catch (err) {
      console.error('Failed to load my skills:', err);
    }
  }

  async function loadCatalog() {
    try {
      const res = await window.api.get('/skills');
      const catalog = res.data || [];

      if (catalogSelect) {
        catalogSelect.innerHTML = `
          <option value="">-- Choose a skill to add --</option>
          ${catalog.map(s => `<option value="${s.skill_id}">${s.name} (${s.category_name})</option>`).join('')}
        `;
      }
    } catch (err) {
      console.error('Failed to load skills catalog:', err);
    }
  }

  if (addSkillForm) {
    addSkillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'form-feedback';
      }

      const skillId = catalogSelect.value;
      const level = levelSelect.value;

      if (!skillId) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Please choose a skill from the list.';
          feedbackEl.classList.add('feedback-error');
        }
        return;
      }

      try {
        await window.api.post('/skills/my', {
          skill_id: Number(skillId),
          proficiency_level: level
        });

        if (feedbackEl) {
          feedbackEl.textContent = 'Skill added to your student profile.';
          feedbackEl.classList.add('feedback-success');
        }
        catalogSelect.value = '';
        loadMySkills();
      } catch (err) {
        if (feedbackEl) {
          feedbackEl.textContent = err.message || 'Failed to add skill.';
          feedbackEl.classList.add('feedback-error');
        }
      }
    });
  }

  loadMySkills();
  loadCatalog();
});
