require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');

// Import the Discord bot
const discordBot = require('./utils/discordBot');

// Import the event completion function
const { completeEvents } = require('./scripts/completeEvents');

// Import the cleanup function
const { cleanupOldRecords } = require('./scripts/cleanupOldRecords');

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:8081',
  'https://progress-web-hazel.vercel.app',
  'https://progressforbritain',
  'https://www.progressforbritain.org'
];

// Import routes
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const pendingUserRoutes = require('./routes/pendingUserRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const policyRoutes = require('./routes/policyRoutes');

// Import test user seeding utility
const { seedAllTestUsers } = require('./utils/seedTestUser');

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pending-users', pendingUserRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/policies', policyRoutes);

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

// Catch all handler: send 404 page for any non-API routes
app.get('*', (req, res) => {
  const notFoundPath = path.join(__dirname, 'public', '404.html');
  res.status(404).sendFile(notFoundPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Start Discord bot
  if (process.env.DISCORD_BOT_TOKEN) {
    try {
      await discordBot.login(process.env.DISCORD_BOT_TOKEN);
      console.log('Discord bot started successfully');
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  } else {
    console.warn('DISCORD_BOT_TOKEN not found in environment variables. Discord bot will not start.');
  }
  
  // Seed test users in development environment
  if (process.env.NODE_ENV === 'development' || process.env.SEED_TEST_USERS === 'true') {
    console.log('🌱 Seeding test users for development...');
    try {
      await seedAllTestUsers();
    } catch (error) {
      console.error('Failed to seed test users:', error);
    }
  }

  // Schedule daily event completion at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🕛 Running daily event completion...');
    try {
      await completeEvents();
    } catch (error) {
      console.error('Error in scheduled event completion:', error);
    }
  });

  // Schedule daily cleanup of old records at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running daily cleanup of old records...');
    try {
      await cleanupOldRecords();
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  });
});

module.exports = app;
