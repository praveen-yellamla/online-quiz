const db = require('../database/db');

const maintenance = (req, res, next) => {
  const settings = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('maintenance_mode');
  
  if (settings && settings.value === 'true' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(503).json({
      success: false,
      message: 'System is currently under maintenance. Please try again later.'
    });
  }
  next();
};

module.exports = maintenance;
