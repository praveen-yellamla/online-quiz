const Database = require('better-sqlite3');
const db = new Database('../data/quiz.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('--- TABLES ---');
tables.forEach(t => {
    console.log(`[TABLE] ${t.name}`);
    const columns = db.prepare(`PRAGMA table_info(${t.name})`).all();
    columns.forEach(c => console.log(`  - ${c.name} (${c.type})`));
});
