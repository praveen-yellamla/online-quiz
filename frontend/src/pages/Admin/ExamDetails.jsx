import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, Users, TrendingUp, CheckCircle, 
  ArrowLeft, Clock, Award, Shield, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/admin/exam/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  if (!data) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
      <h3>Exam Repository Not Found</h3>
      <button onClick={() => navigate('/admin/exams')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        Return to Library
      </button>
    </div>
  );

  const { exam, questions, attempts, stats } = data;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '4rem' }}>
      <button 
        onClick={() => navigate('/admin/exams')} 
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontWeight: '600' }}
      >
        <ArrowLeft size={18} /> Back to Library
      </button>

      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
            {exam.language} Infrastructure • {exam.status?.toUpperCase()}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', margin: '0.75rem 0' }}>{exam.title}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {exam.duration} Minutes</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Award size={16} /> {exam.passing_score}% Passing Benchmark</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={16} /> Created by {exam.creator_name}</span>
          </div>
        </div>
        {exam.status === 'draft' && (
          <button 
            className="btn btn-primary"
            onClick={async () => {
              if (confirm('Transition this assessment cluster to LIVE production status? This action is immutable.')) {
                try {
                  await api.patch(`/admin/exams/${id}/publish`);
                  alert('Certification module is now LIVE.');
                  window.location.reload();
                } catch (err) {
                  alert('Publication failure: Verify question integrity.');
                }
              }
            }}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            <CheckCircle size={20} /> Publish Assessment
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <p className="stat-label">Total Validated Attempts</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{stats.attempts}</p>
            <Users size={32} style={{ opacity: 0.1 }} />
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <p className="stat-label">Cumulative Avg Score</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{stats.avg_score}%</p>
            <TrendingUp size={32} style={{ opacity: 0.1 }} />
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="stat-label">Peak Performance</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{stats.top_score}%</p>
            <CheckCircle size={32} style={{ opacity: 0.1 }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent)" /> Proficiency Distribution
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scoreDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="var(--accent)" fill="rgba(6, 182, 212, 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#ef4444" /> Structural Weakness Analytics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.troubleQuestions?.length > 0 ? data.troubleQuestions.map((q, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#fdf2f2', border: '1px solid #fee2e2', borderRadius: '0.5rem' }}>
                <div style={{ maxWidth: '70%' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#991b1b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: '800', color: '#dc2626' }}>{q.failRate}% Failed</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No significant knowledge gaps detected.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '3rem', padding: '1.5rem 2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} color="var(--accent)" /> High Proficiency Leaderboard (Top 5)
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[...attempts].sort((a,b) => b.score - a.score).slice(0, 5).map((att, i) => (
            <div key={att.id} style={{ flex: 1, minWidth: '180px', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '1.5rem', fontWeight: '900', color: i < 3 ? 'var(--accent)' : 'var(--border)', opacity: 0.3 }}>#{i+1}</span>
              <p style={{ fontWeight: '700', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{att.student_name}</p>
              <p style={{ fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{att.score}%</p>
            </div>
          ))}
          {attempts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No telemetry data available for rankings.</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>Candidate Submission Log</h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Candidate</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Submission Time</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{att.student_name}</td>
                    <td style={{ padding: '1rem', fontWeight: '800', color: att.score >= exam.passing_score ? 'var(--success)' : 'var(--error)' }}>
                      {att.score}%
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.625rem', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontWeight: '800',
                        backgroundColor: att.score >= exam.passing_score ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: att.score >= exam.passing_score ? 'var(--success)' : 'var(--error)'
                      }}>
                        {att.score >= exam.passing_score ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(att.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No submissions detected for this protocol.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>Protocol Question Inventory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q, idx) => (
              <div key={q.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: '800', backgroundColor: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>Q{idx + 1}</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase' }}>{q.type}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.925rem', fontWeight: '600', lineHeight: '1.5' }}>{q.question}</p>
                {q.type === 'mcq' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {q.options.map((opt, i) => (
                      <span key={i} style={{ 
                        fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', border: '1px solid var(--border)',
                        backgroundColor: opt === q.correct_answer ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: opt === q.correct_answer ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: opt === q.correct_answer ? '700' : '400'
                      }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
