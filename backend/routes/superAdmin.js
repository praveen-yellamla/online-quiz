const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

router.use(auth(['super_admin']));

router.get('/stats', superAdminController.getGlobalStats);
router.get('/admins', superAdminController.getAllAdmins);
router.post('/admin', superAdminController.createAdminStandalone);
router.get('/admin/:id', superAdminController.getAdminDetails);
router.patch('/admin/:id/status', superAdminController.toggleUserStatus);
router.get('/students', superAdminController.getStudentsDetailed);
router.get('/exams', superAdminController.getExamsDetailed);
router.get('/exam/:id/analytics', superAdminController.getExamAnalytics);
router.get('/logs', superAdminController.getActivityLogs);

router.get('/settings', superAdminController.getSettings);
router.patch('/settings', superAdminController.updateSettings);
router.delete('/logs', superAdminController.purgeAuditLogs);

module.exports = router;
