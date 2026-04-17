const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../data/quiz.db');
const db = new Database(dbPath);

const admins = db.prepare("SELECT id, name, email, role, language FROM users WHERE role = 'admin'").all();
console.log('ALL_ADMINS:', JSON.stringify(admins, null, 2));
process.exit(0);
