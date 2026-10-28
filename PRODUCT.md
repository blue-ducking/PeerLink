# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Node.js, Express.js, MySQL (mysql2 pool), HTML5, CSS3, Vanilla JavaScript (per university capstone specifications).

## Users
University students within a closed campus who need help or can offer skills and services to peers.

## Product Purpose
Closed-campus peer-to-peer platform connecting verified university students with other students who can provide skills, tutoring, help, and services.

## Positioning
Campus-exclusive, verified peer-to-peer assistance network anchored to verified student identities and real academic/peer relationships.

## Operating Context
Campus university environment; desktop, laptop, tablet, and mobile browsers.

## Capabilities and Constraints
Core prototype scope: Student registration (University ID, password), password hashing (bcrypt), verification workflow (PENDING/VERIFIED/REJECTED), authentication session, user profile, skills catalog & student-skill junction, service listings, search foundation, service requests (PENDING/ACCEPTED/REJECTED/CANCELLED/COMPLETED), AI assistant placeholder.
Constraints: No external university OAuth; no payments; no real-time WebSocket chat; relational MySQL schema is source of truth.

## Brand Commitments
Name: PeerLink
Tagline: "Your campus. Your people. Your resources."
Aesthetic: Typography-first editorial/clean GitHub & Mona Sans inspired design language; restrained palette, spacious layouts, subtle borders, no nested boxy cards.

## Evidence on Hand
context_peerlink.txt containing complete technical, architectural, and visual requirements.

## Product Principles
1. Clean foundational architecture for team extension (6-member capstone team).
2. Security by default (bcrypt, parameterized SQL, server-side authorization checks).
3. Usability and hierarchy over decorative noise (typography-first, clear actions).
4. SQL database as source of truth.

## Accessibility & Inclusion
Semantic HTML5, WCAG AA contrast (>=4.5:1 text, >=3:1 large), keyboard-accessible forms, visible focus indicators, labeled inputs.
