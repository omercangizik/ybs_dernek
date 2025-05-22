const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const contactController = require('../controllers/contactController');

// Public routes
router.get('/', contactController.getContactForm);
router.post('/', contactController.submitContactForm);

// Protected routes
router.get('/my-messages', isAuthenticated, contactController.getMyMessages);

module.exports = router; 