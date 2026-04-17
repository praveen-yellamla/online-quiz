const db = require('../database/db');

async function fixData() {
  try {
    console.log('--- NORMALIZING SYSTEM LANGUAGES ---');
    
    // Update users table
    await db.run('UPDATE users SET language = LOWER(language) WHERE language IS NOT NULL');
    console.log('Synchronized user language tracks.');
    
    // Update enrollments table
    await db.run('UPDATE enrollments SET language = LOWER(language)');
    console.log('Synchronized student enrollments.');
    
    // Update admin_languages table
    await db.run('UPDATE admin_languages SET language = LOWER(language)');
    console.log('Synchronized admin authority tracks.');
    
    // Update exams table
    await db.run('UPDATE exams SET language = LOWER(language)');
    console.log('Synchronized assessment modules.');

    console.log('--- ALL PROTOCOLS NORMALIZED ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixData();
