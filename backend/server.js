require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');

// Import test user seeding utility
const { seedAllTestUsers } = require('./utils/seedTestUser');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);

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
