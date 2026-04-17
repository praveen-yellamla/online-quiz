const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Rebuilding system data from scratch...');

  // 1. Delete old database file to ensure fresh schema
  const dbPath = path.resolve(__dirname, '../data/quiz.db');
  if (fs.existsSync(dbPath)) {
    console.log('Deleting legacy database file...');
    try {
       fs.unlinkSync(dbPath);
    } catch (err) {
       console.log('File locked, clearing tables instead...');
    }
  }

  // 2. Initialize DB & Re-run schema (this creates tables automatically)
  const db = require('./database/db'); 

  console.log('Clearing old data (if file was locked)...');
  db.exec('DROP TABLE IF EXISTS audit_logs');
  db.exec('DROP TABLE IF EXISTS system_settings');
  db.exec('DROP TABLE IF EXISTS answers');
  db.exec('DROP TABLE IF EXISTS attempts');
  db.exec('DROP TABLE IF EXISTS questions');
  db.exec('DROP TABLE IF EXISTS exams');
  db.exec('DROP TABLE IF EXISTS admin_languages');
  db.exec('DROP TABLE IF EXISTS reattempt_permissions');
  db.exec('DROP TABLE IF EXISTS users');

  // Re-run schema creation manually to be 100% sure
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('super_admin', 'admin', 'student')) NOT NULL,
      language TEXT,
      profile_image_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false');

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      language TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      type TEXT DEFAULT 'MCQ',
      correct_answer TEXT NOT NULL,
      points INTEGER DEFAULT 5,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exam_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      time_taken INTEGER DEFAULT 0,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer TEXT,
      FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS admin_languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reattempt_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exam_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    );
  `);

  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Super Admin
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'super_admin')").run(
    'Director',
    'director@cgs.com',
    hashedPassword
  );

  // 2. 3 Admins
  const tracks = ['Java', 'Python', 'JavaScript'];
  const adminEmails = { 'Java': 'java@cgs.com', 'Python': 'python@cgs.com', 'JavaScript': 'js@cgs.com' };
  const adminIds = {};

  for (const lang of tracks) {
    const res = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')").run(
      `Lead ${lang}`,
      adminEmails[lang],
      hashedPassword
    );
    const adminId = res.lastInsertRowid;
    adminIds[lang] = adminId;
    db.prepare('INSERT INTO admin_languages (admin_id, language) VALUES (?, ?)').run(adminId, lang);
  }

  // 3. 30 Students
  const students = [];
  for (const lang of tracks) {
    for (let i = 1; i <= 10; i++) {
      const res = db.prepare("INSERT INTO users (name, email, password, role, language) VALUES (?, ?, ?, 'student', ?)").run(
        `${lang} Candidate ${i}`,
        `${lang.toLowerCase()}.${i}@cgs.com`,
        hashedPassword,
        lang
      );
      students.push({ id: res.lastInsertRowid, language: lang });
    }
  }

  // 4. 2 Exams per Admin
  const examIds = [];
  for (const lang of tracks) {
    const adminId = adminIds[lang];
    for (let i = 1; i <= 2; i++) {
      const res = db.prepare(
        'INSERT INTO exams (title, language, created_by) VALUES (?, ?, ?)'
      ).run(
        `${lang} Assessment ${i}`,
        lang,
        adminId
      );
      const examId = res.lastInsertRowid;
      examIds.push({ id: examId, language: lang });

      for (let j = 1; j <= 5; j++) {
        db.prepare(
          'INSERT INTO questions (exam_id, question, type, correct_answer) VALUES (?, ?, ?, ?)'
        ).run(
          examId,
          `What is used in ${lang} for task ${j}?`,
          'MCQ',
          'Option A'
        );
      }
    }
  }

  // 5. Attempts
  console.log('Synchronizing assessment history...');
  for (const student of students) {
    const myExams = examIds.filter(e => e.language === student.language);
    for (const exam of myExams) {
      const score = 50 + Math.floor(Math.random() * 46);
      const time_taken = 20 + Math.floor(Math.random() * 10);
      
      const res = db.prepare(
        "INSERT INTO attempts (user_id, exam_id, score, time_taken, submitted_at) VALUES (?, ?, ?, ?, datetime('now'))"
      ).run(
        student.id,
        exam.id,
        score,
        time_taken
      );
      
      const attemptId = res.lastInsertRowid;
      const q = db.prepare('SELECT id FROM questions WHERE exam_id = ?').get(exam.id);
      db.prepare('INSERT INTO answers (attempt_id, question_id, answer) VALUES (?, ?, ?)').run(
        attemptId,
        q.id,
        'Option A'
      );
    }
  }

  console.log('Seeding completed successfully!');
  console.log('TOTALS:');
  console.log('Students: 30');
  console.log('Admins: 3');
  console.log('Exams: 6');
  console.log('Attempts: 60');
}

seed().catch(err => {
  console.error('Seeding critical failure:', err);
});
