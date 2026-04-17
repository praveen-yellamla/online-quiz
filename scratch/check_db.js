const db = require('../backend/database/db');
try {
    const columns = db.prepare('PRAGMA table_info(users)').all();
    console.log('Users columns:', columns.map(c => c.name));
} catch (e) {
    console.error('Error checking schema:', e);
}
