const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'peerlink_super_secure_jwt_dev_secret_key_2026';
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Core Route modules
const authRoutes = require('./routes/auth.routes');
const skillsRoutes = require('./routes/skills.routes');
const listingsRoutes = require('./routes/listings.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Project Root
const projectRoot = path.resolve(__dirname, '..');

// Root & Index session redirection (Server-side cookie check)
app.get(['/', '/index.html'], (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard.html');
    } catch {
      // Invalid/expired token cookie, serve index.html to allow client script resolution
    }
  }
  res.sendFile(path.join(projectRoot, 'client', 'index.html'));
});

// Redirect non-core feature pages to features.html
app.get([
  '/profile.html', '/profile',
  '/requests.html', '/requests',
  '/listings.html', '/listings',
  '/listing-details.html',
  '/skills.html', '/skills',
  '/search.html', '/search',
  '/ai.html', '/ai',
  '/feature.html', '/feature'
], (req, res) => {
  res.redirect('/features.html');
});

// Static Assets: Serve client pages, CSS, and JS
app.use('/css', express.static(path.join(projectRoot, 'css')));
app.use('/js', express.static(path.join(projectRoot, 'js')));
app.use(express.static(path.join(projectRoot, 'client')));

// API Routes (Core Foundation & Dashboard Support)
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/listings', listingsRoutes);

// Base API health check
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PeerLink Core Prototype API',
    database: dbStatus
  });
});

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup if run directly
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`  PEERLINK CORE PROTOTYPE SERVER RUNNING`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    const dbStatus = await testConnection();
    console.log(`  Database status: ${dbStatus.mode ? `Active (${dbStatus.mode})` : `Failed (${dbStatus.error})`}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
