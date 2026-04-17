const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_URL and TURSO_TOKEN must be set in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

const db = {
  // Executes a query and returns all rows
  all: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows;
  },
  
  // Executes a query and returns the first row
  get: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows[0];
  },
  
  // Executes a query and returns metadata (like lastInsertRowid)
  run: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return {
      lastInsertRowid: res.lastInsertRowid,
      changes: res.rowsAffected
    };
  },

  // Executes multiple statements
  exec: async (sql) => {
    return await client.executeMultiple(sql);
  },

  // Mock prepare for compatibility (returns a wrapper with all/get/run)
  prepare: (sql) => {
    return {
      all: (...params) => db.all(sql, params),
      get: (...params) => db.get(sql, params),
      run: (...params) => db.run(sql, params)
    };
  },

  // Transaction support
  transaction: (fn) => {
    return async (...args) => {
      // Simple transaction shim - Turso supports real transactions via client.transaction()
      // but simple wrapper is enough for now if I convert the fn to async
      const tx = await client.transaction("write");
      try {
        const result = await fn(tx, ...args);
        await tx.commit();
        return result;
      } catch (e) {
        await tx.rollback();
        throw e;
      }
    };
  }
};

// Initialize schema if needed
const initSchema = async () => {
  try {
    await db.exec(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false');

      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        language TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        duration INTEGER DEFAULT 60,
        passing_score INTEGER DEFAULT 50,
        start_time DATETIME,
        end_time DATETIME,
        status TEXT DEFAULT 'published',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        type TEXT DEFAULT 'mcq',
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        test_cases TEXT,
        points INTEGER DEFAULT 5
      );

      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        time_taken INTEGER DEFAULT 0,
        time_taken_seconds INTEGER,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        submitted_at DATETIME,
        answers_json TEXT,
        violation_count INTEGER DEFAULT 0,
        termination_reason TEXT
      );

      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT
      );

      CREATE TABLE IF NOT EXISTS admin_languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        language TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reattempt_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL
      );
    `);
    console.log("Turso Schema Initialized Successfully");
  } catch (err) {
    console.error("Turso Schema Initialization Failed:", err);
  }
};

initSchema();

module.exports = db;
