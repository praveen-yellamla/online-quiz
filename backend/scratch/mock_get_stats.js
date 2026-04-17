const db = require('../database/db');

async function mockGetStats() {
  const adminLanguage = 'java';
  
  // Current logic in adminController.getStats
  const enrollmentsCount = (await db.prepare(`
    SELECT COUNT(*) as count FROM enrollments WHERE language = ?
  `).get(adminLanguage))?.count || 0;

  // Alternative counts
  const usersCount = (await db.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role = 'student' AND language = ?
  `).get(adminLanguage))?.count || 0;

  console.log('--- ENHANCED MOCK STATS ---');
  console.log('Target Language:', adminLanguage);
  console.log('Count from enrollments:', enrollmentsCount);
  console.log('Count from users:', usersCount);
  
  process.exit(0);
}
mockGetStats();
