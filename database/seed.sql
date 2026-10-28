-- ============================================================
-- PEERLINK DEMO SEED DATA
-- Default test password for all seeded accounts: Password123!
-- ============================================================

-- 1. CATEGORIES
INSERT INTO categories (category_id, name, description) VALUES
(1, 'Programming', 'Software engineering, scripts, web and app development'),
(2, 'Design', 'UI/UX design, graphic arts, illustration, and brand identity'),
(3, 'Academic', 'Subject tutoring, exam preparation, mathematics, and science'),
(4, 'Languages', 'Foreign language conversation, grammar, and ESL assistance'),
(5, 'Photography', 'Campus portraits, event photography, and camera fundamentals'),
(6, 'Video Editing', 'Premiere, DaVinci, CapCut, and short-form video production'),
(7, 'Business', 'Resume reviewing, case competitions, and marketing basics'),
(8, 'Music', 'Instrument lessons, audio production, and music theory'),
(9, 'Sports', 'Fitness coaching, sports rules, and athletic drills'),
(10, 'Other', 'General peer assistance and university life guidance');

-- 2. USERS
-- Password hash: $2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c. (Password123!)
INSERT INTO users (user_id, university_id, password_hash, role, verification_status) VALUES
(1, 'ADMIN001', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'admin', 'VERIFIED'),
(2, 'STU1001', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'student', 'VERIFIED'),
(3, 'STU1002', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'student', 'VERIFIED'),
(4, 'STU1003', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'student', 'VERIFIED'),
(5, 'STU1004', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'student', 'PENDING'),
(6, 'STU1005', '$2a$10$IQ.LLdJbLj/iyvXlk.ia7O9vbZH..x4K.zJjunYsNwXR5EvYRk6c.', 'student', 'REJECTED');

-- 3. STUDENT PROFILES
INSERT INTO student_profiles (profile_id, user_id, name, department, year, bio, profile_image) VALUES
(1, 1, 'System Administrator', 'Campus IT Services', 0, 'Platform administrator responsible for campus identity verification.', NULL),
(2, 2, 'Alex Kumar', 'Computer Science & Engineering', 2, 'Interested in Python, backend architecture, and building campus tools.', NULL),
(3, 3, 'Sarah Chen', 'Mathematics & Computing', 3, 'Peer tutor for calculus, discrete mathematics, and algorithms.', NULL),
(4, 4, 'Joel Miller', 'Digital Design & Media', 2, 'Focusing on Figma, visual hierarchy, and accessible web interfaces.', NULL),
(5, 5, 'Priya Sharma', 'Electronics & Communication', 1, 'First-year student learning C programming and microcontrollers.', NULL),
(6, 6, 'David Lee', 'Business Administration', 4, 'Senior helping with student CV polish and presentation prep.', NULL);

-- 4. SKILLS
INSERT INTO skills (skill_id, name, description, category_id) VALUES
(1, 'Python Programming', 'Core Python, scripting, libraries, and algorithm problem solving', 1),
(2, 'JavaScript', 'Vanilla JavaScript, DOM manipulation, and modern ES6+ concepts', 1),
(3, 'Android Development', 'Android Studio, Kotlin basics, UI layouts, and lifecycle', 1),
(4, 'UI/UX Design', 'Wireframing, user journeys, responsive spacing, and prototyping', 2),
(5, 'Graphic Design', 'Visual assets, color systems, and digital illustration in Photoshop/Illustrator', 2),
(6, 'Calculus & Linear Algebra', 'Single-variable calculus, vector spaces, and matrix transformations', 3),
(7, 'Discrete Mathematics', 'Proofs, graph theory, combinatorics, and boolean logic', 3),
(8, 'Academic Writing', 'Formatting essays, IEEE citation style, and technical report writing', 4),
(9, 'Video Editing', 'Timeline cuts, audio syncing, color correction in DaVinci/Premiere', 6),
(10, 'Public Speaking', 'Presentation delivery, slide decks, and project pitches', 7);

-- 5. STUDENT SKILLS (JUNCTION)
INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES
(2, 1, 'ADVANCED'),     -- Alex -> Python
(2, 3, 'INTERMEDIATE'), -- Alex -> Android
(3, 6, 'ADVANCED'),     -- Sarah -> Calculus
(3, 7, 'ADVANCED'),     -- Sarah -> Discrete Math
(3, 1, 'INTERMEDIATE'), -- Sarah -> Python
(4, 4, 'ADVANCED'),     -- Joel -> UI/UX Design
(4, 5, 'INTERMEDIATE'), -- Joel -> Graphic Design
(4, 2, 'BEGINNER');     -- Joel -> JavaScript

-- 6. SERVICE LISTINGS
INSERT INTO service_listings (listing_id, provider_id, skill_id, category_id, title, description, availability, price, is_free, status) VALUES
(1, 2, 1, 1, 'Python Programming & Debugging Help', 'I can help peers understand Python syntax, debug lab code, and explain data structures step-by-step.', 'Mon & Wed evenings, 5-7 PM', 0.00, TRUE, 'ACTIVE'),
(2, 2, 3, 1, 'Android Studio & Project Setup Assistance', 'Need help getting your Android emulator running or configuring Gradle? Happy to troubleshoot campus laptop setups.', 'Weekends by appointment', 0.00, TRUE, 'ACTIVE'),
(3, 3, 6, 3, 'Calculus & Linear Algebra Exam Preparation', 'One-on-one review sessions covering integration techniques, matrix determinants, and problem sets.', 'Tuesday & Thursday 4-6 PM', 0.00, TRUE, 'ACTIVE'),
(4, 4, 4, 2, 'Figma UI/UX & Wireframing Walkthrough', 'Learn how to construct clean layouts in Figma with consistent auto-layout, spacing rules, and components.', 'Friday afternoons', 0.00, TRUE, 'ACTIVE'),
(5, 4, 5, 2, 'Club Poster & Visual Asset Design Advice', 'Feedback on student club flyers, social graphics, typography contrast, and print export.', 'Flexible schedule', 0.00, TRUE, 'ACTIVE');

-- 7. SERVICE REQUESTS
INSERT INTO service_requests (request_id, requester_id, listing_id, provider_id, message, status) VALUES
(1, 4, 1, 2, 'Hi Alex! I am working on a script to parse student survey CSVs and hitting key errors. Could we meet for 20 minutes in the library?', 'PENDING'),
(2, 3, 4, 4, 'Hello Joel, I am preparing slides for an upcoming academic seminar and would appreciate your input on font sizes and layout clarity.', 'ACCEPTED');
