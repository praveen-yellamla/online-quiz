const db = require('../backend/database/db');
console.log("STUDENT SAMPLE:");
const students = db.prepare("SELECT name, role, language FROM users WHERE role = 'student' LIMIT 5").all();
console.log(students);
console.log("\nEXAM SAMPLE:");
const exams = db.prepare("SELECT title, language FROM exams LIMIT 5").all();
console.log(exams);
