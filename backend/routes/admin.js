const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(auth(['admin', 'super_admin']));

router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAdminAnalytics);
router.post('/exams', adminController.createExam);
router.get('/exams', adminController.getExams);
router.post('/exams/import', upload.single('file'), adminController.importQuestionsFromFile);
router.post('/exams/bulk-upload', upload.single('file'), adminController.uploadAndCreateExam);
router.get('/exams/template', adminController.downloadTemplate);
router.get('/exam/:id', adminController.getExamDetails);
router.put('/exams/:id', adminController.updateExam);
router.delete('/exams/:id', adminController.deleteExam);
router.patch('/exams/:id/publish', adminController.publishExam);
router.post('/questions', adminController.addQuestion);
router.post('/questions/upload', adminController.bulkUploadQuestions);
router.get('/exams/:id/analytics', adminController.getExamAnalytics);
router.get('/exams/:id/results/excel', adminController.downloadResultsExcel);
router.get('/student/:id', adminController.getStudentAnalytics);
router.get('/students', adminController.getStudents);
router.get('/attempts', adminController.getAllAttempts);
router.get('/exams/history', adminController.getExamsHistory);
router.get('/exams/:id/pdf', adminController.downloadExamPDF);
router.get('/alerts', adminController.getAlerts);
router.post('/students/grant-retake', adminController.grantRetakePermission);

module.exports = router;
