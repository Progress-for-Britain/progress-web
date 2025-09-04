require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const pendingUserRoutes = require('./routes/pendingUserRoutes');

// Import test user seeding utility
const { seedAllTestUsers } = require('./utils/seedTestUser');

// CORS Configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:8081', 'https://progress.tristans.club', 'https://progress-web-hazel.vercel.app'];
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200 // Changed from 204 to 200 for better compatibility
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add explicit handler for OPTIONS requests
app.options('*', cors(corsOptions));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pending-users', pendingUserRoutes);

// Serve static files from the /public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the frontend dist directory
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).json({ 
        error: 'Frontend build not found. Please build the frontend first.' 
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend served from: ${frontendDistPath}`);
  
  // Seed test users in development environment
  if (process.env.NODE_ENV === 'development' || process.env.SEED_TEST_USERS === 'true') {
    console.log('🌱 Seeding test users for development...');
    try {
      await seedAllTestUsers();
    } catch (error) {
      console.error('Failed to seed test users:', error);
    }
  }
});

module.exports = app;
