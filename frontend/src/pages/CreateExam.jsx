import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Trash2, Save, Code, CheckSquare, 
  AlignLeft, Upload, FileJson, AlertCircle,
  CheckCircle2, ChevronRight, HelpCircle, Download
} from 'lucide-react';

const CreateExam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [examData, setExamData] = useState({
    title: '',
    duration: 60,
    passing_score: 50,
    language: user?.language || 'java',
    start_time: '',
    end_time: ''
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'bulk' or 'excel'
  const [bulkData, setBulkData] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (user?.language) {
      setExamData(prev => ({ ...prev, language: user.language }));
    }
  }, [user]);

  const addQuestion = (type) => {
    setQuestions([...questions, {
      type,
      question: '',
      options: type === 'mcq' ? ['', '', '', ''] : [],
      correct_answer: '',
      points: 5
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSmartParse = () => {
    try {
      // Improved Regex to detect Questions starting with numbers or just new paragraphs
      // Splits by "1.", "Q1:", or double newlines
      const segments = bulkData.split(/\n(?=\d+[\.\)])|\n(?=Q\d+[:\-])|\n\n/i).filter(s => s.trim());
      const newQuestions = segments.map(seg => {
        const lines = seg.trim().split('\n');
        const questionText = lines[0].replace(/^\d+[\.\)]\s*|^Q\d+[:\-]\s*/i, '').trim();
        
        // Find options: Look for lines starting with a), b), c) or A., B., C.
        const options = lines.slice(1)
          .filter(l => /^[a-d][\.\)]/i.test(l.trim()))
          .map(l => l.trim().replace(/^[a-d][\.\)]\s*/i, ''));
        
        // Find answer: Look for "Answer: X" or "Correct: X"
        const answerMatch = seg.match(/(?:Answer|Correct|Ans):\s*([a-d]|.+)/i);
        
        if (!questionText) return null;

        return {
          question: questionText,
          type: options.length > 0 ? 'mcq' : (questionText.toLowerCase().includes('code') ? 'coding' : 'short'),
          options: options.length > 0 ? options : [],
          correct_answer: answerMatch ? answerMatch[1].trim() : (options[0] || 'N/A'),
          points: 5
        };
      }).filter(q => q);

      if (newQuestions.length === 0) throw new Error('Could not detect question patterns. Try using the "1. Question ... a) b) Answer: a" format.');
      setQuestions([...questions, ...newQuestions]);
      setActiveTab('manual');
      setBulkData('');
    } catch (err) {
      alert(err.message || 'Smart parsing failed. Please check your text format.');
    }
  };

  const handleBulkUpload = () => {
    // If it looks like CSV, use CSV. If it looks like JSON, use JSON.
    // If it looks like plain text paragraphs, offer Smart Parse in the alert or just try it.
    try {
      if (bulkData.trim().startsWith('[') || bulkData.trim().startsWith('{')) {
        const parsed = JSON.parse(bulkData);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map(q => ({
            type: q.type || 'mcq',
            question: q.question || '',
            options: q.options || (q.type === 'mcq' ? ['', '', '', ''] : []),
            correct_answer: q.correct_answer || '',
            points: q.points || 5
          }));
          setQuestions([...questions, ...sanitized]);
          setActiveTab('manual');
          setBulkData('');
          return;
        }
      }

      // Default to CSV
      const lines = bulkData.trim().split('\n');
      if (lines.length >= 2 && bulkData.includes(',')) {
        const newQuestions = lines.slice(1).map(line => {
          const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length < 7) return null;
          
          return {
            question: parts[0],
            type: parts[1].toLowerCase() || 'mcq',
            options: [parts[2], parts[3], parts[4], parts[5]].filter(o => o),
            correct_answer: parts[6],
            points: parseInt(parts[7]) || 5
          };
        }).filter(q => q);

        if (newQuestions.length > 0) {
          setQuestions([...questions, ...newQuestions]);
          setActiveTab('manual');
          setBulkData('');
          return;
        }
      }

      // If CSV failed, try Smart Parse
      handleSmartParse();
    } catch (err) {
      alert('Format unrecognized. Please use CSV, JSON or standard Q&A paragraphs.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert('Please add at least one question');
    
    setLoading(true);
    try {
      const examRes = await api.post('/admin/exams', examData);
      const examId = examRes.data.examId;

      await api.post('/admin/questions/upload', { 
        exam_id: examId, 
        questions 
      });

      navigate('/admin/exams');
    } catch (err) {
      console.error(err);
      alert('Failed to create examination protocol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Create New Exam</h2>
          <p style={{ color: 'var(--text-muted)' }}>Track: <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{user?.language}</span> Assessment</p>
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--background-alt)', padding: '0.4rem', borderRadius: '0.75rem', gap: '0.4rem' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('manual')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              borderRadius: '0.5rem', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'manual' ? 'white' : 'transparent',
              boxShadow: activeTab === 'manual' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
              color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            Question Builder
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('excel')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              borderRadius: '0.5rem', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.875rem',
              backgroundColor: activeTab === 'excel' ? 'white' : 'transparent',
              boxShadow: activeTab === 'excel' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
              color: activeTab === 'excel' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            Excel Synchronizer
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800' }}>Protocol Foundations</h3>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.4rem 1rem', borderRadius: '2rem' }}>
              TRACK: {examData.language.toUpperCase()}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Exam Title</label>
              <input 
                id="exam-title-input"
                type="text" className="input-field" placeholder="e.g. Backend Architecture Proficiency"
                value={examData.title} onChange={(e) => setExamData({...examData, title: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Duration (Minutes)</label>
              <input 
                type="number" className="input-field" value={examData.duration}
                onChange={(e) => setExamData({...examData, duration: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Passing Score (%)</label>
              <input 
                type="number" className="input-field" value={examData.passing_score}
                onChange={(e) => setExamData({...examData, passing_score: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Deployment Date & Time</label>
              <input 
                type="datetime-local" className="input-field" 
                value={examData.start_time || ''}
                onChange={(e) => setExamData({...examData, start_time: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Access Deadline (Optional)</label>
              <input 
                type="datetime-local" className="input-field" 
                value={examData.end_time || ''}
                onChange={(e) => setExamData({...examData, end_time: e.target.value})}
              />
            </div>
          </div>
        </div>

        {activeTab === 'excel' ? (
          <div className="card" style={{ border: '2px dashed var(--border)', backgroundColor: 'rgba(59, 130, 246, 0.02)', padding: '3rem', textAlign: 'center' }}>
            <Upload size={48} style={{ marginBottom: '1.5rem', color: 'var(--accent)', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Bulk Ingestion Terminal</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
              Upload a certified .xlsx or .csv spreadsheet to automatically generate this certification cluster. 
              The system will parse all question types, options, and scoring weights in a single transaction.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
               <input 
                type="file" 
                id="excel-upload" 
                style={{ display: 'none' }} 
                accept=".xlsx,.xls,.csv"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  if (!examData.title || !examData.title.trim()) {
                    alert('CRITICAL: Please provide an Exam Title before initializing the bulk-upload protocol.');
                    document.getElementById('exam-title-input').focus();
                    e.target.value = ''; // Clear selection
                    return;
                  }

                  setLoading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('title', examData.title);
                  formData.append('language', examData.language);
                  formData.append('duration', examData.duration);
                  formData.append('passing_score', examData.passing_score);

                  try {
                    const response = await api.post('/admin/exams/bulk-upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    if (response.data.invalidRows && response.data.invalidRows.length > 0) {
                      setValidationErrors(response.data.invalidRows);
                      alert(`Synchronization partially successful. ${response.data.invalidRows.length} rows were skipped due to formatting violations.`);
                    } else {
                      alert('Exam cluster synchronized successfully.');
                      navigate('/admin/manage-exams');
                    }
                  } catch (err) {
                    alert('Synchronization failed: ' + (err.response?.data?.message || 'Server error'));
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => document.getElementById('excel-upload').click()}
                  className="btn btn-primary"
                  style={{ padding: '1rem 3rem', fontSize: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Synchronizing Cluster...' : 'Select Assessment Spreadsheet'}
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    const res = await api.get('/admin/exams/template', { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a'); link.href = url;
                    link.setAttribute('download', 'Exam_Template.xlsx');
                    document.body.appendChild(link); link.click(); link.remove();
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '1rem 1.5rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  <Download size={18} /> Official Template
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '700px', textAlign: 'left', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                  <h4 style={{ color: '#ef4444', fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> Validation Inspector: {validationErrors.length} Violations Found
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.5rem' }}>Row #</th>
                          <th style={{ padding: '0.5rem' }}>Infrastructure Violation Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationErrors.map((err, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: '800' }}>#{err.index}</td>
                            <td style={{ padding: '0.5rem' }}>{err.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'left', width: '100%', maxWidth: '500px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="var(--accent)" /> Spreadsheet Structure Requirement
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Your file must contain the following header precisely:</p>
                <code style={{ display: 'block', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)', lineHeight: '1.5' }}>
                  Question, Type, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points
                </code>
              </div>
            </div>
          </div>
        ) : activeTab === 'bulk' ? (
          <div className="card" style={{ border: '2px dashed var(--border)', backgroundColor: 'rgba(59, 130, 246, 0.02)' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileJson size={20} color="var(--accent)" /> Bulk Data Import
                </h3>
                <textarea 
                  className="input-field" 
                  rows="12"
                  placeholder='CSV: Question,Type,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Points&#10;OR&#10;JSON: [ { "question": "...", "type": "mcq", ... } ]'
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                ></textarea>
                <button 
                  type="button" 
                  onClick={handleBulkUpload}
                  className="btn btn-secondary" 
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  <Upload size={18} /> Smart Parse & Add Questions
                </button>
              </div>
              <div style={{ width: '300px', backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '800', marginBottom: '1rem' }}>Import Standards</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <li><strong>CSV:</strong> Paste columns from Excel (Question, Type, a, b, c, d, correct, pts)</li>
                  <li><strong>PDF/Doc:</strong> Paste text like "1. What is...? a) b) Answer: a)"</li>
                  <li><strong>JSON:</strong> Paste raw question objects array</li>
                  <li>Types: mcq, short, coding</li>
                </ul>
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700', marginBottom: '0.5rem' }}>Sample Format:</p>
                  <pre style={{ fontSize: '0.6rem', margin: 0, opacity: 0.7 }}>
{`[
  {
    "question": "Sample?",
    "type": "mcq",
    "options": ["A", "B"],
    "correct_answer": "A"
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Question List ({questions.length} Items)</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => addQuestion('mcq')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <CheckSquare size={16} /> MCQ
                </button>
                <button type="button" onClick={() => addQuestion('short')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <AlignLeft size={16} /> Short
                </button>
                <button type="button" onClick={() => addQuestion('coding')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Code size={16} /> Code
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="card" style={{ position: 'relative', border: '1px solid var(--border)' }}>
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(qIndex)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ 
                      background: 'var(--accent)', 
                      color: 'white',
                      padding: '0.125rem 0.6rem', 
                      borderRadius: '0.4rem', 
                      fontSize: '0.625rem', 
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {q.type}
                    </span>
                    <span style={{ fontWeight: '800', fontSize: '0.875rem', color: 'var(--primary)' }}>Question #{qIndex + 1}</span>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Question Text</label>
                    <textarea 
                      className="input-field" 
                      rows="2"
                      placeholder="Enter the assessment prompt here..."
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {q.type === 'mcq' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Option {oIndex + 1}</label>
                          <input 
                            type="text" className="input-field" 
                            value={opt} 
                            placeholder={`Choice ${oIndex + 1}`}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                      <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                        <label className="input-label">Correct Answer</label>
                        <select 
                          className="input-field"
                          value={q.correct_answer}
                          onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                          required
                        >
                          <option value="">Select correct option...</option>
                          {q.options.map((opt, i) => (
                             opt && <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {(q.type === 'short' || q.type === 'coding') && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Correct Answer</label>
                      <input 
                        type="text" className="input-field" 
                        placeholder="Expected terminology or code patterns..."
                        value={q.correct_answer}
                        onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {questions.length === 0 && (activeTab === 'manual') && (
                <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'var(--background-alt)', borderRadius: '1rem', border: '2px dashed var(--border)' }}>
                  <Plus size={40} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                  <p style={{ color: 'var(--text-muted)' }}>No localized questions initialized. Use the construction kits above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem'
        }}>
          <button type="button" onClick={() => navigate('/admin/exams')} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
            {loading ? 'Creating Exam...' : (
              <>
                <Save size={20} /> Create Exam
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
