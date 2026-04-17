const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../data/quiz.db'); // Adjust path for backend/scripts
const db = new Database(dbPath);

const email = 'praveen@cgs.com';
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (user) {
  console.log('USER_FOUND:', JSON.stringify(user, null, 2));
} else {
  console.log('USER_NOT_FOUND');
}
process.exit(0);
