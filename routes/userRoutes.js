const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Home page route
router.get('/', (req, res) => {
    res.render('index');
});

// Donation routes
router.get('/donate', isAuthenticated, userController.getDonate);
router.post('/donate', isAuthenticated, userController.postDonate);
router.get('/donate/receipt/:id', isAuthenticated, userController.getDonationReceipt);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
});

// Authentication routes
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);

// Profile routes
router.get('/profile', isAuthenticated, userController.getProfile);
router.post('/profile/update', isAuthenticated, userController.updateProfile);
router.post('/profile/upload-image', isAuthenticated, upload.single('profile_image'), userController.uploadProfileImage);

module.exports = router; 