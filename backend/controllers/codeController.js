const axios = require('axios');

exports.runCode = async (req, res) => {
  const { language, code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  // Map our internal language names to Piston library names
  const langMap = {
    'javascript': 'javascript',
    'java': 'java',
    'python': 'python',
    'sql': 'sqlite3'
  };

  const pistonLang = langMap[language.toLowerCase()] || 'javascript';

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: pistonLang,
      version: '*', // Use latest available
      files: [
        {
          name: 'solution',
          content: code
        }
      ]
    });

    const { run } = response.data;
    
    res.json({
      success: true,
      output: run.output || run.stdout || run.stderr || 'Program executed with no output.',
      exitCode: run.code
    });
  } catch (err) {
    console.error('Code Execution Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Hardware Failure in Sandbox: Could not execute code.' 
    });
  }
};
