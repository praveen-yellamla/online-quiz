const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. ${roles.join(' or ')} role required.` 
        });
      }

      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Token is not valid' });
    }
  };
};

module.exports = auth;
