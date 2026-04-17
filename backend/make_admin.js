const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, '../data/quiz.db'));
const res = db.prepare("UPDATE users SET role = 'admin' WHERE email = 'admin@crestonix.com'").run();
console.log(res);
db.close();
