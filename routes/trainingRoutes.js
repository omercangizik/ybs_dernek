const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const trainingController = require('../controllers/trainingController');

// Public routes
router.get('/', trainingController.getAllTrainings);
router.get('/:id', trainingController.getTrainingById);

// Protected routes
router.post('/:id/register', isAuthenticated, trainingController.registerForTraining);
router.get('/my-trainings', isAuthenticated, trainingController.getMyTrainings);

module.exports = router; 