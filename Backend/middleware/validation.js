exports.validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role || !req.body.phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};
