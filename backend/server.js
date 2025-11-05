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
  'https://progressforbritain.org',
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

// Dynamic wrapper for public files with HTML, favicon, and branding
app.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', filename);
  const fs = require('fs');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  
  // Get file extension to determine type
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);
  
  // Create title based on filename
  const title = baseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  let content = '';
  let embedCode = '';
  
  if (ext === '.pdf') {
    embedCode = `<embed src="/public/${filename}" type="application/pdf" class="file-viewer">`;
    content = 'PDF Document';
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
    embedCode = `<div class="image-viewer"><img src="/public/${filename}" alt="${title}"></div>`;
    content = 'Image';
  } else if (['.txt', '.md'].includes(ext)) {
    // Read text content for preview
    try {
      const textContent = fs.readFileSync(filePath, 'utf8');
      embedCode = `<div class="text-content"><pre>${textContent}</pre></div>`;
      content = 'Text Document';
    } catch (e) {
      embedCode = `<div class="unsupported-file">
        <div class="icon">📄</div>
        <h3>Unable to Preview</h3>
        <p>This text file couldn't be loaded for preview.</p>
        <a href="/public/${filename}" download="${filename}" class="download-btn">📥 Download ${filename}</a>
      </div>`;
      content = 'Document';
    }
  } else {
    embedCode = `<div class="unsupported-file">
      <div class="icon">📁</div>
      <h3>Preview Not Available</h3>
      <p>This file type (${ext}) cannot be previewed in the browser, but you can download it using the button above.</p>
    </div>`;
    content = 'File';
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Progress UK</title>
    <meta name="description" content="${title} - ${content} from Progress UK">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/public/favicon.png">
    <link rel="shortcut icon" type="image/png" href="/public/favicon.png">
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="${title} - Progress UK">
    <meta property="og:description" content="${title} - ${content} from Progress UK">
    <meta property="og:image" content="/public/favicon.png">
    <meta property="og:type" content="article">
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            width: 100%;
            overflow-x: hidden;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #000;
            color: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        /* Exact Aurora Background from Frontend */
        .aurora-background {
            position: fixed;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background-image: 
                repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
                repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%);
            background-size: 300%, 200%;
            background-position: 50% 50%, 50% 50%;
            filter: blur(10px);
            mix-blend-mode: overlay;
            animation: aurora 15s infinite;
            mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
            -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%);
            z-index: 1;
            opacity: 0.3;
        }

        .aurora-background::after {
            content: "";
            position: absolute;
            inset: 0;
            background-image:
                repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%),
                repeating-linear-gradient(100deg, #012168 10%, #123995 15%, #2854b0 20%, #3a66c5 25%, #012168 30%);
            background-size: 200%, 100%;
            background-attachment: fixed;
            mix-blend-mode: difference;
        }

        @keyframes aurora {
            0%, 100% {
                background-position: 0% 50%, 0% 50%;
            }
            50% {
                background-position: 100% 100%, 100% 100%;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .aurora-background {
                animation: none !important;
            }
            .aurora-background::after {
                background-attachment: initial !important;
            }
        }

        /* Header */
        .header {
            position: relative;
            z-index: 3;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 2rem;
            flex-shrink: 0;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .title-section h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }

        .title-section p {
            color: #e0f2fe;
            font-size: 0.9rem;
        }

        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #B10024 0%, #660033 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(177, 0, 36, 0.4);
        }

        .download-btn:hover {
            background: linear-gradient(135deg, #660033 0%, #B10024 100%);
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(177, 0, 36, 0.5);
            border-color: rgba(255, 255, 255, 0.5);
        }

        /* Content Area - Full Height */
        .content-container {
            position: relative;
            z-index: 2;
            flex: 1;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 80px);
            margin: 0;
            background: transparent;
            overflow: hidden;
        }

        .file-viewer {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
            background: white;
            flex: 1;
        }

        .text-content {
            padding: 2rem;
            height: 100%;
            overflow: auto;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin: 1rem;
            border-radius: 16px;
            flex: 1;
        }

        .text-content pre {
            margin: 0;
            white-space: pre-wrap;
            font-family: 'Monaco', 'Consolas', 'SF Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
            color: #ffffff;
        }

        .image-viewer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 2rem;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin: 1rem;
            border-radius: 16px;
            flex: 1;
        }

        .image-viewer img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            object-fit: contain;
        }

        .unsupported-file {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            color: #e0f2fe;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin: 1rem;
            border-radius: 16px;
            flex: 1;
        }

        .unsupported-file .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.6;
        }

        .unsupported-file h3 {
            font-size: 1.5rem;
            color: #ffffff;
            margin-bottom: 1rem;
        }

        .unsupported-file p {
            font-size: 1rem;
            margin-bottom: 2rem;
            max-width: 400px;
            line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header {
                padding: 1rem;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }
            
            .title-section h1 {
                font-size: 1.25rem;
            }
            
            .content-container {
                height: calc(100vh - 120px);
            }
            
            .text-content,
            .image-viewer,
            .unsupported-file {
                margin: 0.5rem;
            }
            
            .download-btn {
                font-size: 0.8rem;
                padding: 0.5rem 1rem;
            }
        }

        @media (max-width: 480px) {
            .header-content {
                align-items: center;
                text-align: center;
            }
            
            .content-container {
                height: calc(100vh - 140px);
            }
        }
    </style>
</head>
<body>
    <div class="aurora-background"></div>
    
    <div class="header">
        <div class="header-content">
            <div class="title-section">
                <h1>${title}</h1>
                <p>Progress UK • ${content}</p>
            </div>
            <a href="/public/${filename}" download="${filename}" class="download-btn">
                📥 Download
            </a>
        </div>
    </div>

    <div class="content-container">
        ${embedCode}
    </div>
</body>
</html>`;
  
  res.send(html);
});

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
