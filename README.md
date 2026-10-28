# PeerLink — Core Prototype Foundation

> **Your Campus. Your People. Your Resources.**  
> A closed-campus peer-to-peer platform connecting verified university students to share skills, tutor peers, and collaborate.

---

## 1. Prototype Scope

This repository contains the **core 20–30% prototype** of the PeerLink platform built for our university capstone project. 

It implements the complete foundational vertical slice:
- Student Registration & University ID authentication
- Campus verification lifecycle (`PENDING` -> `VERIFIED` / `REJECTED`)
- Relational MySQL schema & seed data (InnoDB engine)
- 1:1 Student Profiles with IDOR protection
- M:N Student Skills junction catalog
- Service Listings directory with provider attribution
- Parameterized cross-table search
- Service Request state machine (Pending / Accepted / Rejected)
- AI Assistant extension point
- Mona Sans editorial design system (HTML5, CSS3, Vanilla JS)

---

## 2. Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No React, Vue, or heavy frontend frameworks)
- **Backend**: Node.js (v20+), Express.js
- **API**: RESTful JSON API
- **Database**: MySQL 8.0+ (with high-fidelity automatic offline mock store for portable testing)
- **Security**: Bcrypt password hashing, JWT authentication, parameterized SQL, server-side IDOR checks
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert`)

---

## 3. Project Structure

```text
peerlink/
├── client/                     # Frontend HTML pages
│   ├── index.html              # Campus landing page
│   ├── login.html              # Student login
│   ├── register.html           # Student registration
│   ├── dashboard.html          # Student activity workspace
│   ├── profile.html            # Profile & identity management
│   ├── skills.html             # Skills catalog & attachment
│   ├── listings.html           # Service offerings directory
│   ├── listing-details.html    # Offering details & request form
│   ├── search.html             # Parameterized search interface
│   ├── requests.html           # Service request tracking
│   └── ai.html                 # AI assistant extension point
│
├── css/                        # Mona Sans & GitHub editorial design system
│   ├── style.css               # Core typography, reset & layout
│   ├── components.css          # Buttons, badges, editorial lists, dialogs
│   ├── auth.css                # Authentication form layouts
│   └── dashboard.css           # Workspace & activity metrics
│
├── js/                         # Vanilla client JavaScript
│   ├── api.js                  # Centralized fetch API client
│   ├── auth.js                 # Session & navigation manager
│   ├── dashboard.js            # Dashboard counters & activity
│   ├── profile.js              # Profile editor & skill display
│   ├── skills.js               # Skills management
│   ├── listings.js             # Offerings directory & modal
│   ├── search.js               # Parameterized search handler
│   ├── requests.js             # Request approval/rejection
│   └── ai.js                   # AI assistant extension logic
│
├── server/                     # Node.js / Express backend
│   ├── server.js               # Server entrypoint & middleware setup
│   ├── config/
│   │   └── database.js         # MySQL pool & mock database adapter
│   ├── controllers/            # Controller business logic
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── skills.controller.js
│   │   ├── listings.controller.js
│   │   ├── search.controller.js
│   │   ├── requests.controller.js
│   │   └── ai.controller.js
│   ├── middleware/             # Security & validation middlewares
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── routes/                 # Express REST route definitions
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── skills.routes.js
│   │   ├── listings.routes.js
│   │   ├── search.routes.js
│   │   ├── requests.routes.js
│   │   └── ai.routes.js
│   └── utils/
│       └── seedRunner.js       # MySQL schema & seed runner
│
├── database/                   # Relational database definitions
│   ├── schema.sql              # DDL schema (InnoDB tables, FKs, indexes)
│   └── seed.sql                # Realistic campus demo seed data
│
├── docs/                       # Project documentation for teammates
│   ├── ARCHITECTURE.md         # Layered architectural breakdown
│   ├── DATABASE.md             # Relational schema & migration policy
│   ├── API.md                  # Complete REST API reference
│   └── TEAM_DEVELOPMENT.md     # Member roles & branch guide
│
├── tests/                      # Automated test suite
│   ├── auth.test.js
│   ├── profile.test.js
│   ├── listings.test.js
│   ├── requests.test.js
│   └── database.test.js
│
├── .env.example                # Template environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher; tested on v20.9.0)
- **npm** (v9.0.0 or higher)
- **MySQL** (Optional for local review — if MySQL is offline, the server runs in high-fidelity mock memory mode with seed data automatically)

### Installation
1. Clone the repository and navigate into the folder:
   ```bash
   git clone <repo-url>
   cd peerlink
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Database Setup (When MySQL is installed)
To initialize the MySQL database schema and demo seed data:
```bash
npm run seed
```

### Running the Application
Start the development server:
```bash
npm run dev
```
Or start in standard production mode:
```bash
npm start
```

Visit **http://localhost:3000** in your web browser.

---

## 5. Demo Accounts

The prototype comes with pre-seeded demo accounts (password: `Password123!` for all):

| Account Type | University ID | Name | Role | Status |
|---|---|---|---|---|
| **Administrator** | `ADMIN001` | System Administrator | admin | VERIFIED |
| **Student** | `STU1001` | Alex Kumar | student | VERIFIED |
| **Student** | `STU1002` | Sarah Chen | student | VERIFIED |
| **Student** | `STU1003` | Joel Miller | student | VERIFIED |
| **Pending Student** | `STU1004` | Priya Sharma | student | PENDING |

---

## 6. Running the Automated Tests

Run the complete test suite:
```bash
npm test
```

All 28 automated tests verify:
- Registration, validation, duplicate rejection, and bcrypt hashing
- Login, invalid credentials, and authentication guards
- Student profile access and strict IDOR modification protection
- Service listing creation and provider ownership checks
- Service request flow and provider-only accept/reject authorization
- Database relational integrity and seed verification

---

## 7. Documentation Links

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Architectural design & security boundaries.
- **[docs/DATABASE.md](docs/DATABASE.md)** — Relational tables, relationships, and change policy.
- **[docs/API.md](docs/API.md)** — Complete REST endpoint documentation.
- **[docs/TEAM_DEVELOPMENT.md](docs/TEAM_DEVELOPMENT.md)** — Member responsibilities and branch workflow.
