const db = require('../config/db.config');
const bcrypt = require('bcryptjs');

const AuthController = {
    login: (req, res) => {
        const { username, password } = req.body;
        db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
            if (err) return res.status(500).send('DB error');
            if (results.length === 0) return res.status(401).send('Invalid credentials');

            const user = results[0];
            if (!bcrypt.compareSync(password, user.password)) return res.status(401).send('Wrong password');

            req.session.user = { id: user.user_id, role: user.role };
            res.redirect(`/${user.role}`);
        });
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    }
};

module.exports = AuthController;
