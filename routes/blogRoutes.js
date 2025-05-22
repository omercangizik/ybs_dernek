const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/:id', blogController.getPostById);

// Protected routes
router.post('/:id/comment', isAuthenticated, blogController.addComment);
router.get('/my-comments', isAuthenticated, blogController.getMyComments);

module.exports = router; 