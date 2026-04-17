const db = require('../database/db');

async function checkMetrics() {
  const language = 'java';
  
  const enrollmentsCount = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE language = ?', [language]);
  const enrollmentsCountUpper = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE language = ?', ['Java']);
  const totalStudents = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ? AND language = ?', ['student', language]);

  console.log('--- METRICS AUDIT ---');
  console.log('Language:', language);
  console.log('Enrollments (lower):', enrollmentsCount.count);
  console.log('Enrollments (upper):', enrollmentsCountUpper.count);
  console.log('Users (student, lower):', totalStudents.count);
  
  process.exit(0);
}
checkMetrics();
