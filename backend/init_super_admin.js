const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data/quiz.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('SUPER_ADMIN', 'ADMIN', 'STUDENT')) DEFAULT 'STUDENT',
    language TEXT,
    profile_image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function init() {
  const email = 'superadmin@crestonix.com';
  const password = 'Password@123';
  const name = 'Director Admin';
  
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log('Super Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, hashedPassword, 'SUPER_ADMIN');

  console.log('-----------------------------------');
  console.log('Super Admin Created Successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('-----------------------------------');
}

init();
