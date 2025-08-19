const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  submitApplication,
  getAllPendingApplications,
  getPendingApplicationById,
  approveApplication,
  rejectApplication,
  validateAccessCode,
  getApplicationStats,
  updatePendingUserVolunteerDetails,
  updateApplicationStatus
} = require('../controllers/pendingUserController');

// Public routes

// Submit membership application (used by join page)
router.post('/apply', submitApplication);

// Validate access code (used during registration)
router.post('/validate-access-code', validateAccessCode);

// Protected routes (admin only)

// Get all pending applications
router.get('/', authenticateToken, requireAdmin, getAllPendingApplications);

// Get application statistics
router.get('/stats', authenticateToken, requireAdmin, getApplicationStats);

// Get specific pending application
router.get('/:id', authenticateToken, requireAdmin, getPendingApplicationById);

// Approve pending application
router.post('/:id/approve', authenticateToken, requireAdmin, approveApplication);

// Reject pending application
router.post('/:id/reject', authenticateToken, requireAdmin, rejectApplication);

// Update volunteer details for pending user
router.put('/:id/volunteer-details', authenticateToken, requireAdmin, updatePendingUserVolunteerDetails);

// Update application status
router.put('/:id/status', authenticateToken, requireAdmin, updateApplicationStatus);

module.exports = router;
