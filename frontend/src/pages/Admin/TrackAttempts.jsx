import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { History, Search, FileText, User, Calendar, Award } from 'lucide-react';

const TrackAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await api.get(`/admin/attempts?language=${user?.language}`);
        setAttempts(res.data.attempts);
      } catch (err) {
        console.error('Failed to fetch track attempts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.language) fetchAttempts();
  }, [user]);

  const filteredAttempts = attempts.filter(a => 
    a.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>Validated Submission Log</h1>
          <p style={{ color: 'var(--text-muted)' }}>Historical audit of all assessment attempts within the {user?.language} track.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem', width: '320px' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment Protocol</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Vector</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Synchronizing track submissions...</td></tr>
            ) : filteredAttempts.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No historical submissions found.</td></tr>
            ) : filteredAttempts.map((att) => (
              <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} color="var(--accent)" />
                    <span style={{ fontWeight: '700', fontSize: '0.925rem' }}>{att.student_name}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem' }}>{att.exam_title}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={16} color={att.score >= 50 ? 'var(--success)' : 'var(--error)'} />
                    <span style={{ fontWeight: '800', fontSize: '0.925rem', color: att.score >= 50 ? 'var(--success)' : 'var(--error)' }}>
                      {att.score}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Calendar size={14} /> {new Date(att.submitted_at).toLocaleString()}
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

export default TrackAttempts;
