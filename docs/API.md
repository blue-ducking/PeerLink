# PeerLink REST API Documentation

This specification details all endpoints implemented in the PeerLink core prototype.

---

## 1. Conventions

- **Base URL**: `/api`
- **Request Format**: JSON (`Content-Type: application/json`)
- **Response Format**: Consistent JSON envelope:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```
  Or for errors:
  ```json
  {
    "success": false,
    "error": "Human-readable explanation of error."
  }
  ```
- **Authentication**: JWT sent via `Authorization: Bearer <token>` or browser `token` cookie.

---

## 2. Authentication & Verification (`/api/auth`)

### Register Student
`POST /api/auth/register`
- **Body**:
  ```json
  {
    "university_id": "STU1006",
    "password": "Password123!",
    "name": "Maya Patel",
    "department": "Computer Science",
    "year": 2
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully. Verification status is PENDING.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "userId": 7, "universityId": "STU1006", "role": "student", "verificationStatus": "PENDING", "name": "Maya Patel" }
    }
  }
  ```

### Student Login
`POST /api/auth/login`
- **Body**: `{ "university_id": "STU1001", "password": "Password123!" }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "userId": 2, "universityId": "STU1001", "role": "student", "verificationStatus": "VERIFIED", "name": "Alex Kumar" }
    }
  }
  ```

### Current User Identity
`GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Returns `{ user, profile }`.

### Administrator List Users
`GET /api/auth/users`
- **Headers**: Requires `role: admin`.
- **Response (200 OK)**: Returns list of all campus students and accounts with profile details and verification status.

### Administrator Student Verification
`PATCH /api/auth/users/:id/verify`
- **Headers**: Requires `role: admin`.
- **Body**: `{ "status": "VERIFIED" }` (or `"REJECTED"`, `"PENDING"`)
- **Response (200 OK)**: `{ "success": true, "data": { "userId": 5, "status": "VERIFIED" } }`

---

## 3. Profiles (`/api/profile`)

### Get Profile
`GET /api/profile/:id`
- Returns profile information, public skills, and active listings.

### Update Profile
`PUT /api/profile/:id`
- **Headers**: Requires authentication.
- **Security Check**: User can only edit their own profile (IDOR protected; returns 403 Forbidden otherwise).
- **Body**: `{ "name": "Alex Kumar", "department": "Computer Science", "year": 3, "bio": "Senior year student." }`

---

## 4. Skills (`/api/skills`)

- `GET /api/skills`: Returns master catalog with categories.
- `GET /api/skills/categories`: Returns categories taxonomy.
- `GET /api/skills/my`: Returns current authenticated student's skills with proficiency.
- `POST /api/skills/my`: Attach skill (`{ "skill_id": 1, "proficiency_level": "ADVANCED" }`).
- `DELETE /api/skills/my/:id`: Remove skill from student profile.

---

## 5. Service Listings (`/api/listings`)

- `GET /api/listings`: Filter by `?category_id=...` or `?provider_id=...`.
- `GET /api/listings/:id`: Full details of specific service offering.
- `POST /api/listings`: Create new offering. Requires `status: VERIFIED`. Body: `{ "title": "...", "category_id": 1, "skill_id": 2, "description": "...", "availability": "..." }`.
- `PUT /api/listings/:id`: Update listing (provider ownership verified server-side).
- `DELETE /api/listings/:id`: Delete listing (provider ownership verified server-side).

---

## 6. Search (`/api/search`)

### Search Service Listings
`GET /api/search/services?q=python`
- Parameterized SQL search querying `title`, `description`, `skill name`, and `category name`.
- Returns matching active listings ordered by newest first.

---

## 7. Service Requests (`/api/requests`)

- `GET /api/requests`: Returns all requests where authenticated user is requester or provider.
- `POST /api/requests`: Submit request (`{ "listing_id": 1, "message": "Can we meet Wednesday?" }`). Prevents requesting own listing.
- `PATCH /api/requests/:id/accept`: Provider accepts request (IDOR protected; only designated provider can accept).
- `PATCH /api/requests/:id/reject`: Provider declines request.

---

## 8. AI Assistant (`/api/ai`)

### Assistant Extension Point
`POST /api/ai/query`
- **Body**: `{ "prompt": "I need help with Python debugging." }`
- **Response**: If API key is not configured, returns clear architectural notice with suggested SQL search keywords. Extension point for Member 5.
