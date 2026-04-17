import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Search, 
  ExternalLink, 
  FileDown, 
  Shield,
  Layers,
  Filter
} from 'lucide-react';

const ExamHistory = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState(user?.role === 'admin' ? user.language : 'All');
  const [sortOrder, setSortOrder] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, trackFilter, sortOrder]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/exams/history', {
        params: {
          track: trackFilter,
          search: searchTerm,
          sort: sortOrder
        }
      });
      setExams(res.data.exams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (id, title) => {
    try {
      const response = await api.get(`/admin/exams/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Exam_Paper_${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={32} color="var(--primary)" />
          Exam Lifecycle History
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Historical audit of all assessments across tracks</p>
      </header>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem', 
        marginBottom: '2rem',
        background: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by title..."
              className="input-field"
              style={{ marginBottom: 0, paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {user?.role === 'super_admin' ? (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <select 
                className="input-field" 
                style={{ marginBottom: 0 }}
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
              >
                <option value="All">All Tracks</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '800', color: 'var(--accent)' }}>
              <Filter size={16} style={{ marginRight: '0.5rem' }} />
              TRACK: {user?.language?.toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: '150px' }}>
            <select 
              className="input-field" 
              style={{ marginBottom: 0 }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest Created</option>
              <option value="oldest">Oldest Created</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.25rem' }}>
          <Layers size={16} /> {exams.length} Records Found
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assessment</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Created By</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Track</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Sync Date</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Lifecycle Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</td></tr>
            ) : exams.map((exam) => (
              <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>{exam.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <Shield size={12} /> ID: EXM-{exam.id.toString().padStart(4, '0')}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{exam.created_by}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: exam.track === 'java' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: exam.track === 'java' ? '#ef4444' : 'var(--success)',
                    textTransform: 'uppercase'
                  }}>
                    {exam.track}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                  {new Date(exam.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => navigate(`/admin/exam/${exam.id}`)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ExternalLink size={14} /> View Details
                    </button>
                    <button 
                      onClick={() => downloadPDF(exam.id, exam.title)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <FileDown size={14} /> Download PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && exams.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <History size={48} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                  <p style={{ fontWeight: '600' }}>No historical records found for this filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamHistory;
