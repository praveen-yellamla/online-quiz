const db = require('../backend/database/db');
require('dotenv').config({ path: '../backend/.env' });

async function checkUsers() {
  try {
    const users = await db.prepare('SELECT id, name, email, role, password FROM users').all();
    console.log('Database Connected Successfully. Found', users.length, 'users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | Pwd Hash Prefix: ${u.password ? u.password.substring(0, 10) : 'NULL'}...`);
    });
  } catch (err) {
    console.error('Turso Connection Error:', err.message);
  }
}

checkUsers();
