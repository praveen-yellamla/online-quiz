const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const db = require('../backend/database/db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update all users to use 123456
    await db.run('UPDATE users SET password = ?', [hashedPassword]);
    
    console.log('All user passwords reset to 123456');
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixPasswords();
