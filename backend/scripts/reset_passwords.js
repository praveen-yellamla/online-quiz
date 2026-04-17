const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../database/db');

async function seedAndReset() {
  try {
    console.log('TURSO_URL length:', process.env.TURSO_URL ? process.env.TURSO_URL.length : 'NULL');
    
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    console.log('Seeding Turso Database with 100% data-consistent records...');

    // 1. Core Identity Nodes
    const users = [
      { name: 'Super Admin', email: 'superadmin@cgs.com', role: 'super_admin' },
      { name: 'Java Administrator', email: 'java_admin@cgs.com', role: 'admin', language: 'java' },
      { name: 'Default Student', email: 'student@gmail.com', role: 'student' }
    ];

    for (const u of users) {
      await db.prepare(`
        INSERT OR REPLACE INTO users (name, email, password, role, language, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `).run(u.name, u.email, password, u.role, u.language || null);
      console.log(`- Synthesized: ${u.name} (${u.email}) as ${u.role}`);
    }

    console.log('\nTurso Cloud Repository Seeded Successfully.');

  } catch (err) {
    console.error('Turso Maintenance Failure:', err.message);
  }
}

seedAndReset();
