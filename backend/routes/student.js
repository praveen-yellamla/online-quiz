const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.use(auth(['student']));

router.get('/exams', studentController.getAvailableExams);
router.get('/exams/:examId/questions', studentController.getExamQuestions);
router.post('/exams/start', studentController.startExam);
router.post('/exams/submit', studentController.submitExam);
router.post('/exams/save', studentController.saveExamProgress);
router.post('/exams/run', studentController.runCode);
router.get('/exams/results/:attemptId', studentController.getAttemptResults);
router.get('/exams/:examId/leaderboard', studentController.getLeaderboard);
router.get('/attempts', studentController.getPastAttempts);
router.get('/performance', studentController.getStudentPerformance);
router.get('/rankings', studentController.getGlobalRankings);
router.post('/alerts', studentController.sendAlert);

module.exports = router;
