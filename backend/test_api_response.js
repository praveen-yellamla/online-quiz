const axios = require('axios');

async function testApi() {
  try {
    // I don't have a token, but let's assume I can check the logs
    // Actually, I'll just run the query in a script to see what it returns
    const db = require('./database/db');
    const language = 'java';
    const res = await db.get('SELECT COUNT(*) as count FROM enrollments WHERE language = ?', [language]);
    console.log('Result:', res);
    console.log('Count:', res.count);
    console.log('Type of Count:', typeof res.count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
testApi();
