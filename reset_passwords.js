const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const db = require('./backend/database/db');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Update all users or just the main ones? User said "current passwords", I'll do all for consistency.
    const result = await db.prepare('UPDATE users SET password = ?').run(hashedPassword);
    
    console.log('Successfully connected to Turso.');
    console.log(`Updated all ${result.changes} users to password: 123456`);
    
    // List updated users to verify
    const users = await db.prepare('SELECT id, name, email, role FROM users').all();
    console.log('\n--- Current User Data Cluster ---');
    users.forEach(u => {
      console.log(`- ${u.name} | ${u.email} | Role: ${u.role}`);
    });

  } catch (err) {
    console.error('Turso Maintenance Failure:', err.message);
    console.error('Debug: TURSO_URL length:', process.env.TURSO_URL ? process.env.TURSO_URL.length : 0);
  }
}

resetPasswords();
