const db = require('../database/db');

exports.toggleMaintenanceMode = async (req, res) => {
  const { enabled } = req.body;
  try {
    await db.prepare("UPDATE system_settings SET value = ? WHERE key = 'maintenance_mode'").run(enabled.toString());
    
    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'MAINTENANCE_TOGGLE', `Maintenance mode set to ${enabled}`);

    res.json({ success: true, maintenance_mode: enabled });
  } catch (err) {
    console.error('toggleMaintenanceMode error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const bcrypt = require('bcryptjs');
exports.createAdminStandalone = async (req, res) => {
  const { name, email, password, language } = req.body;
  
  if (!name || !email || !password || !language) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.prepare(`
      INSERT INTO users (name, email, password, role, language, status)
      VALUES (?, ?, ?, 'admin', ?, 'active')
    `).run(name, email, hashedPassword, language);

    const newAdmin = { id: Number(result.lastInsertRowid), name, email, language, status: 'active' };

    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'ADMIN_CREATED', 'Created new admin');

    res.status(201).json({ success: true, admin: newAdmin });
  } catch (err) {
    console.error('createAdminStandalone error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await db.prepare(`
      SELECT u.id, u.name, u.email, u.status, u.language,
      (SELECT GROUP_CONCAT(language) FROM admin_languages WHERE admin_id = u.id) as languages
      FROM users u WHERE role = 'admin'
    `).all();
    
    admins.forEach(a => {
      a.languages = a.languages ? a.languages.split(',') : [];
    });

    console.log("[DEBUG] SuperAdmin Admins List:", admins.length, "rows found");
    res.json({ success: true, admins });
  } catch (err) {
    console.error('getAllAdmins error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateAdminLanguages = async (req, res) => {
  const { adminId, languages } = req.body;
  try {
    const transaction = db.transaction(async () => {
      await db.prepare('DELETE FROM admin_languages WHERE admin_id = ?').run(adminId);
      const insert = db.prepare('INSERT INTO admin_languages (admin_id, language) VALUES (?, ?)');
      for (const lang of languages) {
        await insert.run(adminId, lang);
      }
    });
    await transaction();
    res.json({ success: true, message: 'Admin languages updated' });
  } catch (err) {
    console.error('updateAdminLanguages error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await db.prepare(`
      UPDATE users 
      SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END 
      WHERE id = ?
    `).run(id);

    const updated = await db.prepare('SELECT id, name, status FROM users WHERE id = ?').get(id);
    
    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'STATUS_CHANGE', `Toggled status for ${updated.name} to ${updated.status}`);

    res.json({ success: true, message: `Identity state finalized: ${updated.status}`, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    const totalStudents = ((await db.prepare("SELECT COUNT(DISTINCT student_id) as count FROM enrollments").get())?.count) || 0;
    const totalAdmins = ((await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get())?.count) || 0;
    const totalExams = ((await db.prepare("SELECT COUNT(*) as count FROM exams").get())?.count) || 0;
    const totalAttempts = ((await db.prepare("SELECT COUNT(*) as count FROM attempts WHERE submitted_at IS NOT NULL").get())?.count) || 0;
    
    const avgScore = ((await db.prepare("SELECT AVG(score) as avg FROM attempts WHERE submitted_at IS NOT NULL").get())?.avg) || 0;
    
    res.json({
      success: true,
      stats: { totalStudents, totalAdmins, totalExams, totalAttempts, avgScore }
    });
  } catch (err) {
    console.error('getGlobalStats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    console.log("[DEBUG] Audit Logs Count:", logs.length);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getStudentsDetailed = async (req, res) => {
  const { language } = req.query;
  try {
    let query = `
      SELECT u.id, u.name, u.email, e.language, 
      COUNT(a.id) as attempts_count,
      AVG(a.score) as avg_score
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN attempts a ON u.id = a.student_id AND a.submitted_at IS NOT NULL
      WHERE u.role = 'student'
    `;
    const params = [];
    if (language && language !== 'All') {
      const normalizedLang = language.toLowerCase();
      query += ` AND LOWER(u.language) = ?`;
      params.push(normalizedLang);
    }
    query += ` GROUP BY u.id ORDER BY u.name ASC`;
    
    const students = await db.prepare(query).all(...params);
    console.log(`[DEBUG] Students API result for ${language || 'All'}:`, students.length, "rows found");
    res.json({ success: true, students });
  } catch (err) {
    console.error('getStudentsDetailed error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getExamsDetailed = async (req, res) => {
  try {
    const exams = await db.prepare(`
      SELECT e.id, e.title, e.language, u.name as creator_name,
      COUNT(a.id) as total_attempts,
      AVG(a.score) as avg_score,
      MAX(a.score) as top_score
      FROM exams e
      JOIN users u ON e.created_by = u.id
      LEFT JOIN attempts a ON e.id = a.exam_id AND a.submitted_at IS NOT NULL
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `).all();
    console.log("[DEBUG] Exams API result:", exams.length, "rows found");
    res.json({ success: true, exams });
  } catch (err) {
    console.error('getExamsDetailed error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getExamAnalytics = async (req, res) => {
  const { id } = req.params;
  try {
    const analytics = await db.prepare(`
      SELECT a.id, u.name as student_name, a.score, a.time_taken, a.submitted_at,
      RANK() OVER (ORDER BY a.score DESC, a.time_taken ASC) as rank
      FROM attempts a
      JOIN users u ON a.student_id = u.id
      WHERE a.exam_id = ? AND a.submitted_at IS NOT NULL
      ORDER BY rank ASC
    `).all(id);
    
    const exam = await db.prepare('SELECT title, language FROM exams WHERE id = ?').get(id);
    
    console.log(`[DEBUG] Exam Analytics results for Exam ID ${id}:`, analytics.length, "performance records found");
    res.json({ success: true, exam, analytics });
  } catch (err) {
    console.error('getExamAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getAdminDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await db.prepare(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.language, 
        u.status, 
        COUNT(e.id) AS exams_created
      FROM users u
      LEFT JOIN exams e ON u.id = e.created_by
      WHERE u.id = ? AND u.role = 'admin'
      GROUP BY u.id
    `).get(id);

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const exams = await db.prepare(`
      SELECT id, title, language, 
      (SELECT COUNT(*) FROM attempts WHERE exam_id = exams.id AND submitted_at IS NOT NULL) as attempts
      FROM exams WHERE created_by = ?
    `).all(id);

    res.json({ success: true, admin, exams });
  } catch (err) {
    console.error('getAdminDetails error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getSettings = (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, settings: settingsObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  const { settings } = req.body; // { key: value, ... }
  try {
    const update = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction(async () => {
      for (const [key, value] of Object.entries(settings)) {
        await update.run(key, value.toString());
      }
    });
    await transaction();
    
    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'SETTINGS_UPDATE', `Updated system settings: ${Object.keys(settings).join(', ')}`);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.purgeAuditLogs = async (req, res) => {
  try {
    await db.prepare('DELETE FROM audit_logs').run();
    await db.prepare("INSERT INTO audit_logs (user_id, action, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run(req.user.id, 'LOGS_PURGED', 'Executed system-wide audit trail sanitization');

    res.json({ success: true, message: 'Audit trail purged successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
