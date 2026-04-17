import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Trophy, Clock, Calendar, BarChart, ArrowUpRight, Award } from 'lucide-react';

const ExamAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/super-admin/exam/${id}/analytics`);
        console.log("[DEBUG] Exam Analytics response:", res.data);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch exam analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading high-fidelity analytics...</div>;
  if (!data) return <div style={{ padding: '4rem', textAlign: 'center' }}>Analytics record not found.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate('/super-admin/exams')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '700' }}
      >
        <ChevronLeft size={18} /> Back to Governance
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>{data.exam.language} Track Analysis</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>{data.exam.title}</h1>
        </div>
        <div className="card" style={{ padding: '1rem 2rem', background: 'var(--accent-gradient)', color: 'white', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase' }}>Participation Index</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{data.analytics.length} Candidates</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Trophy size={32} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{Math.max(...data.analytics.map(a => a.score), 0)}%</h3>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Proficiency</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <BarChart size={32} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            {Math.round(data.analytics.reduce((acc, curr) => acc + curr.score, 0) / (data.analytics.length || 1))}%
          </h3>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Performance</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Clock size={32} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            {Math.round(data.analytics.reduce((acc, curr) => acc + curr.time_taken, 0) / (data.analytics.length || 1))}m
          </h3>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Completion Time</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Award size={24} style={{ color: 'var(--accent)' }} /> 
        Candidate Rankings
      </h2>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proficiency Score</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Taken</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {data.analytics.map((attempt) => (
              <tr key={attempt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '800',
                    background: attempt.rank === 1 ? '#fef3c7' : attempt.rank === 2 ? '#f1f5f9' : attempt.rank === 3 ? '#ffedd5' : 'transparent',
                    color: attempt.rank === 1 ? '#92400e' : attempt.rank === 2 ? '#475569' : attempt.rank === 3 ? '#9a3412' : 'var(--text)',
                    fontSize: '0.875rem'
                  }}>
                    {attempt.rank}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '700' }}>{attempt.student_name}</div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: `4px solid ${attempt.score >= 70 ? 'var(--success)' : attempt.score >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
                    fontWeight: '800',
                    fontSize: '0.875rem'
                  }}>
                    {attempt.score}%
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Clock size={14} /> {attempt.time_taken}m
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Calendar size={14} /> {new Date(attempt.submitted_at).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamAnalytics;
