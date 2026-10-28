# PeerLink Team Development Guide

Welcome to the **PeerLink** codebase. This guide explains how our 6-student capstone team collaborates, branch conventions, module ownership, and how to build features on top of this foundation.

---

## 1. Team Responsibilities & Module Ownership

| Role | Member | Responsibilities | Target Code Locations |
|---|---|---|---|
| **Member 1 (Lead)** | Author of this Foundation | Project architecture, Express & MySQL setup, Auth & Verification foundation, API conventions, Security checks, Base Git structure. | `server/server.js`, `server/config/`, `server/middleware/`, `database/` |
| **Member 2** | Teammate 2 | Student Profile enhancements, Skills management UI, Skill endorsement & verification. | `client/profile.html`, `client/skills.html`, `js/profile.js`, `js/skills.js`, `server/controllers/skills.controller.js` |
| **Member 3** | Teammate 3 | Service Listings full lifecycle (editing, status PAUSED/CLOSED, availability calendar, provider stats). | `client/listings.html`, `client/listing-details.html`, `js/listings.js`, `server/controllers/listings.controller.js` |
| **Member 4** | Teammate 4 | Advanced Search filters, Service Request full status workflow (CANCELLED, COMPLETED), feedback notifications. | `client/search.html`, `client/requests.html`, `js/search.js`, `js/requests.js`, `server/controllers/requests.controller.js` |
| **Member 5** | Teammate 5 | AI Assistant pipeline, natural language intent parser, integrating LLM API with SQL listings truth. | `client/ai.html`, `js/ai.js`, `server/controllers/ai.controller.js`, `server/routes/ai.routes.js` |

---

## 2. Git Branch Strategy

We use a standard Git feature-branch workflow. **No developer pushes directly to `main` or `develop`.**

```text
main (Release-ready only)
 │
 └── develop (Shared integration branch)
      │
      ├── feature/profile-skills     (Member 2)
      ├── feature/listings           (Member 3)
      ├── feature/search-requests    (Member 4)
      └── feature/ai-assistant       (Member 5)
```

### Git Workflow Commands

1. **Start a new feature**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Commit your progress**:
   ```bash
   git add .
   git commit -m "Implement student skill badge filtering"
   ```

3. **Verify tests before pushing**:
   ```bash
   npm test
   ```

4. **Submit for review**:
   Push your branch and open a Pull Request into `develop`.

---

## 3. How to Extend the Codebase

### Adding an API Endpoint
1. Add the route definition in `server/routes/<module>.routes.js`.
2. Apply appropriate middleware:
   - `requireAuth`: If the user must be logged in.
   - `requireVerified`: If the student's campus status must be `VERIFIED`.
   - `requireAdmin`: If administrator privileges are required.
3. Write the business logic in `server/controllers/<module>.controller.js`.
4. Always query the database using parameterized queries (`db.query(sql, [params])`). **Never concatenate user input into SQL.**
5. Enforce server-side ownership (IDOR checks) — never trust user IDs passed in request bodies.

### Adding Client UI Pages & Scripts
1. Follow the **Mona Sans editorial design language** defined in `DESIGN.md`:
   - Avoid creating boxy cards for every piece of content.
   - Use `.editorial-list` and `.editorial-list-item` with hairline dividers.
   - Ensure WCAG AA contrast (≥4.5:1 text).
2. Use the centralized `window.api` client (`api.get()`, `api.post()`, `api.put()`, `api.delete()`). Do not write raw `fetch()` calls.
3. Call `window.auth.enforceAuthGuard()` and `window.auth.updateNavigation('<activeKey>')` on protected pages.

### Running Backend Tests
Always ensure all tests pass:
```bash
npm test
```
Add new tests in the `tests/` directory using Node.js built-in `node:test` and `node:assert`.
