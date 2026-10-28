# PeerLink Database Architecture & Policy

This document defines the relational database architecture, schema conventions, and policy for proposing database changes for the **PeerLink** platform.

---

## 1. Source of Truth
The **MySQL database** is the single source of truth for the PeerLink system. Applications (backend, frontend, or future AI pipelines) query and mutate this relational model.

The schema is maintained in `database/schema.sql` and development seed data is maintained in `database/seed.sql`.

---

## 2. Relational Schema Summary

### `users`
Core identity table managing student credentials and verification lifecycle.
- `user_id` (INT, PK, Auto Increment)
- `university_id` (VARCHAR(50), UNIQUE, NOT NULL): Campus enrollment identifier.
- `password_hash` (VARCHAR(255), NOT NULL): Salted bcrypt hash (rounds: 10).
- `role` (ENUM('student', 'admin'), DEFAULT 'student').
- `verification_status` (ENUM('PENDING', 'VERIFIED', 'REJECTED'), DEFAULT 'PENDING').
- `created_at`, `updated_at` (TIMESTAMP).

### `student_profiles`
1:1 relationship with `users` holding public academic information.
- `profile_id` (INT, PK, Auto Increment)
- `user_id` (INT, UNIQUE, FK -> users.user_id ON DELETE CASCADE)
- `name` (VARCHAR(100), NOT NULL)
- `department` (VARCHAR(100))
- `year` (INT)
- `bio` (TEXT)
- `profile_image` (VARCHAR(255), NULL)
- `created_at`, `updated_at` (TIMESTAMP)

### `categories`
Taxonomy table for skills, listings, and future marketplace modules.
- `category_id` (INT, PK, Auto Increment)
- `name` (VARCHAR(50), UNIQUE, NOT NULL)
- `description` (VARCHAR(255))
- `created_at` (TIMESTAMP)

### `skills`
Master catalog of academic, software, and creative skills.
- `skill_id` (INT, PK, Auto Increment)
- `name` (VARCHAR(100), UNIQUE, NOT NULL)
- `description` (TEXT)
- `category_id` (INT, FK -> categories.category_id ON DELETE SET NULL)
- `created_at` (TIMESTAMP)

### `student_skills`
M:N Junction Table linking students to multiple skills with proficiency rating.
- `student_id` (INT, FK -> users.user_id ON DELETE CASCADE)
- `skill_id` (INT, FK -> skills.skill_id ON DELETE CASCADE)
- `proficiency_level` (ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'), DEFAULT 'INTERMEDIATE')
- `created_at` (TIMESTAMP)
- **Composite Primary Key**: `(student_id, skill_id)`

### `service_listings`
Peer service and tutoring offerings created by verified students.
- `listing_id` (INT, PK, Auto Increment)
- `provider_id` (INT, FK -> users.user_id ON DELETE CASCADE)
- `skill_id` (INT, NULL, FK -> skills.skill_id ON DELETE SET NULL)
- `category_id` (INT, FK -> categories.category_id ON DELETE RESTRICT)
- `title` (VARCHAR(150), NOT NULL)
- `description` (TEXT, NOT NULL)
- `availability` (VARCHAR(100), DEFAULT 'Flexible schedule')
- `price` (DECIMAL(10,2), DEFAULT 0.00)
- `is_free` (BOOLEAN, DEFAULT TRUE)
- `status` (ENUM('ACTIVE', 'PAUSED', 'CLOSED'), DEFAULT 'ACTIVE')
- `created_at`, `updated_at` (TIMESTAMP)

### `service_requests`
Connects student requesters with service listings and providers.
- `request_id` (INT, PK, Auto Increment)
- `requester_id` (INT, FK -> users.user_id ON DELETE CASCADE)
- `listing_id` (INT, FK -> service_listings.listing_id ON DELETE CASCADE)
- `provider_id` (INT, FK -> users.user_id ON DELETE CASCADE)
- `message` (TEXT, NOT NULL)
- `status` (ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'), DEFAULT 'PENDING')
- `created_at`, `updated_at` (TIMESTAMP)

---

## 3. Entity Relationship Diagram

```text
       users (1)
         │
         ├─── 1:1 ───► student_profiles
         │
         ├─── 1:M ───► student_skills ◄─── M:1 ─── skills ◄─── M:1 ─── categories
         │                                          │                      │
         ├─── 1:M ───► service_listings (Provider) ─┴──────────────────────┘
         │               │
         │               └─── 1:M
         │                     │
         └─── 1:M ─────────────┼──► service_requests
              (Requester)      │
```

---

## 4. Database Change Policy (Crucial for Team)

To prevent breaking team members' working copies:
1. **Never edit `schema.sql` arbitrarily.**
2. When proposing a new column or table (e.g. Member 2 adding portfolio links, Member 4 adding search tags):
   - Propose an incremental migration file in `database/migrations/` (e.g. `001_add_portfolio.sql`).
   - Use additive, non-breaking column additions with sensible defaults (`DEFAULT NULL` or `DEFAULT 'ACTIVE'`).
   - Run the automated test suite (`npm test`) before submitting a pull request to `develop`.
3. Do not hardcode database credentials. Always configure through `.env`.
