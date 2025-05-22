const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const jobController = require('../controllers/jobController');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes
router.post('/:id/apply', isAuthenticated, jobController.applyForJob);
router.get('/my-applications', isAuthenticated, jobController.getMyApplications);

module.exports = router; 