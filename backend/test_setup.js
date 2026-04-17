const axios = require('axios');

async function setupExam() {
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // 1. Register Admin (Catch error if exists)
    try {
      await axios.post(`${baseURL}/auth/register`, {
        name: 'CGS Administrator',
        email: 'admin@crestonix.com',
        password: 'Password123',
        role: 'admin' // Directly set role in request, but controller defaults to student
      });
      console.log('Admin registered');
    } catch (e) {
      console.log('Admin already registered or error');
    }

    // 2. We need to promote it via DB because register controller ignores role
    // I will call my local script for that
    const { execSync } = require('child_process');
    execSync('node make_admin.js');
    console.log('Admin promoted via DB');

    // 3. Login
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@crestonix.com',
      password: 'Password123'
    });
    
    const token = loginRes.data.token;
    console.log('Logged in successfully');

    // 4. Create Exam
    const examRes = await axios.post(`${baseURL}/admin/exams`, {
      title: 'Standard JS Assessment',
      duration: 5,
      passing_score: 50,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const examId = examRes.data.examId;
    console.log('Exam created, ID:', examId);

    // 5. Add Questions
    const questions = [
      {
        exam_id: examId,
        type: 'mcq',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct_answer: '4',
        points: 5
      },
      {
        exam_id: examId,
        type: 'mcq',
        question: 'What is typeof null?',
        options: ['string', 'object', 'undefined', 'null'],
        correct_answer: 'object',
        points: 5
      }
    ];

    for (const q of questions) {
      await axios.post(`${baseURL}/admin/questions`, q, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    console.log('Questions added');

    // 6. Publish Exam
    await axios.patch(`${baseURL}/admin/exams/${examId}/publish`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Exam published');

  } catch (err) {
    console.error('Test Setup Failed:', err.response?.data || err.message);
  }
}

setupExam();
