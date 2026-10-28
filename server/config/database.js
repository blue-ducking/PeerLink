const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_NAME = 'peerlink_db',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_CLIENT = 'auto',
  NODE_ENV = 'development'
} = process.env;

let pool = null;
let useMock = (DB_CLIENT === 'mock' || NODE_ENV === 'test');

// In-memory mock database state for offline development, grading, and testing without MySQL server
const mockDb = {
  users: [
    { user_id: 1, university_id: 'ADMIN001', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'admin', verification_status: 'VERIFIED', created_at: new Date('2026-09-01T08:00:00Z') },
    { user_id: 2, university_id: 'STU1001', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'student', verification_status: 'VERIFIED', created_at: new Date('2026-09-02T09:00:00Z') },
    { user_id: 3, university_id: 'STU1002', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'student', verification_status: 'VERIFIED', created_at: new Date('2026-09-03T10:00:00Z') },
    { user_id: 4, university_id: 'STU1003', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'student', verification_status: 'VERIFIED', created_at: new Date('2026-09-04T11:00:00Z') },
    { user_id: 5, university_id: 'STU1004', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'student', verification_status: 'PENDING', created_at: new Date('2026-09-05T12:00:00Z') },
    { user_id: 6, university_id: 'STU1005', password_hash: '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', role: 'student', verification_status: 'REJECTED', created_at: new Date('2026-09-06T13:00:00Z') }
  ],
  student_profiles: [
    { profile_id: 1, user_id: 1, name: 'System Administrator', department: 'Campus IT Services', year: 0, bio: 'Platform administrator responsible for campus identity verification.', profile_image: null, created_at: new Date('2026-09-01T08:00:00Z'), updated_at: new Date('2026-09-01T08:00:00Z') },
    { profile_id: 2, user_id: 2, name: 'Alex Kumar', department: 'Computer Science & Engineering', year: 2, bio: 'Interested in Python, backend architecture, and building campus tools.', profile_image: null, created_at: new Date('2026-09-02T09:00:00Z'), updated_at: new Date('2026-09-02T09:00:00Z') },
    { profile_id: 3, user_id: 3, name: 'Sarah Chen', department: 'Mathematics & Computing', year: 3, bio: 'Peer tutor for calculus, discrete mathematics, and algorithms.', profile_image: null, created_at: new Date('2026-09-03T10:00:00Z'), updated_at: new Date('2026-09-03T10:00:00Z') },
    { profile_id: 4, user_id: 4, name: 'Joel Miller', department: 'Digital Design & Media', year: 2, bio: 'Focusing on Figma, visual hierarchy, and accessible web interfaces.', profile_image: null, created_at: new Date('2026-09-04T11:00:00Z'), updated_at: new Date('2026-09-04T11:00:00Z') },
    { profile_id: 5, user_id: 5, name: 'Priya Sharma', department: 'Electronics & Communication', year: 1, bio: 'First-year student learning C programming and microcontrollers.', profile_image: null, created_at: new Date('2026-09-05T12:00:00Z'), updated_at: new Date('2026-09-05T12:00:00Z') },
    { profile_id: 6, user_id: 6, name: 'David Lee', department: 'Business Administration', year: 4, bio: 'Senior helping with student CV polish and presentation prep.', profile_image: null, created_at: new Date('2026-09-06T13:00:00Z'), updated_at: new Date('2026-09-06T13:00:00Z') }
  ],
  categories: [
    { category_id: 1, name: 'Programming', description: 'Software engineering, scripts, web and app development' },
    { category_id: 2, name: 'Design', description: 'UI/UX design, graphic arts, illustration, and brand identity' },
    { category_id: 3, name: 'Academic', description: 'Subject tutoring, exam preparation, mathematics, and science' },
    { category_id: 4, name: 'Languages', description: 'Foreign language conversation, grammar, and ESL assistance' },
    { category_id: 5, name: 'Photography', description: 'Campus portraits, event photography, and camera fundamentals' },
    { category_id: 6, name: 'Video Editing', description: 'Premiere, DaVinci, CapCut, and short-form video production' },
    { category_id: 7, name: 'Business', description: 'Resume reviewing, case competitions, and marketing basics' },
    { category_id: 8, name: 'Music', description: 'Instrument lessons, audio production, and music theory' },
    { category_id: 9, name: 'Sports', description: 'Fitness coaching, sports rules, and athletic drills' },
    { category_id: 10, name: 'Other', description: 'General peer assistance and university life guidance' }
  ],
  skills: [
    { skill_id: 1, name: 'Python Programming', description: 'Core Python, scripting, libraries, and algorithm problem solving', category_id: 1 },
    { skill_id: 2, name: 'JavaScript', description: 'Vanilla JavaScript, DOM manipulation, and modern ES6+ concepts', category_id: 1 },
    { skill_id: 3, name: 'Android Development', description: 'Android Studio, Kotlin basics, UI layouts, and lifecycle', category_id: 1 },
    { skill_id: 4, name: 'UI/UX Design', description: 'Wireframing, user journeys, responsive spacing, and prototyping', category_id: 2 },
    { skill_id: 5, name: 'Graphic Design', description: 'Visual assets, color systems, and digital illustration in Photoshop/Illustrator', category_id: 2 },
    { skill_id: 6, name: 'Calculus & Linear Algebra', description: 'Single-variable calculus, vector spaces, and matrix transformations', category_id: 3 },
    { skill_id: 7, name: 'Discrete Mathematics', description: 'Proofs, graph theory, combinatorics, and boolean logic', category_id: 3 },
    { skill_id: 8, name: 'Academic Writing', description: 'Formatting essays, IEEE citation style, and technical report writing', category_id: 4 },
    { skill_id: 9, name: 'Video Editing', description: 'Timeline cuts, audio syncing, color correction in DaVinci/Premiere', category_id: 6 },
    { skill_id: 10, name: 'Public Speaking', description: 'Presentation delivery, slide decks, and project pitches', category_id: 7 }
  ],
  student_skills: [
    { student_id: 2, skill_id: 1, proficiency_level: 'ADVANCED' },
    { student_id: 2, skill_id: 3, proficiency_level: 'INTERMEDIATE' },
    { student_id: 3, skill_id: 6, proficiency_level: 'ADVANCED' },
    { student_id: 3, skill_id: 7, proficiency_level: 'ADVANCED' },
    { student_id: 3, skill_id: 1, proficiency_level: 'INTERMEDIATE' },
    { student_id: 4, skill_id: 4, proficiency_level: 'ADVANCED' },
    { student_id: 4, skill_id: 5, proficiency_level: 'INTERMEDIATE' },
    { student_id: 4, skill_id: 2, proficiency_level: 'BEGINNER' }
  ],
  service_listings: [
    { listing_id: 1, provider_id: 2, skill_id: 1, category_id: 1, title: 'Python Programming & Debugging Help', description: 'I can help peers understand Python syntax, debug lab code, and explain data structures step-by-step.', availability: 'Mon & Wed evenings, 5-7 PM', price: 0.00, is_free: true, status: 'ACTIVE', created_at: new Date('2026-09-10T10:00:00Z'), updated_at: new Date('2026-09-10T10:00:00Z') },
    { listing_id: 2, provider_id: 2, skill_id: 3, category_id: 1, title: 'Android Studio & Project Setup Assistance', description: 'Need help getting your Android emulator running or configuring Gradle? Happy to troubleshoot campus laptop setups.', availability: 'Weekends by appointment', price: 0.00, is_free: true, status: 'ACTIVE', created_at: new Date('2026-09-11T11:00:00Z'), updated_at: new Date('2026-09-11T11:00:00Z') },
    { listing_id: 3, provider_id: 3, skill_id: 6, category_id: 3, title: 'Calculus & Linear Algebra Exam Preparation', description: 'One-on-one review sessions covering integration techniques, matrix determinants, and problem sets.', availability: 'Tuesday & Thursday 4-6 PM', price: 0.00, is_free: true, status: 'ACTIVE', created_at: new Date('2026-09-12T12:00:00Z'), updated_at: new Date('2026-09-12T12:00:00Z') },
    { listing_id: 4, provider_id: 4, skill_id: 4, category_id: 2, title: 'Figma UI/UX & Wireframing Walkthrough', description: 'Learn how to construct clean layouts in Figma with consistent auto-layout, spacing rules, and components.', availability: 'Friday afternoons', price: 0.00, is_free: true, status: 'ACTIVE', created_at: new Date('2026-09-13T13:00:00Z'), updated_at: new Date('2026-09-13T13:00:00Z') },
    { listing_id: 5, provider_id: 4, skill_id: 5, category_id: 2, title: 'Club Poster & Visual Asset Design Advice', description: 'Feedback on student club flyers, social graphics, typography contrast, and print export.', availability: 'Flexible schedule', price: 0.00, is_free: true, status: 'ACTIVE', created_at: new Date('2026-09-14T14:00:00Z'), updated_at: new Date('2026-09-14T14:00:00Z') }
  ],
  service_requests: [
    { request_id: 1, requester_id: 4, listing_id: 1, provider_id: 2, message: 'Hi Alex! I am working on a script to parse student survey CSVs and hitting key errors. Could we meet for 20 minutes in the library?', status: 'PENDING', created_at: new Date('2026-09-15T15:00:00Z'), updated_at: new Date('2026-09-15T15:00:00Z') },
    { request_id: 2, requester_id: 3, listing_id: 4, provider_id: 4, message: 'Hello Joel, I am preparing slides for an upcoming academic seminar and would appreciate your input on font sizes and layout clarity.', status: 'ACCEPTED', created_at: new Date('2026-09-16T16:00:00Z'), updated_at: new Date('2026-09-16T16:00:00Z') }
  ]
};

