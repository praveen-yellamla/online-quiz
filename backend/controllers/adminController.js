const db = require('../database/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const XLSX = require('xlsx');

// --- DASHBOARD ANALYTICS ---

exports.downloadResultsExcel = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await db.prepare('SELECT title FROM exams WHERE id = ?').get(id);
    const attempts = await db.prepare(`
      SELECT u.name, u.email, a.score, a.submitted_at, a.violation_count
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.score DESC
    `).all(id);

    const data = attempts.map(a => ({
      'Candidate Name': a.name,
      'Email': a.email,
      'Score (%)': a.score,
      'Violations': a.violation_count,
      'Submission Date': new Date(a.submitted_at).toLocaleString()
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-disposition', `attachment; filename=Results_${exam.title.replace(/\s+/g, '_')}.xlsx`);
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Infrastructure failure: Could not generate data cluster.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    // 1. Data Isolation: Force language to admin's assigned track
    const language = (req.user.role === 'super_admin') ? (req.query.language || 'java') : req.user.language;
    
    // 1. Total Enrolled Students in this track
    const totalStudents = (await db.prepare(`
      SELECT COUNT(*) as count FROM enrollments WHERE language = ?
    `).get(language))?.count || 0;

    // 2. Total Exams in this track
    const totalExams = (await db.prepare(`
      SELECT COUNT(*) as count FROM exams WHERE language = ?
    `).get(language))?.count || 0;

    // 3. Total Attempts for exams in this track
    const totalAttempts = (await db.prepare(`
      SELECT COUNT(a.id) as count 
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
    `).get(language))?.count || 0;

    // 4. Global Accuracy (Avg Score) for this track
    const avgScore = (await db.prepare(`
      SELECT AVG(a.score) as avg 
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
    `).get(language))?.avg || 0;

    // 5. Performance Timeline (Last 7 days)
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAvg = (await db.prepare(`
        SELECT AVG(a.score) as avg 
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE e.language = ? AND a.submitted_at LIKE ?
      `).get(language, `${dateStr}%`))?.avg || 0;
      
      timeline.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: Math.round(dayAvg)
      });
    }

    // 6. Upcoming Exams (Next 30 days)
    const upcomingExams = await db.prepare(`
      SELECT title, start_time, duration 
      FROM exams 
      WHERE language = ? AND start_time > datetime('now') AND start_time < datetime('now', '+30 days')
      ORDER BY start_time ASC
    `).all(language);

    // 7. Recent Submissions
    const recentSubmissions = await db.prepare(`
      SELECT u.name as student_name, e.title as exam_title, a.score, a.submitted_at
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
      LIMIT 10
    `).all(language);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalExams,
        totalAttempts,
        accuracy: Math.round(avgScore),
        timeline,
        upcomingExams,
        recentSubmissions
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// --- STUDENT MANAGEMENT ---

exports.getStudents = async (req, res) => {
  const language = (req.user.role === 'super_admin') ? (req.query.language || 'java') : req.user.language;
  try {
    const students = await db.prepare(`
      SELECT 
        u.id, 
        u.id as student_id,
        u.name, 
        u.email, 
        u.status,
        e.language, 
        e.created_at as enrolled_at
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE u.role = 'student' AND e.language = ?
      ORDER BY u.name ASC
    `).all(language);

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- EXAM MANAGEMENT ---

exports.getExams = async (req, res) => {
  const language = (req.user.role === 'super_admin') ? (req.query.language || null) : req.user.language;
  try {
    let sql = `
      SELECT 
        e.*, 
        u.name as admin_name,
        COALESCE(e.duration, 60) as duration,
        COALESCE(e.passing_score, 50) as passing_score,
        e.start_time,
        e.end_time
      FROM exams e
      JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (language) {
      sql += ` AND e.language = ?`;
      params.push(language);
    }

    sql += ` ORDER BY e.created_at DESC`;

    const exams = await db.prepare(sql).all(...params);
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExam = async (req, res) => {
  const { title, language, duration, passing_score, start_time, end_time } = req.body;
  try {
    const result = await db.prepare(`
      INSERT INTO exams (title, language, created_by, duration, passing_score, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, 
      language, 
      req.user.id, 
      duration || 60, 
      passing_score || 50,
      start_time || null,
      end_time || null
    );

    res.status(201).json({ success: true, examId: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.publishExam = async (req, res) => {
  const { id } = req.params;
  try {
    await db.prepare("UPDATE exams SET status = 'published' WHERE id = ?").run(id);
    res.json({ success: true, message: 'Exam published successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkImportQuestions = async (req, res) => {
  const { examId, questions } = req.body;
  try {
    const insert = db.prepare(`
      INSERT INTO questions (exam_id, question, type, options, correct_answer, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(async () => {
      for (const q of questions) {
        await insert.run(
          examId, 
          q.question, 
          q.type || 'mcq', 
          q.type === 'mcq' ? JSON.stringify(q.options) : null, 
          q.correct_answer, 
          q.points || 5
        );
      }
    });
    await transaction();

    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'BULK_IMPORT', `Imported ${questions.length} questions to Exam ID ${examId}`);

    res.json({ success: true, message: `Successfully synchronized ${questions.length} questions.` });
  } catch (err) {
    console.error('bulkImportQuestions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExamDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await db.prepare(`
      SELECT e.*, u.name as creator_name
      FROM exams e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `).get(id);

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const questions = db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(id);
    const attempts = db.prepare(`
      SELECT a.*, u.name as student_name
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
    `).all(id);

    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(score) as avg_score,
        MAX(score) as top_score
      FROM attempts
      WHERE exam_id = ? AND submitted_at IS NOT NULL
    `).get(id);

    // --- Proficent Analytics: Score Distribution ---
    const distribution = [
      { range: '0-20', count: 0 }, { range: '21-40', count: 0 },
      { range: '41-60', count: 0 }, { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];
    attempts.forEach(a => {
      if (a.score <= 20) distribution[0].count++;
      else if (a.score <= 40) distribution[1].count++;
      else if (a.score <= 60) distribution[2].count++;
      else if (a.score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // --- Performance Mining: Identifying Trouble Questions ---
    // We count incorrect answers from the attempts table if available, or analyze answers_json
    const troubleQuestions = [];
    const qStats = {};

    attempts.forEach(a => {
      const studentAnswers = JSON.parse(a.answers_json || '[]');
      studentAnswers.forEach(ans => {
        if (!qStats[ans.question_id]) qStats[ans.question_id] = { total: 0, fail: 0 };
        qStats[ans.question_id].total++;
        
        // Match with question key
        const qRef = questions.find(q => q.id === ans.question_id);
        if (qRef && String(ans.answer).trim().toLowerCase() !== String(qRef.correct_answer).trim().toLowerCase()) {
          qStats[ans.question_id].fail++;
        }
      });
    });

    Object.keys(qStats).forEach(qId => {
       const qRef = questions.find(q => q.id === parseInt(qId));
       if (qRef) {
         const failRate = Math.round((qStats[qId].fail / qStats[qId].total) * 100);
         if (failRate > 30) { // Threshold for "Trouble"
           troubleQuestions.push({ question: qRef.question, failRate });
         }
       }
    });

    res.json({ 
      success: true, 
      exam, 
      questions: questions.map(q => ({ ...q, options: JSON.parse(q.options || '[]') })), 
      attempts,
      stats: {
        attempts: stats.total_attempts || 0,
        avg_score: Math.round(stats.avg_score || 0),
        top_score: stats.top_score || 0
      },
      scoreDistribution: distribution,
      troubleQuestions: troubleQuestions.sort((a,b) => b.failRate - a.failRate).slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, duration, passing_score, start_time, end_time } = req.body;
  try {
    const exam = await db.prepare('SELECT status FROM exams WHERE id = ?').get(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status === 'published') return res.status(403).json({ success: false, message: 'Published exams cannot be modified' });

    await db.prepare(`
      UPDATE exams 
      SET title = ?, duration = ?, passing_score = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `).run(title, duration, passing_score, start_time, end_time, id);

    res.json({ success: true, message: 'Exam updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await db.prepare('SELECT status FROM exams WHERE id = ?').get(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status === 'published') return res.status(403).json({ success: false, message: 'Published exams cannot be deleted' });

    await db.prepare('DELETE FROM exams WHERE id = ?').run(id);
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- QUESTION MANAGEMENT ---

exports.addQuestion = async (req, res) => {
  const { exam_id, type, question, options, correct_answer } = req.body;
  try {
    await db.prepare(`
      INSERT INTO questions (exam_id, type, question, options, correct_answer)
      VALUES (?, ?, ?, ?, ?)
    `).run(exam_id, type, question, JSON.stringify(options || []), correct_answer);

    res.json({ success: true, message: 'Question added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkUploadQuestions = async (req, res) => {
  const { exam_id, questions } = req.body;
  try {
    const insert = db.prepare(`
      INSERT INTO questions (exam_id, type, question, options, correct_answer, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(async (qs) => {
      for (const q of qs) {
        await insert.run(
          exam_id, 
          q.type || 'mcq', 
          q.question, 
          q.type === 'mcq' ? JSON.stringify(q.options || []) : null, 
          q.correct_answer,
          q.points || 5
        );
      }
    });

    await transaction(questions);
    res.json({ success: true, message: `${questions.length} questions uploaded successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ATTEMPTS OVERSIGHT ---

exports.getAllAttempts = async (req, res) => {
  const language = (req.user.role === 'super_admin') ? (req.query.language || 'java') : req.user.language;
  try {
    const attempts = await db.prepare(`
      SELECT 
        a.id, 
        u.name as student_name, 
        e.title as exam_title, 
        a.score, 
        a.submitted_at
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
    `).all(language);

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.downloadExamPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await db.prepare('SELECT e.*, u.name as creator_name FROM exams e JOIN users u ON e.created_by = u.id WHERE e.id = ?').get(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const questions = await db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(id);

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Exam_${exam.title.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Crestonix Global Solutions (CGS)', { align: 'center' });
    doc.moveDown();
    doc.fontSize(24).text(exam.title, { align: 'center', underline: true });
    doc.moveDown();

    // Stats
    doc.fontSize(12).text(`Track: ${exam.language.toUpperCase()}`);
    doc.text(`Duration: ${exam.duration} Minutes`);
    doc.text(`Passing Score: ${exam.passing_score}%`);
    doc.text(`Created By: ${exam.creator_name}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Questions
    questions.forEach((q, index) => {
      doc.fontSize(14).text(`${index + 1}. ${q.question}`, { bold: true });
      const options = JSON.parse(q.options || '[]');
      if (options.length > 0) {
        options.forEach((opt, i) => {
          doc.fontSize(12).text(`   ${String.fromCharCode(65 + i)}) ${opt}`);
        });
      } else {
        doc.fontSize(10).text('   [Descriptive Question]', { italic: true });
      }
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('downloadExamPDF error:', err);
    res.status(500).send('Error generating PDF');
  }
};
exports.getAdminAnalytics = async (req, res) => {
  const language = req.user.language;
  try {
    const stats = await db.prepare(`
      SELECT 
        AVG(ea.score) as avgScore,
        COUNT(DISTINCT ea.student_id) as totalStudents,
        COUNT(ea.id) as totalAttempts
      FROM attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE e.language = ? AND ea.submitted_at IS NOT NULL
    `).get(language);

    const leaderboard = await db.prepare(`
      SELECT u.id, u.name, AVG(a.score) as avg_score
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE e.language = ? AND a.submitted_at IS NOT NULL
      GROUP BY u.id
      ORDER BY avg_score DESC
      LIMIT 5
    `).all(language);

    res.json({
      success: true,
      analytics: {
        avgScore: Math.round(stats.avgScore || 0),
        attemptedStudents: stats.totalStudents || 0,
        completedAttempts: stats.totalAttempts || 0,
        leaderboard: leaderboard.map(l => ({ id: l.id, name: l.name, score: Math.round(l.avg_score) }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExamAnalytics = async (req, res) => {
  const { id } = req.params;
  try {
    const stats = await db.prepare(`
      SELECT 
        AVG(score) as avgScore,
        COUNT(*) as totalAttempts
      FROM attempts
      WHERE exam_id = ? AND submitted_at IS NOT NULL
    `).get(id);

    const topStudents = await db.prepare(`
      SELECT u.name, a.score
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.score DESC, a.submitted_at ASC
      LIMIT 5
    `).all(id);

    res.json({
      success: true,
      analytics: {
        avgScore: Math.round(stats.avgScore || 0),
        totalAttempts: stats.totalAttempts || 0,
        topStudents
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadTemplate = (req, res) => {
  const data = [
    { Question: 'What is 5+5?', Type: 'MCQ', OptionA: '10', OptionB: '15', OptionC: '20', OptionD: '25', CorrectAnswer: '10', Points: 5 },
    { Question: 'Capital of France?', Type: 'Short', CorrectAnswer: 'Paris', Points: 10 },
    { Question: 'Print Hello World in Java', Type: 'Code', CorrectAnswer: 'System.out.println("Hello World");', Points: 20 }
  ];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-disposition', 'attachment; filename=exam_template.xlsx');
  res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

exports.uploadAndCreateExam = async (req, res) => {
  const { title, language, duration, passing_score } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const validQuestions = [];
    const invalidRows = [];

    rows.forEach((row, index) => {
      const keys = Object.keys(row);
      // Normalized Row Data
      const findKey = (pattern) => keys.find(k => k.replace(/\s+/g, '').toLowerCase() === pattern.toLowerCase());
      
      const questionText = row[findKey('Question')] || row[findKey('QuestionText')];
      const type = (row[findKey('Type')] || 'MCQ').toUpperCase();
      const points = parseInt(row[findKey('Points')]) || 5;
      const correctAnswer = row[findKey('CorrectAnswer')] || row[findKey('Answer')];

      if (!questionText || !correctAnswer) {
         invalidRows.push({ index: index + 2, reason: 'Missing Question text or Correct Answer' });
         return;
      }

      const options = [
        row[findKey('OptionA')] || row[findKey('Option1')],
        row[findKey('OptionB')] || row[findKey('Option2')],
        row[findKey('OptionC')] || row[findKey('Option3')],
        row[findKey('OptionD')] || row[findKey('Option4')]
      ].filter(o => o !== undefined && o !== null);

      if (type === 'MCQ' && options.length < 2) {
         invalidRows.push({ index: index + 2, reason: 'MCQ requires at least 2 options' });
         return;
      }

      validQuestions.push({ 
        question: questionText, 
        type, 
        points, 
        correctAnswer: String(correctAnswer), 
        options 
      });
    });

    if (validQuestions.length === 0) {
       fs.unlinkSync(req.file.path);
       return res.status(400).json({ success: false, message: 'Registry failure: No valid data clusters discovered.', invalidRows });
    }

    // 1. Transactional Exam Creation
    const examId = await db.transaction(async () => {
      const examInsert = db.prepare(`
        INSERT INTO exams (title, language, created_by, duration, passing_score)
        VALUES (?, ?, ?, ?, ?)
      `);
      const examResult = await examInsert.run(title, language, req.user.id, parseInt(duration) || 60, parseInt(passing_score) || 50);

      const eId = Number(examResult.lastInsertRowid);
      const qInsert = db.prepare(`
        INSERT INTO questions (exam_id, question, type, options, correct_answer, points)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const q of validQuestions) {
        await qInsert.run(eId, q.question, q.type, JSON.stringify(q.options), q.correctAnswer, q.points);
      }

      return eId;
    })();

    fs.unlinkSync(req.file.path);
    res.json({ success: true, examId, message: `Exam cluster synchronized with ${validQuestions.length} questions.`, invalidRows });
  } catch (err) {
    console.error('uploadAndCreateExam error:', err);
    res.status(500).json({ success: false, message: 'Infrastructure failure: Cluster synchronization failed.' });
  }
};

exports.publishExam = (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('UPDATE exams SET status = "published" WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Assessment cluster not found.' });
    
    db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'EXAM_PUBLISHED', `Transitioned exam ID ${id} to active production status.`);

    res.json({ success: true, message: 'Assessment module is now LIVE for authorized candidates.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Infrastructure failure: Could not reach LIVE status.' });
  }
};

exports.importQuestionsFromFile = async (req, res) => {
  const { examId } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let questions = [];

    if (req.file.originalname.endsWith('.json')) {
      questions = JSON.parse(fileContent);
    } else {
      // Basic CSV Parser
      const lines = fileContent.trim().split('\n');
      questions = lines.slice(1).map(line => {
        const [q, a, b, c, d, correct, points] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        return {
          question: q,
          type: 'mcq',
          options: [a, b, c, d],
          correct_answer: correct,
          points: parseInt(points) || 5
        };
      });
    }

    const insert = db.prepare(`
      INSERT INTO questions (exam_id, question, type, options, correct_answer, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(async () => {
      for (const q of questions) {
        await insert.run(
          examId, 
          q.question, 
          q.type || 'mcq', 
          JSON.stringify(q.options || []), 
          q.correct_answer, 
          q.points || 5
        );
      }
    });
    await transaction();

    fs.unlinkSync(filePath); // Cleanup

    res.json({ success: true, message: `Successfully imported ${questions.length} questions` });
  } catch (err) {
    console.error('importQuestionsFromFile error:', err);
    res.status(500).json({ success: false, message: 'Import failed: ' + err.message });
  }
};
exports.getExamsHistory = async (req, res) => {
  const { role, id: userId } = req.user;
  const { track, search, sort } = req.query;

  try {
    let sql = `
      SELECT e.*, u.name as admin_name
      FROM exams e
      JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // 1. Role-Based Access Control (Enforced at Track Level)
    if (role === 'admin') {
      sql += ` AND LOWER(e.language) = ?`;
      params.push(req.user.language.toLowerCase());
    }

    // 2. Track Filtering
    if (track && track !== 'All') {
      sql += ` AND e.language = ?`;
      params.push(track.toLowerCase());
    }

    // 3. Keyword Search
    if (search) {
      sql += ` AND e.title LIKE ?`;
      params.push(`%${search}%`);
    }

    // 4. Sorting
    const direction = sort === 'oldest' ? 'ASC' : 'DESC';
    sql += ` ORDER BY e.created_at ${direction}`;

    const exams = await db.prepare(sql).all(...params);
    
    res.json({ 
      success: true, 
      exams: exams.map(e => ({
        id: e.id,
        title: e.title,
        track: e.language,
        created_by: e.admin_name,
        created_at: e.created_at
      }))
    });
  } catch (err) {
    console.error('getExamsHistory error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  const { id } = req.params;
  const adminTrack = req.user.language;
  const isAdmin = req.user.role === 'admin';

  try {
    // 1. Fetch Student Info (Using student_id)
    const studentQuery = isAdmin 
      ? 'SELECT * FROM users WHERE id = ? AND language = ?'
      : 'SELECT * FROM users WHERE id = ?';
    
    const student = await db.prepare(studentQuery).get(id, adminTrack);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in repository.' });
    }

    // 2. Fetch Performance Summary (Avg Score & Best Score)
    const summary = await db.prepare(`
      SELECT 
        ROUND(AVG(score), 2) as avg_score,
        MAX(score) as best_score,
        COUNT(*) as total_attempts
      FROM attempts 
      WHERE student_id = ? AND submitted_at IS NOT NULL
    `).get(id);

    // 3. Fetch Attempt History (JOIN exams)
    const history = await db.prepare(`
      SELECT 
        e.id as exam_id,
        e.title as exam_name, 
        a.score, 
        a.submitted_at as date,
        a.violation_count,
        a.termination_reason,
        a.time_taken_seconds
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE a.student_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY a.submitted_at DESC
    `).all(id);

    res.json({
      success: true,
      student,
      performance: {
        avgScore: summary.avg_score || 0,
        bestScore: summary.best_score || 0,
        totalAttempts: summary.total_attempts || 0
      },
      attempts: history
    });
  } catch (err) {
    console.error('getStudentAnalytics Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getAlerts = async (req, res) => {
  const language = req.user.language;
  const role = req.user.role;

  try {
    let sql = `
      SELECT a.*, u.name as student_name, e.title as exam_title
      FROM alerts a
      JOIN users u ON a.student_id = u.id
      JOIN exams e ON a.exam_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (role === 'admin') {
      sql += ` AND e.language = ?`;
      params.push(language);
    }

    sql += ` ORDER BY a.timestamp DESC LIMIT 100`;
    const alerts = await db.prepare(sql).all(...params);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadExamPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await db.prepare('SELECT * FROM exams WHERE id = ?').get(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    
    const questions = await db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(id);
    
    const doc = new PDFDocument();
    res.setHeader('Content-disposition', `attachment; filename=Exam_${id}.pdf`);
    res.type('application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text(`Assessment Module: ${exam.title}`, { align: 'center' });
    doc.fontSize(12).text(`Track: ${exam.language.toUpperCase()} | Duration: ${exam.duration}m | Passing: ${exam.passing_score}%`, { align: 'center' });
    doc.moveDown(2);

    questions.forEach((q, i) => {
      doc.fontSize(12).text(`${i + 1}. ${q.question}`, { bold: true });
      if (q.type.toUpperCase() === 'MCQ') {
        const options = JSON.parse(q.options || '[]');
        options.forEach((opt, oi) => {
          doc.fontSize(10).text(`   ${String.fromCharCode(65 + oi)}) ${opt}`);
        });
      } else {
        doc.fontSize(10).text(`   [Answer Format: ${q.type.toUpperCase()}]`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('downloadExamPDF error:', err);
    res.status(500).json({ success: false, message: 'PDF Generation Hardware Failure' });
  }
};

exports.grantRetakePermission = async (req, res) => {
  const { studentId, examId } = req.body;
  
  if (!studentId || !examId) {
    return res.status(400).json({ success: false, message: 'Registry failure: Student or Exam identifier missing.' });
  }

  try {
    const existing = await db.prepare('SELECT * FROM reattempt_permissions WHERE user_id = ? AND exam_id = ?').get(studentId, examId);
    if (!existing) {
      await db.prepare('INSERT INTO reattempt_permissions (user_id, exam_id) VALUES (?, ?)').run(studentId, examId);
    }
    
    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'RETAKE_GRANTED', `Granted re-attempt permission to Student ID ${studentId} for Exam ID ${examId}`);

    res.json({ success: true, message: 'Re-attempt protocol authorized for this candidate.' });
  } catch (err) {
    console.error('grantRetakePermission Error:', err);
    res.status(500).json({ success: false, message: 'Authorization hardware failure: Could not grant permission.' });
  }
};
