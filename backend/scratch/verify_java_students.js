const db = require('../database/db');

async function check() {
  const language = 'java';
  const students = await db.all(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      e.language
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    WHERE u.role = 'student' AND e.language = ?
    ORDER BY u.name ASC
  `, [language]);
  
  console.log(`Total Java Students: ${students.length}`);
  console.table(students);
  process.exit(0);
}
check();
