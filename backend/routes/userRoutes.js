const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacySettings,
  updatePrivacySettings,
  getUserStats,
  getUserActivity,
  getUserUpcomingEvents,
  assignUserToEvent,
  unassignUserFromEvent,
  updateUserRole,
  getUserEventAssignments,
  getUserManagementStats
} = require('../controllers/userController');
const {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
  requireRole
} = require('../middleware/auth');

// Public routes
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes
// Allow onboarding team to view user list (read-only)
router.get('/', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), getAllUsers);
router.get('/:id', authenticateToken, requireOwnerOrAdmin, getUserById);
router.put('/:id', authenticateToken, requireOwnerOrAdmin, updateUser);
router.delete('/:id', authenticateToken, requireOwnerOrAdmin, deleteUser);

// Notification preferences routes
router.get('/:id/notifications', authenticateToken, requireOwnerOrAdmin, getNotificationPreferences);
router.put('/:id/notifications', authenticateToken, requireOwnerOrAdmin, updateNotificationPreferences);

// Privacy settings routes
router.get('/:id/privacy', authenticateToken, requireOwnerOrAdmin, getPrivacySettings);
router.put('/:id/privacy', authenticateToken, requireOwnerOrAdmin, updatePrivacySettings);

// Account dashboard routes
router.get('/me/stats', authenticateToken, getUserStats);
router.get('/me/activity', authenticateToken, getUserActivity);
router.get('/me/upcoming-events', authenticateToken, getUserUpcomingEvents);

// Admin user management routes
router.get('/management/stats', authenticateToken, requireAdmin, getUserManagementStats);
router.get('/:id/events', authenticateToken, requireAdmin, getUserEventAssignments);
router.put('/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.post('/assign-event', authenticateToken, requireAdmin, assignUserToEvent);
router.post('/unassign-event', authenticateToken, requireAdmin, unassignUserFromEvent);

module.exports = router;
