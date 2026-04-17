const db = require('../database/db');

async function check() {
  const users = await db.all("SELECT * FROM users WHERE email LIKE 'java.student%'");
  console.log('--- RESTORED USERS ---');
  console.table(users.map(u => ({ id: u.id, name: u.name, email: u.email, language: u.language })));
  
  const enrollments = await db.all("SELECT * FROM enrollments WHERE language = 'java'");
  console.log('--- RESTORED ENROLLMENTS ---');
  console.table(enrollments);
  process.exit(0);
}
check();
