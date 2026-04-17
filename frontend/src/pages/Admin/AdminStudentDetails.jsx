import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  User, Mail, Shield, Calendar, 
  ArrowLeft, Award, CheckCircle, Clock
} from 'lucide-react';

const AdminStudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/student/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Student not found in repository.' : 'Communication failure with candidate hub.');
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

  if (error || !data || !data.student) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', padding: '2rem', borderRadius: '1rem', display: 'inline-block' }}>
        <p style={{ fontWeight: '700' }}>{error || 'Student not found'}</p>
        <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Return to Students Hub</button>
      </div>
    </div>
  );

  const { student, performance, attempts } = data;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/admin/students')} className="btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>Candidate Profile</h2>
            <p style={{ color: 'var(--text-muted)' }}>Professional competency and performance oversight</p>
          </div>
        </div>
      </header>

      {/* SECTION 1: BASIC INFO */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, white 0%, #f9fafb 100%)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '2rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800' }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{student.name}</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Mail size={14} /> {student.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Calendar size={14} /> Joined {new Date(student.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '3rem', display: 'flex', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Assessment Track</p>
              <span style={{ fontSize: '0.875rem', fontWeight: '800', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.4rem 1rem', borderRadius: '2rem', textTransform: 'uppercase' }}>
                {student.track}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PERFORMANCE SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent)', padding: '1.5rem' }}>
          <p className="stat-label">Average Score</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{performance.avgScore}%</p>
            <Award size={24} style={{ opacity: 0.1 }} />
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)', padding: '1.5rem' }}>
          <p className="stat-label">Best Score</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{performance.bestScore}%</p>
            <CheckCircle size={24} style={{ opacity: 0.1 }} />
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
          <p className="stat-label">Total Attempts</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="stat-value">{performance.totalAttempts}</p>
            <Clock size={24} style={{ opacity: 0.1 }} />
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT ATTEMPTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800' }}>Recent Assessment History</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
              <th style={{ padding: '1.25rem 2rem' }}>Exam Name</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>Score</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>Proctoring</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>Duration</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((exam, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.5rem 2rem', fontWeight: '700' }}>{exam.exam_name}</td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: exam.score >= 50 ? 'var(--success)' : 'var(--error)' }}>
                    {exam.score}%
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                    {exam.violation_count > 0 ? (
                      <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '800' }}>
                        {exam.violation_count} VIOLATIONS
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.625rem', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: '800' }}>
                        SECURE
                      </span>
                    )}
                    {exam.termination_reason && <div style={{ fontSize: '0.6rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '700' }}>AUTO-TERMINATED</div>}
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>
                  {exam.time_taken_seconds ? `${Math.floor(exam.time_taken_seconds / 60)}m ${exam.time_taken_seconds % 60}s` : `${exam.date}m`}
                </td>
                <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(exam.date).toLocaleDateString()}</span>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.625rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                      onClick={async () => {
                        if (confirm(`Authorize second attempt for ${exam.exam_name}?`)) {
                          try {
                            await api.post('/admin/students/grant-retake', { studentId: id, examId: exam.exam_id });
                            alert('Assessment protocol reset. Candidate may re-initialize session.');
                          } catch (err) { 
                            alert(err.response?.data?.message || 'Authorization failure.'); 
                          }
                        }
                      }}
                    >
                      Grant Re-attempt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No attempts recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudentDetails;
