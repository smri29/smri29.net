const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = String(req.cookies?.admin_session || '').trim();

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      next();
      return;
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
