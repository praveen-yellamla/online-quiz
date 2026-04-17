const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const auth = require('../middleware/auth');

// Protected route: Only authenticated students/admins can run code
router.post('/run', auth(['student', 'admin', 'super_admin']), codeController.runCode);

module.exports = router;
