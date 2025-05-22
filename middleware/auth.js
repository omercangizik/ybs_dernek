// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }
    req.flash('error_msg', 'Bu işlem için giriş yapmanız gerekmektedir.');
    res.redirect('/login');
};

// Role-based middleware
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error_msg', 'Bu sayfaya erişmek için giriş yapmalısınız.');
            return res.redirect('/login');
        }

        if (roles.includes(req.session.user.role)) {
            return next();
        }

        req.flash('error_msg', 'Bu sayfaya erişim yetkiniz bulunmamaktadır.');
        res.redirect('/');
    };
};

module.exports = {
    isAuthenticated,
    hasRole
}; 