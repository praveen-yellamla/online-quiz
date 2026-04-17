const db = require('./database/db'); 

try {
  db.transaction(() => { 
    const students = db.prepare("SELECT id, language FROM users WHERE role = 'student'").all(); 
    console.log(`Found ${students.length} students to enroll.`);
    
    const insert = db.prepare('INSERT INTO enrollments (student_id, language) VALUES (?, ?)'); 
    
    // Clear existing enrollments to avoid duplicates if any
    db.prepare('DELETE FROM enrollments').run();
    
    for (const s of students) { 
      if (s.language) {
        insert.run(s.id, s.language); 
      }
    } 
  })(); 
  console.log('SUCCESS: Fixed enrollments from users table');
} catch (err) {
  console.error('ERROR fixing enrollments:', err);
}
