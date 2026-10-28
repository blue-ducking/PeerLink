# PeerLink System Architecture

This document describes the architectural design of the **PeerLink** campus platform core prototype.

---

## 1. System Overview

PeerLink is designed around a three-tier architectural model:
- **Presentation Layer**: Vanilla HTML5, CSS3, and JavaScript, styled in accordance with the Mona Sans editorial design language.
- **Application & API Layer**: Node.js and Express.js REST API providing routing, controller logic, middleware authentication, and security boundaries.
- **Data Layer**: Relational MySQL database (InnoDB engine) acting as the single source of truth.

```text
┌────────────────────────────────────────────────────────┐
│                   Browser Client                       │
│    (HTML5 · CSS3 · Vanilla JS · api.js · auth.js)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middlewares: requireAuth, requireVerified, CORS  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Controllers: Auth, Profile, Skills, Listings,    │  │
│  │              Requests, Search, AI Extension      │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized SQL
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MySQL Database                       │
│  (users, student_profiles, skills, student_skills,    │
│   categories, service_listings, service_requests)     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Vertical Slice

The core 20–30% prototype delivers the critical path of the platform:
1. **Student Registration**: Student registers with University ID and password.
2. **Identity Verification**: Account is created in `PENDING` status; administrator review endpoint allows approving to `VERIFIED`.
3. **Session Authentication**: Bcrypt password comparison issues secure JWT token.
4. **Dashboard**: Greeting, activity metrics (skills, listings, requests), quick search, recent offerings.
5. **Student Profile**: 1:1 user profile with edit capabilities and IDOR protection.
6. **Skills Catalog**: Junction table `student_skills` mapping students to skills and proficiency levels.
7. **Service Listings**: Verified students publish tutoring or assistance offerings.
8. **Parameterized Search**: Full-text and substring search across titles, descriptions, skills, and categories.
9. **Service Requests**: Requester submits assistance request; designated provider can accept or reject.
10. **AI Assistant Extension**: Clean architectural bridge for natural-language query resolution (Member 5).

---

## 3. Security Architecture

1. **Password Security**:
   - Passwords are never stored in plain text.
   - Hashed using `bcrypt` with 10 salt rounds.
   - Password hashes are strictly excluded from API response payloads.
2. **SQL Injection Defense**:
   - Parameterized queries (`?` placeholders) are used for all dynamic database operations.
   - User input is never concatenated directly into SQL queries.
3. **Insecure Direct Object Reference (IDOR) Mitigation**:
   - The server never trusts client-supplied user identifiers for mutations.
   - Profile updates verify that `req.user.userId === targetProfile.user_id`.
   - Listing modifications and deletions verify provider ownership.
   - Request acceptance and rejection verify that the authenticated student is the designated provider.
4. **Role-Based Access Control (RBAC)**:
   - `requireAuth`: Enforces valid session token.
   - `requireVerified`: Restricts service creation to students verified by campus administration.
   - `requireAdmin`: Restricts student verification and management endpoints.
