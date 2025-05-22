const pool = require('../db/mysql_connect');

// Get contact form
exports.getContactForm = (req, res) => {
    res.render('contact/index', {
        title: 'İletişim'
    });
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            req.flash('error_msg', 'Lütfen tüm alanları doldurun.');
            return res.redirect('/contact');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash('error_msg', 'Lütfen geçerli bir e-posta adresi girin.');
            return res.redirect('/contact');
        }

        // Insert message into database
        await pool.query(
            'INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, subject, message]
        );

        req.flash('success_msg', 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.');
        res.redirect('/contact');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        res.redirect('/contact');
    }
};

// Get user's messages
exports.getMyMessages = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [messages] = await pool.query(
            'SELECT * FROM contact_messages WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.render('contact/my-messages', {
            title: 'Mesajlarım',
            messages: messages
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Mesajlarınız yüklenirken bir hata oluştu.');
        res.redirect('/contact');
    }
}; 