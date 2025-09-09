const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireRole } = require('../middleware/auth');
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

// Protected routes (admin or onboarding)

// Get all pending applications
router.get('/', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), getAllPendingApplications);

// Get application statistics
router.get('/stats', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), getApplicationStats);

// Get specific pending application
router.get('/:id', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), getPendingApplicationById);

// Approve pending application
router.post('/:id/approve', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), approveApplication);

// Reject pending application
router.post('/:id/reject', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), rejectApplication);

// Update volunteer details for pending user
router.put('/:id/volunteer-details', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), updatePendingUserVolunteerDetails);

// Update application status
router.put('/:id/status', authenticateToken, requireRole(['ADMIN', 'ONBOARDING']), updateApplicationStatus);

module.exports = router;
