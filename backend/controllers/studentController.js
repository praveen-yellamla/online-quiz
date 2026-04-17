const db = require('../database/db');
const vm = require('vm');

exports.getAvailableExams = async (req, res) => {
  try {
    const exams = await db.prepare(`
      SELECT e.*, 
      (SELECT COUNT(*) FROM attempts a WHERE a.exam_id = e.id AND a.student_id = ? AND a.submitted_at IS NOT NULL) as attempt_count,
      (SELECT id FROM reattempt_permissions rp WHERE rp.exam_id = e.id AND rp.user_id = ?) as has_permission
      FROM exams e 
      WHERE e.status = 'published' AND e.language = (SELECT language FROM users WHERE id = ?)
    `).all(req.user.id, req.user.id, req.user.id);

    res.json({ success: true, exams });
  } catch (err) {
    console.error('getAvailableExams error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.startExam = async (req, res) => {
  const studentId = req.user.id;
  const { examId } = req.body;

  try {
    const exam = await db.prepare('SELECT status, start_time, end_time, duration FROM exams WHERE id = ?').get(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Assessment cluster not found.' });

    if (exam.status !== 'published') {
      return res.status(403).json({ success: false, message: 'This assessment is currently in DRAFT mode and not accessible.' });
    }

    // --- High-Precision UTC Time Synchronization & Debugging ---
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    console.log(`[TIME_CHECK] Exam ID: ${examId} | User: ${studentId}`);
    console.log(`[TIME_CHECK] Server Now  (UTC): ${now.toISOString()}`);
    console.log(`[TIME_CHECK] Exam Start (UTC): ${startTime.toISOString()}`);
    console.log(`[TIME_CHECK] Exam End   (UTC): ${endTime.toISOString()}`);

    // 1. Check if exam has started (With 5-minute SAFETY BUFFER for sync drifts)
    const fiveMinBufferMs = 5 * 60 * 1000;
    if (now.getTime() < (startTime.getTime() - fiveMinBufferMs)) {
      return res.status(403).json({ 
        success: false, 
        message: `PROTOCOL_INITIALIZATION_FAILURE: Assessment deployment scheduled for ${startTime.toUTCString()} (UTC). Current server time is ${now.toUTCString()}.` 
      });
    }

    // 2. Check if total exam window has expired
    if (now.getTime() > endTime.getTime()) {
      return res.status(403).json({ success: false, message: 'SESSION_EXPIRY: The assessment availability window has closed.' });
    }

    // 3. 10-Minute Entry Window Protocol (Only for NEW attempts)
    const existingAttempt = await db.prepare('SELECT * FROM attempts WHERE exam_id = ? AND student_id = ?').get(examId, studentId);
    
    if (!existingAttempt) {
      const graceTimeMs = startTime.getTime() + (10 * 60 * 1000); 
      if (now.getTime() > graceTimeMs) {
        return res.status(403).json({ 
          success: false, 
          message: 'ENTRY_WINDOW_CLOSED: New candidate recruitment for this assessment closed at T+10 minutes.' 
        });
      }
    } else if (existingAttempt.submitted_at) {
      // Handle re-attempt permissions
      const permission = await db.prepare('SELECT * FROM reattempt_permissions WHERE exam_id = ? AND user_id = ?').get(examId, studentId);
      if (!permission) {
        return res.status(403).json({ success: false, message: 'PROTOCOL_VIOLATION: Multiple submission attempts detected for current credentials.' });
      }
      // If permission exists, we will delete it and create a fresh attempt (or repurpose old)
      await db.prepare('DELETE FROM reattempt_permissions WHERE id = ?').run(permission.id);
    }

    // If attempt exists but not submitted, it's a resume; Otherwise, create new.
    let attemptId;
    if (existingAttempt && !existingAttempt.submitted_at) {
      attemptId = existingAttempt.id;
    } else {
      const result = await db.prepare(
        'INSERT INTO attempts (student_id, exam_id, start_time) VALUES (?, ?, ?)'
      ).run(studentId, examId, now.toISOString());
      attemptId = Number(result.lastInsertRowid);
    }

    res.status(201).json({ 
      success: true, 
      attemptId, 
      duration: exam.duration,
      serverTime: now.toISOString(),
      endTime: endTime.toISOString() 
    });
  } catch (err) {
    console.error('startExam error:', err);
    res.status(500).json({ success: false, message: 'Infrastructure failure: Could not initialize secure session.' });
  }
};

exports.submitExam = async (req, res) => {
  const { attemptId, answers, violationCount, forceTermination, timeTakenSeconds } = req.body;
  try {
    const attempt = await db.prepare(`
      SELECT a.*, e.duration 
      FROM attempts a 
      JOIN exams e ON a.exam_id = e.id 
      WHERE a.id = ?
    `).get(attemptId);

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.submitted_at) return res.json({ success: true, alreadySubmitted: true, score: attempt.score });

    const questions = await db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(attempt.exam_id);
    let totalScore = 0;
    let maxPossible = 0;

    questions.forEach(q => {
      maxPossible += (q.points || 5);
      const studentAnsInput = (answers || []).find(a => a.question_id === q.id)?.answer || '';
      
      const correct = String(q.correct_answer).toLowerCase().trim();
      const provided = String(studentAnsInput).toLowerCase().trim();

      if (q.type.toUpperCase() === 'MCQ' || q.type.toUpperCase() === 'SHORT') {
        if (provided === correct) totalScore += (q.points || 5);
      } 
      else if (q.type.toUpperCase() === 'CODE') {
        // --- SECURE CODING SANDBOX EVALUATION ---
        try {
          let output = '';
          const context = { 
            console: { log: (...args) => { output += args.join(' ') + '\n'; } } 
          };
          const script = new vm.Script(studentAnsInput);
          script.runInNewContext(context, { timeout: 10000 }); // 10s Execution Limit
          
          if (output.trim().toLowerCase() === correct) {
            totalScore += (q.points || 5);
          }
        } catch (sandboxErr) {
          console.error('Sandbox Execution Violation:', sandboxErr.message);
        }
      }
    });

    const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
    const now = new Date();
    const submittedAt = now.toISOString();

    const answersArray = Array.isArray(answers) ? answers : [];

    try {
      const dbTx = db.transaction(async () => {
        // DELETE existing answers for this attempt (cleanup if re-submitting)
        await db.prepare('DELETE FROM answers WHERE attempt_id = ?').run(attemptId);
        
        const insertAnswer = db.prepare('INSERT INTO answers (attempt_id, question_id, answer) VALUES (?, ?, ?)');
        for (const item of answersArray) {
          if (item.question_id) {
            await insertAnswer.run(attemptId, item.question_id, String(item.answer || ''));
          }
        }

        await db.prepare(`
          UPDATE attempts 
          SET score = ?, 
              time_taken = ?, 
              time_taken_seconds = ?,
              submitted_at = ?, 
              answers_json = ?,
              violation_count = ?,
              termination_reason = ?
          WHERE id = ?
        `).run(
          percentage, 
          Math.floor((timeTakenSeconds || 0) / 60), 
          timeTakenSeconds || 0,
          submittedAt, 
          JSON.stringify(answers),
          violationCount || 0,
          forceTermination ? 'CRITICAL_TAB_SWITCH_VIOLATION' : (attempt.termination_reason || null),
          attemptId
        );
      });
      
      await dbTx();
    } catch (txErr) {
      console.error('Submission Transaction Failure:', txErr);
      throw new Error('Database write failure: ' + txErr.message);
    }

    res.json({ success: true, score: percentage, totalScore, maxPossible });
  } catch (err) {
    console.error('submitExam critical error:', err);
    res.status(500).json({ success: false, message: 'Infrastructure failure: ' + err.message });
  }
};

exports.getPastAttempts = async (req, res) => {
  try {
    const attempts = await db.prepare(`
      SELECT a.*, e.title
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE a.student_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
    `).all(req.user.id);
    res.json({ success: true, attempts });
  } catch (err) {
    console.error('getPastAttempts error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getAttemptResults = async (req, res) => {
  const { attemptId } = req.params;
  try {
    const attempt = await db.prepare(`
      SELECT a.*, e.title, e.passing_score, u.name as student_name
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      JOIN users u ON a.student_id = u.id
      WHERE a.id = ?
    `).get(attemptId);

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const questions = await db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(attempt.exam_id);
    const answers = await db.prepare('SELECT * FROM answers WHERE attempt_id = ?').all(attemptId);

    // Calculate Analytics
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach(q => {
      const studentAns = answers.find(a => a.question_id === q.id)?.answer;
      if (!studentAns || studentAns.trim() === '') {
        skipped++;
      } else {
        const isCorrect = String(q.correct_answer).toLowerCase().trim() === String(studentAns).toLowerCase().trim();
        if (isCorrect) correct++;
        else wrong++;
      }
    });

    res.json({ 
      success: true, 
      attempt, 
      questions, 
      answers,
      stats: {
        total: questions.length,
        correct,
        wrong,
        skipped,
        attempted: correct + wrong
      }
    });
  } catch (err) {
    console.error('getAttemptResults error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getLeaderboard = async (req, res) => {
  const { examId } = req.params;
  try {
    const leaderboard = await db.prepare(`
      SELECT 
        u.name, 
        a.score, 
        a.time_taken,
        a.submitted_at
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.score DESC, a.time_taken_seconds ASC, a.submitted_at ASC
    `).all(examId);

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGlobalRankings = async (req, res) => {
  const language = req.user.language;
  try {
    // 1. Fetch Total Average Rankings for the Track
    const totalAvgRankings = await db.prepare(`
      SELECT 
        u.name,
        u.profile_image_url,
        COUNT(a.id) as total_exams,
        ROUND(AVG(a.score), 2) as avg_score
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
      GROUP BY u.id
      ORDER BY avg_score DESC, total_exams DESC
      LIMIT 20
    `).all(language);

    // 2. Fetch the Most Recent Exam Conducted in this Track
    const recentExam = await db.prepare(`
      SELECT id, title 
      FROM exams 
      WHERE language = ? AND status = 'published'
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(language);

    let recentExamRankings = [];
    if (recentExam) {
      recentExamRankings = await db.prepare(`
        SELECT 
          u.name,
          u.profile_image_url,
          a.score,
          a.time_taken,
          a.time_taken_seconds,
          a.submitted_at
        FROM attempts a
        JOIN users u ON a.student_id = u.id
        WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
        ORDER BY a.score DESC, a.time_taken_seconds ASC
        LIMIT 20
      `).all(recentExam.id);
    }

    res.json({ 
      success: true, 
      track: language,
      recentExam: recentExam || null,
      rankings: totalAvgRankings,
      recentRankings: recentExamRankings 
    });
  } catch (err) {
    console.error('getGlobalRankings error:', err);
    res.status(500).json({ success: false, message: 'Infrastructure failure: Could not synthesize localized leaderboards.' });
  }
};

exports.getExamQuestions = async (req, res) => {
  const { examId } = req.params;
  try {
    const attempt = await db.prepare(`
      SELECT * FROM attempts 
      WHERE exam_id = ? AND student_id = ? AND submitted_at IS NULL
    `).get(examId, req.user.id);

    if (!attempt) return res.status(403).json({ success: false, message: 'No active attempt session found.' });

    const questions = await db.prepare(`
      SELECT id, question, type, options, points 
      FROM questions 
      WHERE exam_id = ?
    `).all(examId);

    const savedAnswers = await db.prepare('SELECT question_id, answer FROM answers WHERE attempt_id = ?').all(attempt.id);
    const answersMap = {};
    savedAnswers.forEach(a => answersMap[a.question_id] = a.answer);

    res.json({ success: true, questions, answers: answersMap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Infrastructure failure during question delivery.' });
  }
};

exports.runCode = async (req, res) => {
  const { code, question_id } = req.body;
  try {
    const qRef = await db.prepare('SELECT correct_answer FROM questions WHERE id = ?').get(question_id);
    
    let output = '';
    const consoleProxy = {
      log: (...args) => { output += args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ') + '\n'; }
    };

    const startTime = process.hrtime();
    const sandbox = { console: consoleProxy };
    
    try {
      const script = new vm.Script(code);
      script.runInNewContext(sandbox, { timeout: 5000 }); // 5s Limit
    } catch (err) {
      output = `RUNTIME_ERROR: ${err.message}`;
    }
    
    const [diffS, diffNs] = process.hrtime(startTime);
    const executionTimeMs = Math.round((diffS * 1e3) + (diffNs / 1e6));

    let pass = false;
    if (qRef && output.trim().toLowerCase() === String(qRef.correct_answer).trim().toLowerCase()) {
      pass = true;
    }

    res.json({ 
      success: true, 
      output, 
      executionTime: executionTimeMs,
      pass
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sandbox hardware failure.' });
  }
};

exports.saveExamProgress = async (req, res) => {
  const { attemptId, answers } = req.body;
  try {
    const dbTx = db.transaction(async () => {
      await db.prepare('DELETE FROM answers WHERE attempt_id = ?').run(attemptId);
      const insert = db.prepare('INSERT INTO answers (attempt_id, question_id, answer) VALUES (?, ?, ?)');
      for (const item of answers) {
        await insert.run(attemptId, item.question_id, String(item.answer || ''));
      }
    });
    await dbTx();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentPerformance = async (req, res) => {
  const studentId = req.user.id;
  try {
    const stats = await db.prepare(`
      SELECT 
        COUNT(id) as total_exams,
        ROUND(AVG(score), 2) as avg_score,
        MAX(score) as best_score
      FROM attempts 
      WHERE student_id = ? AND submitted_at IS NOT NULL
    `).get(studentId);

    const history = await db.prepare(`
      SELECT a.*, e.title
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE a.student_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
    `).all(studentId);

    res.json({ success: true, stats, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Infrastructure failure: Could not retrieve performance telemetry.' });
  }
};

exports.sendAlert = async (req, res) => {
  const { type, examId } = req.body;
  const studentId = req.user.id;

  try {
    const stmt = db.prepare('INSERT INTO alerts (student_id, exam_id, type) VALUES (?, ?, ?)');
    const result = await stmt.run(studentId, examId, type);
    const alertId = Number(result.lastInsertRowid);

    const alertData = await db.prepare(`
      SELECT a.*, u.name as student_name, e.title as exam_title, e.language as exam_language
      FROM alerts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE a.id = ?
    `).get(alertId);

    // Broadcast to targeted rooms
    if (req.io) {
      const room = `track_${alertData.exam_language.toLowerCase()}`;
      req.io.to(room).to('global_oversight').emit('new_cheat_alert', alertData);
    }

    res.json({ success: true, alertId });
  } catch (err) {
    console.error('sendAlert error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
