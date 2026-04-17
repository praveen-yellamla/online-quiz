import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Printer,
  FileText
} from 'lucide-react';

const ResultPage = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/student/exams/results/${attemptId}`);
        if (res.data.success) {
          setData(res.data);
          
          // Fetch leaderboard separately and don't let it block
          try {
            const lRes = await api.get(`/student/exams/${res.data.attempt.exam_id}/leaderboard`);
            setLeaderboard(lRes.data.leaderboard || []);
          } catch (lErr) {
            console.warn('Leaderboard fetch suppressed:', lErr);
          }
        }
      } catch (err) {
        console.error('Results fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    if (attemptId) fetchResults();
  }, [attemptId]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !data || !data.attempt) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  const { attempt, questions = [], answers = [] } = data;
  const stats = data.stats || { correct: 0, wrong: 0, attempted: 0, total: questions.length || 0 };
  const isPassed = attempt.score >= (attempt.passing_score || 50);

  const getGrade = (score) => {
    if (score >= 90) return 'SIGMA (EXCELLENT)';
    if (score >= 80) return 'ALPHA (VERY GOOD)';
    if (score >= 70) return 'BETA (GOOD)';
    if (score >= 60) return 'GAMMA (PASS)';
    if (score >= 50) return 'DELTA (PASS)';
    return 'EPSILON (RE-QUALIFY)';
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1100px', margin: '0 auto' }}>
      <header className="no-print" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>Verification Performance Report</h2>
          <p style={{ color: 'var(--text-muted)' }}>Granular breakdown of candidate competency and technical validation metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={18} /> Download PDF / Print
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}>
            Hub Overview
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Success Rate</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: isPassed ? 'var(--success)' : 'var(--error)' }}>{attempt.score}%</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Correct Items</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0 }}>{stats.correct}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ef4444', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Incorrect Submissions</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0 }}>{stats.wrong}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent)', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Attempted</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0 }}>{stats.attempted} / {stats.total}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Score Summary Card */}
        <div>
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '2.5rem 1.5rem', 
            borderTop: `6px solid ${isPassed ? 'var(--success)' : 'var(--error)'}`,
            position: 'sticky',
            top: '2rem'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '2rem', 
              backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              {isPassed ? <Award size={40} color="var(--success)" /> : <XCircle size={40} color="var(--error)" />}
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1, margin: 0 }}>{isPassed ? 'PASSED' : 'FAILED'}</h2>
            <p style={{ fontWeight: '800', color: isPassed ? 'var(--success)' : 'var(--error)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>
              LEVEL: {getGrade(attempt.score)}
            </p>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)', margin: '2rem 0' }} />

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment Title</p>
                <p style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>{attempt.title}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Name</p>
                <p style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>{attempt.student_name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Flag</p>
                <p style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.8rem' }}>{new Date(attempt.submitted_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', fontWeight: '800' }}>Itemized Analysis</h3>
          {questions.map((q, idx) => {
            const studentAnswer = answers.find(a => a.question_id === q.id)?.answer;
            const isCorrect = q.type === 'mcq' 
              ? studentAnswer === q.correct_answer 
              : (studentAnswer?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase());
            
            return (
              <div key={q.id} className="card" style={{ padding: '0', overflow: 'hidden', border: expanded[q.id] ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1.25rem' }}
                  onClick={() => toggleExpand(q.id)}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                    }}>
                      {isCorrect ? <CheckCircle size={18} color="var(--success)" /> : <XCircle size={18} color="var(--error)" />}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>ITEM #{idx + 1}</span>
                      <p style={{ fontWeight: '700', margin: 0, fontSize: '0.925rem' }}>{q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</p>
                    </div>
                  </div>
                  <div>
                    {expanded[q.id] ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {expanded[q.id] && (
                  <div style={{ padding: '0 1.25rem 1.25rem 4.25rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.6, fontWeight: '700', color: 'var(--primary)' }}>Objective Analysis:</p>
                      <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', lineHeight: 1.6 }}>{q.question}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Candidate Intake</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                          {q.type === 'code' ? 'Code Protocol Logged (Expand for detail)' : (studentAnswer || '(Null Input)')}
                        </p>
                      </div>

                      {!isCorrect && (
                        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Validated Pattern</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0, color: 'var(--accent)' }}>{q.correct_answer}</p>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.75rem', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ fontSize: '0.625rem', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Knowledge Base Reference</p>
                        <p style={{ fontSize: '0.825rem', color: '#92400e', lineHeight: 1.6, margin: 0 }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={24} color="var(--accent)" /> Global Leaderboard
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Rank</th>
                <th style={{ padding: '1rem' }}>Candidate</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid var(--border)', 
                  backgroundColor: entry.name === data.attempt.student_name ? 'rgba(6, 182, 212, 0.03)' : 'transparent'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontWeight: '800', 
                      color: idx === 0 ? '#f59e0b' : (idx === 1 ? '#94a3b8' : (idx === 2 ? '#b45309' : 'var(--text-muted)'))
                    }}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '700' }}>
                      {entry.name} {entry.name === data.attempt.student_name && <span style={{ fontSize: '0.6rem', backgroundColor: 'var(--accent)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '0.5rem', marginLeft: '0.5rem' }}>YOU</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: entry.score >= attempt.passing_score ? 'var(--success)' : 'var(--error)' }}>
                    {entry.score}%
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(entry.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No other results yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
