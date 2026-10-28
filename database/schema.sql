-- ============================================================
-- PEERLINK DATABASE SCHEMA
-- Target Engine: MySQL 8.0+ (InnoDB)
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ============================================================

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
-- Handles authentication credentials and verification state
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    university_id VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_university_id (university_id),
    INDEX idx_users_verification (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. STUDENT PROFILES TABLE
-- 1:1 relationship with users
DROP TABLE IF EXISTS student_profiles;
CREATE TABLE student_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT NULL,
    year INT DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES TABLE
-- Reusable taxonomy for skills, listings, and future marketplace modules
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SKILLS TABLE
-- Master catalog of peer-offered skills
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    category_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skills_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE SET NULL,
    INDEX idx_skills_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. STUDENT_SKILLS (M:N JUNCTION TABLE)
-- Connects students with multiple skills and proficiency
DROP TABLE IF EXISTS student_skills;
CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SERVICE LISTINGS TABLE
-- Offerings posted by verified providers
DROP TABLE IF EXISTS service_listings;
CREATE TABLE service_listings (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    skill_id INT DEFAULT NULL,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    availability VARCHAR(100) DEFAULT 'Flexible schedule',
    price DECIMAL(10,2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT TRUE,
    status ENUM('ACTIVE', 'PAUSED', 'CLOSED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listings_provider FOREIGN KEY (provider_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_listings_skill FOREIGN KEY (skill_id) REFERENCES skills (skill_id) ON DELETE SET NULL,
    CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT,
    INDEX idx_listings_provider (provider_id),
    INDEX idx_listings_category (category_id),
    INDEX idx_listings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SERVICE REQUESTS TABLE
-- Connects a student requester to a listing and its provider
DROP TABLE IF EXISTS service_requests;
CREATE TABLE service_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    listing_id INT NOT NULL,
    provider_id INT NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_requester FOREIGN KEY (requester_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_listing FOREIGN KEY (listing_id) REFERENCES service_listings (listing_id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_provider FOREIGN KEY (provider_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_requests_requester (requester_id),
    INDEX idx_requests_provider (provider_id),
    INDEX idx_requests_listing (listing_id),
    INDEX idx_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
