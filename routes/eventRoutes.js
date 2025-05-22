const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/:id/register', isAuthenticated, eventController.registerForEvent);
router.get('/my-events', isAuthenticated, eventController.getMyEvents);

module.exports = router; 