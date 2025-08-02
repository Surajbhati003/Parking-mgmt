function ensureAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/login');
}

function requireRole(role) {
    return function (req, res, next) {
        if (req.session.user && req.session.user.role === role) return next();
        res.status(403).send('Access Denied');
    };
}

module.exports = { ensureAuthenticated, requireRole };
