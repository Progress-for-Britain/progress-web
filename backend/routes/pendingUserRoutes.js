const express = require('express');
const router = express.Router();
const {
  createPendingUser,
  getPendingUsers,
  approvePendingUser,
  denyPendingUser
} = require('../controllers/pendingUserController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public route for join requests
router.post('/', createPendingUser);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getPendingUsers);
router.post('/:id/approve', authenticateToken, requireAdmin, approvePendingUser);
router.post('/:id/deny', authenticateToken, requireAdmin, denyPendingUser);

module.exports = router;
