const pool = require('../db/mysql_connect');

// Get all blog posts
exports.getAllPosts = async (req, res) => {
    try {
        const [posts] = await pool.query(`
            SELECT p.*, u.name as author_name, 
            (SELECT COUNT(*) FROM blog_comments WHERE post_id = p.id) as comment_count
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
        `);
        
        res.render('blog/index', {
            title: 'Blog',
            posts: posts
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazıları yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

// Get blog post by ID
exports.getPostById = async (req, res) => {
    try {
        const [posts] = await pool.query(`
            SELECT p.*, u.name as author_name
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        `, [req.params.id]);
        
        if (posts.length === 0) {
            req.flash('error_msg', 'Blog yazısı bulunamadı.');
            return res.redirect('/blog');
        }

        const post = posts[0];

        // Get comments for the post
        const [comments] = await pool.query(`
            SELECT c.*, u.name as commenter_name
            FROM blog_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
        `, [post.id]);

        res.render('blog/show', {
            title: post.title,
            post: post,
            comments: comments
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Blog yazısı detayları yüklenirken bir hata oluştu.');
        res.redirect('/blog');
    }
};

// Add comment to blog post
exports.addComment = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const postId = req.params.id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            req.flash('error_msg', 'Yorum içeriği boş olamaz.');
            return res.redirect(`/blog/${postId}`);
        }

        await pool.query(
            'INSERT INTO blog_comments (user_id, post_id, content) VALUES (?, ?, ?)',
            [userId, postId, content.trim()]
        );

        req.flash('success_msg', 'Yorumunuz başarıyla eklendi!');
        res.redirect(`/blog/${postId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Yorum eklenirken bir hata oluştu.');
        res.redirect(`/blog/${req.params.id}`);
    }
};

// Get user's comments
exports.getMyComments = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [comments] = await pool.query(`
            SELECT c.*, p.title as post_title
            FROM blog_comments c
            INNER JOIN blog_posts p ON c.post_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [userId]);

        res.render('blog/my-comments', {
            title: 'Yorumlarım',
            comments: comments
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Yorumlarınız yüklenirken bir hata oluştu.');
        res.redirect('/blog');
    }
}; 