import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, TrendingUp, Users, Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamManagement = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/exams');
      console.log("[DEBUG] Exams response:", res.data);
      setExams(res.data.exams || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Exam Governance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Universal assessment catalog and localized performance indices</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Library Volume</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{exams.length} Protocols</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Global Avg Score</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
              {exams.length > 0 ? Math.round(exams.reduce((acc, e) => acc + (e.avg_score || 0), 0) / exams.length) : 0}%
            </h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: '#fff7ed', color: '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Total Participation</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{exams.reduce((acc, e) => acc + (e.total_attempts || 0), 0)} Attempts</h3>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment Title</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Track</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Lead</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attempts</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Score</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading exam data...</td></tr>
            ) : exams.map((exam) => (
              <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text)' }}>{exam.title}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem' }}>EID: #{exam.id.toString().padStart(4, '0')}</div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: '#f1f5f9',
                    color: 'var(--text)'
                  }}>
                    {exam.language}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', fontWeight: '600' }}>{exam.creator_name}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '700' }}>{exam.total_attempts}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', color: exam.avg_score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                    {Math.round(exam.avg_score || 0)}%
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontWeight: '800', color: 'var(--accent)' }}>
                    {exam.top_score || 0}%
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => navigate(`/super-admin/exam/${exam.id}`)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamManagement;
