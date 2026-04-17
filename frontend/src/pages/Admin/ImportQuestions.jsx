import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileUp, Database, AlertCircle, CheckCircle2, 
  HelpCircle, Trash2, Brain
} from 'lucide-react';

const ImportQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [importType, setImportType] = useState('csv'); // 'csv' or 'smart'
  const [rawData, setRawData] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', id);

    try {
      const res = await api.post('/admin/exams/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      navigate(`/admin/exam/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Server-side upload failure.');
    } finally {
      setLoading(false);
    }
  };

  const parseCsvString = (data) => {
    try {
      const lines = data.trim().split('\n');
      if (lines.length < 2) throw new Error('Insufficient dataset. Please provide a header and at least one entry.');
      
      const questions = lines.slice(1).map(line => {
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

      setParsedQuestions(questions);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCsvParse = () => {
    parseCsvString(rawData);
  };

  const handleSmartParse = () => {
    // High-level AI-style text parser (supports "Question? Answer: X" pattern)
    try {
      const segments = rawData.split(/\n\d+\.|\n\n/).filter(s => s.trim());
      const questions = segments.map(seg => {
        const lines = seg.trim().split('\n');
        const question = lines[0].replace(/^\d+\.\s*/, '');
        const options = lines.slice(1).filter(l => /^[a-d]\)/i.test(l)).map(l => l.replace(/^[a-d]\)\s*/i, ''));
        const answerMatch = seg.match(/Answer:\s*([a-d]|.+)/i);
        
        if (!question) return null;

        return {
          question,
          type: options.length > 0 ? 'mcq' : 'code',
          options: options.length > 0 ? options : [],
          correct_answer: answerMatch ? answerMatch[1].trim() : 'N/A',
          points: 5
        };
      }).filter(q => q);

      setParsedQuestions(questions);
      setError(null);
    } catch (err) {
      setError('Technical track parsing failed. Ensure text follows standard assessment syntax.');
    }
  };

  const commitImport = async () => {
    if (parsedQuestions.length === 0) return;
    setLoading(true);
    try {
      await api.post('/admin/questions/upload', {
        exam_id: id,
        questions: parsedQuestions
      });
      alert(`Synchronized ${parsedQuestions.length} questions to protocol repository.`);
      navigate(`/admin/exam/${id}`);
    } catch (err) {
      setError('Communication failure with infrastructure layer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Advanced Question Import</h2>
        <p style={{ color: 'var(--text-muted)' }}>Securely synchronize assessments via file upload or manual CSV ingestion.</p>
      </header>

      <div className="card" style={{ marginBottom: '2.5rem', border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.02)' }}>
        <FileUp size={48} style={{ marginBottom: '1rem', color: 'var(--accent)', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Synchronize via File Repository</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Upload your finalized .csv or .json files directly to the assessment engine.</p>
        <button 
          onClick={() => document.getElementById('direct-file-upload').click()}
          className="btn btn-primary" 
          disabled={loading}
          style={{ padding: '0.75rem 2rem' }}
        >
          {loading ? 'Transmitting Data...' : 'Choose and Upload File'}
        </button>
        <input 
          id="direct-file-upload"
          type="file" 
          style={{ display: 'none' }} 
          accept=".csv,.json" 
          onChange={handleFileUpload}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div 
              onClick={() => document.getElementById('csv-upload').click()}
              style={{ flex: 1, padding: '1rem', border: '2px dashed var(--border)', borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--background)' }}
            >
              <FileUp size={24} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: '700' }}>Click to Upload CSV</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: .csv (standard headers)</div>
              <input 
                id="csv-upload"
                type="file" 
                style={{ display: 'none' }} 
                accept=".csv" 
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="var(--accent)" /> How to import correctly
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Use the following headers in your CSV: <strong>Question, Type, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points</strong>.
            </p>
            <button 
              onClick={async () => {
                const res = await api.get('/admin/exams/template', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a'); link.href = url;
                link.setAttribute('download', 'Exam_Template.xlsx');
                document.body.appendChild(link); link.click(); link.remove();
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '700', padding: 0, marginTop: '0.5rem', cursor: 'pointer' }}
            >
              Download Official Spreadsheet Template
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Paste CSV Content Below</label>
            <textarea 
              className="input-field" 
              style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.825rem', padding: '1rem' }}
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Question,Type,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Points"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={handleCsvParse}
          >
            Check Data Quality
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <CheckCircle2 size={24} color="var(--success)" /> Questions Ready to Import ({parsedQuestions.length})
          </h3>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {parsedQuestions.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--background)', borderRadius: '1rem', border: '2px dashed var(--border)' }}>
                <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>Add data on the left to see questions here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '0.3rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', textTransform: 'uppercase' }}>
                        {q.type}
                      </span>
                      <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)' }}>{q.points} PTS</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem' }}>{q.question}</p>
                    {q.options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', padding: '0.4rem', borderRadius: '0.25rem', background: opt === q.correct_answer ? 'rgba(16, 185, 129, 0.1)' : 'var(--background)', color: opt === q.correct_answer ? 'var(--success)' : 'inherit', border: opt === q.correct_answer ? '1px solid var(--success)' : '1px solid var(--border)' }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}
                        style={{ background: 'none', color: 'var(--error)', padding: '0.4rem', borderRadius: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {parsedQuestions.length > 0 && (
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '1.25rem', boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.4)' }}
              onClick={commitImport}
              disabled={loading}
            >
              <FileUp size={20} /> {loading ? 'Saving to Database...' : 'Finalize and Import'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImportQuestions;
