const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Route modules
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const skillsRoutes = require('./routes/skills.routes');
const listingsRoutes = require('./routes/listings.routes');
const searchRoutes = require('./routes/search.routes');
const requestsRoutes = require('./routes/requests.routes');
const aiRoutes = require('./routes/ai.routes');

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

// Static Assets: Serve client pages, CSS, and JS
const projectRoot = path.resolve(__dirname, '..');
app.use('/css', express.static(path.join(projectRoot, 'css')));
app.use('/js', express.static(path.join(projectRoot, 'js')));
app.use(express.static(path.join(projectRoot, 'client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/ai', aiRoutes);

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

// Root route redirect to landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'client', 'index.html'));
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
