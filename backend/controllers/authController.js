const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const cloudinary = require('../services/cloudinary');

exports.register = async (req, res) => {
  const { name, email, password, language, profile_image } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    if (!normalizedEmail.endsWith('@cgs.com')) {
      return res.status(400).json({ success: false, message: 'Official Protocol Required: Email must terminate with @cgs.com' });
    }

    const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Database Conflict: Email already taken by another operative' });
    }

    // Upload profile photo to Cloudinary
    let profile_image_url = null;
    if (profile_image) {
      profile_image_url = await cloudinary.uploadImage(profile_image, 'profiles');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedLanguage = language ? language.toLowerCase() : null;

    const transaction = db.transaction(async (tx) => {
      const result = await tx.execute({
        sql: 'INSERT INTO users (name, email, password, role, language, profile_image_url) VALUES (?, ?, ?, ?, ?, ?)',
        args: [name, normalizedEmail, hashedPassword, 'student', normalizedLanguage, profile_image_url]
      });

      const userId = Number(result.lastInsertRowid);
      
      await tx.execute({
        sql: 'INSERT INTO enrollments (student_id, language) VALUES (?, ?)',
        args: [userId, normalizedLanguage]
      });

      return userId;
    });

    const userId = await transaction();

    const token = jwt.sign(
      { id: userId, role: 'student', name, language: normalizedLanguage },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email: normalizedEmail, role: 'student', language: normalizedLanguage, profile_image_url }
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Registry Protocol Failure: Email and password sequence must be provided.' });
    }

    const normalizedEmail = email.toLowerCase();
    
    console.log(`[AUTH PROCESS] Initiating validation for operative: ${normalizedEmail}`);

    // Fetch user from Turso Cloud Node
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    
    if (!user) {
      console.warn(`[AUTH FAILED] operative ${email} not found in repository.`);
      return res.status(401).json({ success: false, message: "Identity Unknown: operative not found in repository." });
    }

    if (user.status !== 'active') {
      console.warn(`[AUTH FAILED] operative ${email} account is currently DEACTIVATED.`);
      return res.status(403).json({ success: false, message: 'Operational Access Denied: Account status is INACTIVE.' });
    }

    // Comprehensive Credential Audit
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[AUTH DEBUG] Comparison sequence completed. Result: ${isMatch ? 'Match Confirmed' : 'Mismatch Detected'}`);

    if (!isMatch) {
      console.warn(`[AUTH FAILED] Invalid credential sequence for operative: ${email}`);
      return res.status(401).json({ success: false, message: "Security Violation: Invalid credential sequence provided." });
    }

    // System State Monitoring
    const maintenance = await db.prepare("SELECT value FROM system_settings WHERE key = 'maintenance_mode'").get();
    if (maintenance?.value === 'true' && user.role !== 'super_admin') {
      return res.status(503).json({ success: false, message: 'Infrastructure Alert: System under maintenance. Access restricted.' });
    }

    let language = user.language;
    if (user.role === 'admin' && !language) {
      const adminLang = await db.prepare('SELECT language FROM admin_languages WHERE admin_id = ? LIMIT 1').get(user.id);
      language = adminLang?.language;
    }

    // Token Generation
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, language: language },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH SUCCESS] Operative ${email} verified. Session token generated.`);

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, language, profile_image_url: user.profile_image_url }
    });
  } catch (err) {
    console.error('[AUTH CRITICAL] Infrastructure Failure:', err);
    res.status(500).json({ success: false, message: 'Infrastructure failure: Authorization engine encountered a fatal error.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, email, role, language, profile_image_url, status FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let language = user.language;
    if (user.role === 'admin' && !language) {
      const adminLang = await db.prepare('SELECT language FROM admin_languages WHERE admin_id = ? LIMIT 1').get(user.id);
      language = adminLang?.language;
    }

    res.json({ 
      success: true, 
      user: { ...user, language } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Super Admin only: Create Admin
exports.createAdmin = async (req, res) => {
  const { name, email, password, languages } = req.body; // languages is an array

  try {
    const normalizedEmail = email.toLowerCase();
    if (!normalizedEmail.endsWith('@cgs.com')) {
      return res.status(400).json({ success: false, message: 'Infrastructure Violation: Admin accounts must use @cgs.com domain.' });
    }

    const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Registry Conflict: Email already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const transaction = db.transaction(async (tx) => {
      const result = await tx.execute({
        sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        args: [name, normalizedEmail, hashedPassword, 'admin']
      });

      const adminId = Number(result.lastInsertRowid);

      for (const lang of languages) {
        await tx.execute({
          sql: 'INSERT INTO admin_languages (admin_id, language) VALUES (?, ?)',
          args: [adminId, lang.toLowerCase()]
        });
      }
      
      return adminId;
    });

    const adminId = await transaction();

    await db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)')
      .run(req.user.id, 'ADMIN_CREATED', `Created new admin: ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      adminId
    });
  } catch (err) {
    console.error('createAdmin error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
