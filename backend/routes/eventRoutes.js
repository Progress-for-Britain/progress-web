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
  requireAdmin,
  requireRole
} = require('../middleware/auth');

// Public routes (for browsing events)
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.get('/ical/:userId', generateUserICal);

// Protected routes
router.post('/', authenticateToken, requireRole(['ADMIN', 'WRITER']), createEvent);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'WRITER']), updateEvent);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'WRITER']), deleteEvent);
router.post('/:id/register', authenticateToken, registerForEvent);
router.delete('/:id/register', authenticateToken, cancelEventRegistration);
router.post('/volunteer-hours', authenticateToken, logVolunteerHours);

module.exports = router;
