const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const db = require('../db');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/blog')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
        cb(null, true);
    }
});

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT p.*, CONCAT(u.name, ' ', u.surname) as author_name 
            FROM blog_posts p 
            JOIN users u ON p.author_id = u.id 
            ORDER BY p.created_at DESC
        `);
        res.render('blog', { 
            posts,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazıları yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
});

// Get single blog post
router.get('/:id', async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT p.*, CONCAT(u.name, ' ', u.surname) as author_name 
            FROM blog_posts p 
            JOIN users u ON p.author_id = u.id 
            WHERE p.id = ?
        `, [req.params.id]);

        if (posts.length === 0) {
            req.flash('error_msg', 'Blog yazısı bulunamadı.');
            return res.redirect('/blog');
        }

        const [comments] = await db.query(`
            SELECT c.*, CONCAT(u.name, ' ', u.surname) as user_name 
            FROM blog_comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? 
            ORDER BY c.created_at DESC
        `, [req.params.id]);

        res.render('blog-post', { 
            post: posts[0],
            comments,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı yüklenirken bir hata oluştu.');
        res.redirect('/blog');
    }
});

// Get edit blog post form
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT * FROM blog_posts WHERE id = ? AND author_id = ?
        `, [req.params.id, req.session.user.id]);

        if (posts.length === 0) {
            req.flash('error_msg', 'Blog yazısı bulunamadı veya düzenleme yetkiniz yok.');
            return res.redirect('/blog');
        }

        res.render('blog-edit', { 
            post: posts[0],
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı yüklenirken bir hata oluştu.');
        res.redirect('/blog');
    }
});

// Update blog post
router.post('/:id/edit', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const postId = req.params.id;

        // Check if user is the author
        const [posts] = await db.query(
            'SELECT * FROM blog_posts WHERE id = ? AND author_id = ?',
            [postId, req.session.user.id]
        );

        if (posts.length === 0) {
            req.flash('error_msg', 'Blog yazısı bulunamadı veya düzenleme yetkiniz yok.');
            return res.redirect('/blog');
        }

        let image_url = posts[0].image_url;
        if (req.file) {
            image_url = `/images/blog/${req.file.filename}`;
        }

        await db.query(
            'UPDATE blog_posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
            [title, content, image_url, postId]
        );

        req.flash('success_msg', 'Blog yazısı başarıyla güncellendi.');
        res.redirect(`/blog/${postId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı güncellenirken bir hata oluştu.');
        res.redirect('/blog');
    }
});

// Delete blog post
router.post('/:id/delete', isAuthenticated, async (req, res) => {
    try {
        const postId = req.params.id;

        // Check if user is the author
        const [posts] = await db.query(
            'SELECT * FROM blog_posts WHERE id = ? AND author_id = ?',
            [postId, req.session.user.id]
        );

        if (posts.length === 0) {
            req.flash('error_msg', 'Blog yazısı bulunamadı veya silme yetkiniz yok.');
            return res.redirect('/blog');
        }

        // Delete comments first (due to foreign key constraint)
        await db.query('DELETE FROM blog_comments WHERE post_id = ?', [postId]);
        
        // Delete the post
        await db.query('DELETE FROM blog_posts WHERE id = ?', [postId]);

        req.flash('success_msg', 'Blog yazısı başarıyla silindi.');
        res.redirect('/blog');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı silinirken bir hata oluştu.');
        res.redirect('/blog');
    }
});

// Create new blog post
router.post('/create', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const image_url = req.file ? `/images/blog/${req.file.filename}` : null;

        if (!req.session.user || !req.session.user.id) {
            req.flash('error_msg', 'Oturum bilgileriniz geçersiz. Lütfen tekrar giriş yapın.');
            return res.redirect('/login');
        }

        await db.query(
            'INSERT INTO blog_posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)',
            [title, content, req.session.user.id, image_url]
        );

        req.flash('success_msg', 'Blog yazısı başarıyla yayınlandı.');
        res.redirect('/blog');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı yayınlanırken bir hata oluştu.');
        res.redirect('/blog');
    }
});

// Add comment to blog post
router.post('/:id/comment', isAuthenticated, async (req, res) => {
    try {
        const { content } = req.body;

        if (!req.session.user || !req.session.user.id) {
            req.flash('error_msg', 'Oturum bilgileriniz geçersiz. Lütfen tekrar giriş yapın.');
            return res.redirect('/login');
        }

        await db.query(
            'INSERT INTO blog_comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [req.params.id, req.session.user.id, content]
        );

        req.flash('success_msg', 'Yorumunuz başarıyla eklendi.');
        res.redirect(`/blog/${req.params.id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Yorum eklenirken bir hata oluştu.');
        res.redirect(`/blog/${req.params.id}`);
    }
});

module.exports = router; 