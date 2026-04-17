const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const dbPath = './../data/quiz.db';
const db = new Database(dbPath);

const seedRealData = async () => {
  console.log('--- STARTING ARCHITECTURAL SEEDING ---');

  // 1. Ensure Admins
  const hash = await bcrypt.hash('admin123', 10);
  const javaAdminId = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)').run('Java Lead', 'java@cgs.com', hash, 'admin', 'active').lastInsertRowid || 2;
  const pythonAdminId = db.prepare('INSERT OR IGNORE INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)').run('Python Lead', 'python@cgs.com', hash, 'admin', 'active').lastInsertRowid || 3;

  // 2. Create Exams
  const exams = [
    { title: 'Java Core Assessment V1', language: 'java', created_by: javaAdminId, duration: 45, passing_score: 60 },
    { title: 'Python Intermediate Quiz', language: 'python', created_by: pythonAdminId, duration: 30, passing_score: 50 },
    { title: 'Spring Boot Mastery', language: 'java', created_by: javaAdminId, duration: 60, passing_score: 70 }
  ];

  const examIds = {};
  for (const e of exams) {
    const result = db.prepare(`
      INSERT INTO exams (title, language, created_by, duration, passing_score, status) 
      VALUES (?, ?, ?, ?, ?, 'published')
    `).run(e.title, e.language, e.created_by, e.duration, e.passing_score);
    examIds[e.title] = result.lastInsertRowid;
  }

  // 3. Real Questions
  const questions = [
    {
      exam_id: examIds['Java Core Assessment V1'],
      question: 'Which of the following is NOT a Java access modifier?',
      type: 'mcq',
      options: ['public', 'private', 'protected', 'internal'],
      correct_answer: 'internal',
      points: 10
    },
    {
      exam_id: examIds['Java Core Assessment V1'],
      question: 'What is the default value of a boolean variable in Java?',
      type: 'mcq',
      options: ['true', 'false', 'null', '0'],
      correct_answer: 'false',
      points: 10
    },
    {
      exam_id: examIds['Java Core Assessment V1'],
      question: 'Which method is used to find the length of a string in Java?',
      type: 'mcq',
      options: ['size()', 'length()', 'getSize()', 'count()'],
      correct_answer: 'length()',
      points: 10
    },
    {
      exam_id: examIds['Python Intermediate Quiz'],
      question: 'Which of the following is used to define a block of code in Python?',
      type: 'mcq',
      options: ['Curly braces', 'Parentheses', 'Indentation', 'Square brackets'],
      correct_answer: 'Indentation',
      points: 10
    },
    {
      exam_id: examIds['Python Intermediate Quiz'],
      question: 'What does PEP 8 represent in Python?',
      type: 'mcq',
      options: ['A library', 'A style guide', 'A packaging tool', 'A testing framework'],
      correct_answer: 'A style guide',
      points: 10
    }
  ];

  const insertQ = db.prepare(`
    INSERT INTO questions (exam_id, question, type, options, correct_answer, points)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const q of questions) {
    insertQ.run(q.exam_id, q.question, q.type, JSON.stringify(q.options), q.correct_answer, q.points);
  }

  // 4. Sample Student Attempts
  const studentId = db.prepare("SELECT id FROM users WHERE email = 'student@cgs.com'").get()?.id || 35;
  
  db.prepare(`
    INSERT INTO attempts (student_id, exam_id, score, time_taken, submitted_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentId, examIds['Java Core Assessment V1'], 80, 25, new Date().toISOString());

  console.log('--- SEEDING COMPLETE: DB IS NOW PRODUCTION-READY ---');
};

seedRealData().catch(console.error);