// Initialize MySQL pool if requested
if (!useMock && DB_CLIENT !== 'mock') {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    });
  } catch (err) {
    console.warn('[Database] Failed to initialize MySQL pool; falling back to mock store:', err.message);
    useMock = true;
  }
}

/**
 * Executes a SQL query against MySQL or the mock database store.
 * Maintains standard [rows, fields] mysql2 return signature.
 */
async function query(sql, params = []) {
  if (!useMock && pool) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      if (DB_CLIENT === 'auto' && (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR' || err.code === 'ENOTFOUND')) {
        console.warn(`[Database] MySQL unavailable (${err.code}). Falling back to high-fidelity mock store.`);
        useMock = true;
      } else {
        throw err;
      }
    }
  }

  // Mock SQL execution for portable offline testing/demoing
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT queries
  if (/^SELECT/i.test(normalizedSql)) {
    // Users by university_id
    if (/FROM users.*WHERE.*university_id\s*=\s*\?/i.test(normalizedSql)) {
      const match = mockDb.users.find(u => u.university_id.toUpperCase() === String(params[0]).toUpperCase());
      return [match ? [{ ...match }] : [], []];
    }

    // Users by user_id
    if (/FROM users.*WHERE.*user_id\s*=\s*\?/i.test(normalizedSql)) {
      const match = mockDb.users.find(u => u.user_id === Number(params[0]));
      return [match ? [{ ...match }] : [], []];
    }

    // All users (for admin listing)
    if (/FROM users/i.test(normalizedSql) && !/JOIN/i.test(normalizedSql)) {
      const rows = mockDb.users.map(u => {
        const { password_hash, ...safe } = u;
        return safe;
      });
      return [rows, []];
    }

    // Student profile with user
    if (/FROM student_profiles p.*JOIN users u/i.test(normalizedSql)) {
      const userId = Number(params[0]);
      const profile = mockDb.student_profiles.find(p => p.user_id === userId);
      const user = mockDb.users.find(u => u.user_id === userId);
      if (profile && user) {
        return [[{
          ...profile,
          university_id: user.university_id,
          verification_status: user.verification_status,
          role: user.role
        }], []];
      }
      return [[], []];
    }

    // Direct student profiles query
    if (/FROM student_profiles/i.test(normalizedSql) && !/JOIN/i.test(normalizedSql)) {
      if (/WHERE.*user_id\s*=\s*\?/i.test(normalizedSql)) {
        const match = mockDb.student_profiles.find(p => p.user_id === Number(params[0]));
        return [match ? [{ ...match }] : [], []];
      }
      return [[...mockDb.student_profiles], []];
    }

    // Categories
    if (/FROM categories/i.test(normalizedSql)) {
      return [[...mockDb.categories], []];
    }

    // Skills for a student
    if (/FROM skills s.*JOIN student_skills ss/i.test(normalizedSql)) {
      const studentId = Number(params[0]);
      const records = mockDb.student_skills
        .filter(ss => ss.student_id === studentId)
        .map(ss => {
          const skill = mockDb.skills.find(s => s.skill_id === ss.skill_id) || {};
          const cat = mockDb.categories.find(c => c.category_id === skill.category_id) || {};
          return {
            skill_id: skill.skill_id,
            name: skill.name,
            description: skill.description,
            category_id: skill.category_id,
            category_name: cat.name || null,
            proficiency_level: ss.proficiency_level
          };
        });
      return [records, []];
    }

    // All skills catalog
    if (/FROM skills/i.test(normalizedSql) && !/JOIN/i.test(normalizedSql)) {
      const records = mockDb.skills.map(s => {
        const cat = mockDb.categories.find(c => c.category_id === s.category_id) || {};
        return {
          ...s,
          category_name: cat.name || null
        };
      });
      return [records, []];
    }

    // Service listings - details by listing_id
    if (/FROM service_listings.*WHERE.*listing_id\s*=\s*\?/i.test(normalizedSql)) {
      const listingId = Number(params[0]);
      const l = mockDb.service_listings.find(x => x.listing_id === listingId);
      if (!l) return [[], []];
      const u = mockDb.users.find(x => x.user_id === l.provider_id) || {};
      const p = mockDb.student_profiles.find(x => x.user_id === l.provider_id) || {};
      const c = mockDb.categories.find(x => x.category_id === l.category_id) || {};
      const s = mockDb.skills.find(x => x.skill_id === l.skill_id) || {};
      return [[{
        ...l,
        university_id: u.university_id,
        provider_name: p.name || 'Anonymous',
        provider_department: p.department || '',
        provider_year: p.year || 1,
        category_name: c.name || '',
        skill_name: s.name || ''
      }], []];
    }

    // Service listings - by provider_id
    if (/FROM service_listings.*WHERE.*provider_id\s*=\s*\?/i.test(normalizedSql)) {
      const providerId = Number(params[0]);
      const rows = mockDb.service_listings
        .filter(l => l.provider_id === providerId)
        .map(l => {
          const u = mockDb.users.find(x => x.user_id === l.provider_id) || {};
          const p = mockDb.student_profiles.find(x => x.user_id === l.provider_id) || {};
          const c = mockDb.categories.find(x => x.category_id === l.category_id) || {};
          const s = mockDb.skills.find(x => x.skill_id === l.skill_id) || {};
          return {
            ...l,
            university_id: u.university_id,
            provider_name: p.name,
            category_name: c.name,
            skill_name: s.name
          };
        });
      return [rows, []];
    }

    // Service listings search or active listings
    if (/FROM service_listings/i.test(normalizedSql)) {
      let filtered = mockDb.service_listings;
      if (/status\s*=\s*['"]?ACTIVE['"]?/i.test(normalizedSql)) {
        filtered = filtered.filter(l => l.status === 'ACTIVE');
      }
      if (params.length > 0 && /LIKE/i.test(normalizedSql)) {
        const term = String(params[0]).replace(/%/g, '').toLowerCase();
        filtered = filtered.filter(l => {
          const s = mockDb.skills.find(x => x.skill_id === l.skill_id);
          const c = mockDb.categories.find(x => x.category_id === l.category_id);
          return l.title.toLowerCase().includes(term) ||
                 l.description.toLowerCase().includes(term) ||
                 (s && s.name.toLowerCase().includes(term)) ||
                 (c && c.name.toLowerCase().includes(term));
        });
      }
      const rows = filtered.map(l => {
        const u = mockDb.users.find(x => x.user_id === l.provider_id) || {};
        const p = mockDb.student_profiles.find(x => x.user_id === l.provider_id) || {};
        const c = mockDb.categories.find(x => x.category_id === l.category_id) || {};
        const s = mockDb.skills.find(x => x.skill_id === l.skill_id) || {};
        return {
          ...l,
          university_id: u.university_id,
          provider_name: p.name,
          provider_department: p.department,
          provider_year: p.year,
          category_name: c.name,
          skill_name: s.name
        };
      });
      return [rows, []];
    }

    // Service requests by request_id
    if (/FROM service_requests.*WHERE request_id\s*=\s*\?/i.test(normalizedSql)) {
      const match = mockDb.service_requests.find(r => r.request_id === Number(params[0]));
      return [match ? [{ ...match }] : [], []];
    }

    // Service requests for user (as requester or provider)
    if (/FROM service_requests r.*JOIN service_listings l/i.test(normalizedSql)) {
      const userId = Number(params[0]);
      const userRequests = mockDb.service_requests
        .filter(r => r.requester_id === userId || r.provider_id === userId)
        .map(r => {
          const l = mockDb.service_listings.find(x => x.listing_id === r.listing_id) || {};
          const provUser = mockDb.users.find(x => x.user_id === r.provider_id) || {};
          const provProf = mockDb.student_profiles.find(x => x.user_id === r.provider_id) || {};
          const reqUser = mockDb.users.find(x => x.user_id === r.requester_id) || {};
          const reqProf = mockDb.student_profiles.find(x => x.user_id === r.requester_id) || {};
          return {
            ...r,
            listing_title: l.title || 'Service Listing',
            provider_name: provProf.name || 'Provider',
            provider_university_id: provUser.university_id,
            requester_name: reqProf.name || 'Requester',
            requester_university_id: reqUser.university_id
          };
        });
      return [userRequests, []];
    }
  }

  // 2. INSERT queries
  if (/^INSERT INTO users/i.test(normalizedSql)) {
    const existing = mockDb.users.find(u => u.university_id.toUpperCase() === String(params[0]).toUpperCase());
    if (existing) {
      const err = new Error("ER_DUP_ENTRY: Duplicate entry for key 'university_id'");
      err.code = 'ER_DUP_ENTRY';
      throw err;
    }
    const newId = mockDb.users.length ? Math.max(...mockDb.users.map(u => u.user_id)) + 1 : 1;
    const newUser = {
      user_id: newId,
      university_id: params[0],
      password_hash: params[1],
      role: params[2] || 'student',
      verification_status: params[3] || 'PENDING',
      created_at: new Date()
    };
    mockDb.users.push(newUser);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (/^INSERT INTO student_profiles/i.test(normalizedSql)) {
    const newId = mockDb.student_profiles.length ? Math.max(...mockDb.student_profiles.map(p => p.profile_id)) + 1 : 1;
    const newProfile = {
      profile_id: newId,
      user_id: Number(params[0]),
      name: params[1],
      department: params[2] || null,
      year: params[3] ? Number(params[3]) : null,
      bio: params[4] || null,
      profile_image: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.student_profiles.push(newProfile);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (/^INSERT INTO student_skills/i.test(normalizedSql)) {
    const studentId = Number(params[0]);
    const skillId = Number(params[1]);
    const level = params[2] || 'INTERMEDIATE';
    const exists = mockDb.student_skills.some(ss => ss.student_id === studentId && ss.skill_id === skillId);
    if (!exists) {
      mockDb.student_skills.push({ student_id: studentId, skill_id: skillId, proficiency_level: level });
    }
    return [{ affectedRows: 1 }, []];
  }

  if (/^INSERT INTO service_listings/i.test(normalizedSql)) {
    const newId = mockDb.service_listings.length ? Math.max(...mockDb.service_listings.map(l => l.listing_id)) + 1 : 1;
    const newListing = {
      listing_id: newId,
      provider_id: Number(params[0]),
      skill_id: params[1] ? Number(params[1]) : null,
      category_id: Number(params[2]),
      title: params[3],
      description: params[4],
      availability: params[5] || 'Flexible schedule',
      price: params[6] ? Number(params[6]) : 0.00,
      is_free: params[7] === true || params[7] === 1,
      status: params[8] || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.service_listings.push(newListing);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (/^INSERT INTO service_requests/i.test(normalizedSql)) {
    const newId = mockDb.service_requests.length ? Math.max(...mockDb.service_requests.map(r => r.request_id)) + 1 : 1;
    const newRequest = {
      request_id: newId,
      requester_id: Number(params[0]),
      listing_id: Number(params[1]),
      provider_id: Number(params[2]),
      message: params[3],
      status: params[4] || 'PENDING',
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.service_requests.push(newRequest);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 3. UPDATE queries
  if (/^UPDATE users SET verification_status/i.test(normalizedSql)) {
    const newStatus = params[0];
    const userId = Number(params[1]);
    const user = mockDb.users.find(u => u.user_id === userId);
    if (user) {
      user.verification_status = newStatus;
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  if (/^UPDATE student_profiles/i.test(normalizedSql)) {
    const userId = Number(params[4]);
    const profile = mockDb.student_profiles.find(p => p.user_id === userId);
    if (profile) {
      profile.name = params[0];
      profile.department = params[1];
      profile.year = Number(params[2]);
      profile.bio = params[3];
      profile.updated_at = new Date();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  if (/^UPDATE service_listings/i.test(normalizedSql)) {
    const listingId = Number(params[6]);
    const providerId = Number(params[7]);
    const listing = mockDb.service_listings.find(l => l.listing_id === listingId && l.provider_id === providerId);
    if (listing) {
      listing.title = params[0];
      listing.description = params[1];
      listing.availability = params[2];
      listing.price = Number(params[3]);
      listing.is_free = params[4] === true || params[4] === 1;
      listing.status = params[5];
      listing.updated_at = new Date();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  if (/^UPDATE service_requests SET status/i.test(normalizedSql)) {
    let newStatus = 'PENDING';
    let requestId;
    if (params.length === 1) {
      const match = normalizedSql.match(/status\s*=\s*['"]?([A-Za-z]+)['"]?/i);
      newStatus = match ? match[1].toUpperCase() : 'PENDING';
      requestId = Number(params[0]);
    } else {
      newStatus = params[0];
      requestId = Number(params[1]);
    }
    const request = mockDb.service_requests.find(r => r.request_id === requestId);
    if (request) {
      request.status = newStatus;
      request.updated_at = new Date();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 4. DELETE queries
  if (/^DELETE FROM student_skills/i.test(normalizedSql)) {
    const studentId = Number(params[0]);
    const skillId = Number(params[1]);
    const idx = mockDb.student_skills.findIndex(ss => ss.student_id === studentId && ss.skill_id === skillId);
    if (idx !== -1) {
      mockDb.student_skills.splice(idx, 1);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  if (/^DELETE FROM service_listings/i.test(normalizedSql)) {
    const listingId = Number(params[0]);
    const providerId = Number(params[1]);
    const idx = mockDb.service_listings.findIndex(l => l.listing_id === listingId && l.provider_id === providerId);
    if (idx !== -1) {
      mockDb.service_listings.splice(idx, 1);
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  return [[], []];
}

async function testConnection() {
  if (useMock) {
    return { ok: true, mode: 'mock' };
  }
  if (pool) {
    try {
      await pool.query('SELECT 1 as connected');
      return { ok: true, mode: 'mysql' };
    } catch (err) {
      useMock = true;
      return { ok: true, mode: 'mock', fallbackReason: err.message };
    }
  }
  return { ok: true, mode: 'mock' };
}

module.exports = {
  query,
  pool,
  testConnection,
  mockDb
};
