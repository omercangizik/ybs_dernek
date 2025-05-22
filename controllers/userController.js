const bcrypt = require('bcryptjs');
const pool = require('../db/mysql_connect');
const { validationResult } = require('express-validator');

// Get register page
exports.getRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Kayıt Ol',
        user: null
    });
};

// Handle user registration
exports.postRegister = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/register', {
                title: 'Kayıt Ol',
                errors: errors.array(),
                user: null
            });
        }

        const { name, surname, email, password, role } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            req.flash('error_msg', 'Bu e-posta adresi zaten kayıtlı!');
            return res.redirect('/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await pool.query(
            'INSERT INTO users (name, surname, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, surname, email, hashedPassword, role]
        );

        req.flash('success_msg', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kayıt sırasında bir hata oluştu.');
        res.redirect('/register');
    }
};

// Get login page
exports.getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Giriş Yap',
        user: null
    });
};

// Handle user login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            req.flash('error_msg', 'E-posta veya şifre hatalı!');
            return res.redirect('/login');
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'E-posta veya şifre hatalı!');
            return res.redirect('/login');
        }

        // Set user session
        req.session.user = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image
        };

        req.flash('success_msg', 'Başarıyla giriş yaptınız!');
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Giriş sırasında bir hata oluştu.');
        res.redirect('/login');
    }
};

// Handle user logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.render('user/profile', {
            title: 'Profil',
            user: user[0]
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Profil bilgileri alınırken bir hata oluştu.');
        res.redirect('/');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, surname, email } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, surname = ?, email = ? WHERE id = ?',
            [name, surname, email, userId]
        );

        // Update session
        req.session.user.name = name;
        req.session.user.surname = surname;
        req.session.user.email = email;

        req.flash('success_msg', 'Profil bilgileriniz güncellendi!');
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Profil güncellenirken bir hata oluştu.');
        res.redirect('/profile');
    }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error_msg', 'Lütfen bir resim dosyası seçin!');
            return res.redirect('/profile');
        }

        const userId = req.session.user.id;
        const imagePath = `/uploads/profiles/${req.file.filename}`;

        await pool.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imagePath, userId]
        );

        // Update session
        req.session.user.profile_image = imagePath;

        req.flash('success_msg', 'Profil resminiz güncellendi!');
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Profil resmi yüklenirken bir hata oluştu.');
        res.redirect('/profile');
    }
}; 