const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const userController = require('../controllers/userController');
const bcrypt = require('bcrypt');
const db = require('../db');

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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user from database
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            req.flash('error_msg', 'E-posta adresi bulunamadı.');
            return res.redirect('/login');
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Geçersiz şifre.');
            return res.redirect('/login');
        }

        // Set user session
        req.session.user = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email
        };

        req.flash('success_msg', 'Başarıyla giriş yaptınız.');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Giriş yapılırken bir hata oluştu.');
        res.redirect('/login');
    }
});
router.get('/logout', userController.logout);

// Profile routes
router.get('/profile', isAuthenticated, userController.getProfile);
router.post('/profile/update', isAuthenticated, userController.updateProfile);
router.post('/profile/upload-image', isAuthenticated, upload.single('profile_image'), userController.uploadProfileImage);

module.exports = router; 