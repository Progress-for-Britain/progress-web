const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  logVolunteerHours,
  generateUserICal
} = require('../controllers/eventController');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth');

// Public routes (for browsing events)
router.get('/', getAllEvents);
router.get('/ical/:userId', generateUserICal);
router.get('/:id', getEventById);

// Protected routes
// Event management allowed for ADMIN and EVENT_MANAGER
router.post('/', authenticateToken, requireRole(['ADMIN', 'EVENT_MANAGER']), createEvent);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'EVENT_MANAGER']), updateEvent);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'EVENT_MANAGER']), deleteEvent);
router.post('/:id/register', authenticateToken, registerForEvent);
router.delete('/:id/register', authenticateToken, cancelEventRegistration);
router.post('/volunteer-hours', authenticateToken, logVolunteerHours);

module.exports = router;
