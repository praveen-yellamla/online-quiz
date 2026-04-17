const db = require('./database/db');
console.log('--- USERS BY LANGUAGE ---');
const users = db.prepare("SELECT language, role, COUNT(*) as count FROM users GROUP BY language, role").all();
console.log(users);

console.log('--- ENROLLMENTS BY LANGUAGE ---');
const enrollments = db.prepare("SELECT language, COUNT(*) as count FROM enrollments GROUP BY language").all();
console.log(enrollments);
