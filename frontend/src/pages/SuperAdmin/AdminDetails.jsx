import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Shield, Mail, Globe, Book, TrendingUp, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';

const AdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/super-admin/admin/${id}`);
        console.log("[DEBUG] Admin Details Response:", res.data);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const toggleStatus = async () => {
    try {
      const res = await api.patch(`/super-admin/admin/${id}/status`);
      setData({ ...data, admin: { ...data.admin, status: res.data.user.status } });
    } catch (err) {
      alert('Failed to update administrative status');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Retrieving administrative identity...</div>;
  if (!data || !data.admin) return <div style={{ padding: '4rem', textAlign: 'center' }}>Administrative record not found.</div>;

  const { admin, exams } = data;

  return (
    <div style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate('/super-admin/admins')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', fontWeight: '700' }}
      >
        <ChevronLeft size={18} /> Administrative Oversight
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '1.5rem', 
              background: 'var(--accent-gradient)', 
              color: 'white', 
              margin: '0 auto 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800'
            }}>
              {admin.name.charAt(0)}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.25rem' }}>{admin.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{admin.email}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>
                {admin.language || 'Global'}
              </span>
            </div>

            <button 
               onClick={toggleStatus}
               className={`btn ${admin.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
               style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {admin.status === 'active' ? <UserMinus size={18} /> : <UserPlus size={18} />}
              {admin.status === 'active' ? 'Revoke Access' : 'Grant Access'}
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Deployment Statistics</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#f0fdf4', color: '#166534', borderRadius: '0.75rem' }}>
                <Book size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{admin.exams_created}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exams Created</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--accent)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>Delegated Assessments</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exam Title</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scope</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attempts</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Governance</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>{exam.title}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{exam.language}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '800' }}>{exam.attempts}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => navigate(`/super-admin/exam/${exam.id}`)}
                        style={{ border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem' }}>
                        View Analytics
                      </button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No assessments currently delegated to this lead.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;
