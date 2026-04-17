const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../data/quiz.db');
const db = new Database(dbPath);

const email = 'praveen@cgs.com';
const result = db.prepare('DELETE FROM users WHERE email = ?').run(email);

console.log('DELETE_RESULT:', JSON.stringify(result, null, 2));
process.exit(0);
