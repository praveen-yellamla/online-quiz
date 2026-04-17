const db = require('../database/db');

async function check() {
  const users = await db.all('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');
  console.log('--- RECENT USERS ---');
  console.table(users.map(u => ({ id: u.id, name: u.name, email: u.email, language: u.language, role: u.role })));
  
  const enrollments = await db.all('SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 5');
  console.log('--- RECENT ENROLLMENTS ---');
  console.table(enrollments);
  process.exit(0);
}
check();
