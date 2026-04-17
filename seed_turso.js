const db = require('./backend/database/db');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function seed() {
  try {
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

    // 2. Auxiliary Nodes
    await db.prepare("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_mode', 'false')").run();

    console.log('\nTurso Cloud Repository Seeded Successfully.');
  } catch (err) {
    console.error('Seeding Integrity Violation:', err.message);
  }
}

seed();
