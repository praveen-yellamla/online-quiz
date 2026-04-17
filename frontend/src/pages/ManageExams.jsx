import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FileText, 
  Clock, 
  BarChart, 
  Send, 
  MoreVertical,
  ChevronRight,
  Eye,
  Download,
  Edit2,
  Trash2
} from 'lucide-react';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/admin/exams');
      setExams(res.data.exams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const publishExam = async (id) => {
    try {
      await api.patch(`/admin/exams/${id}/publish`);
      fetchExams();
    } catch (err) {
      alert('Failed to publish');
    }
  };

  const downloadPDF = async (id, title) => {
    try {
      const response = await api.get(`/admin/exams/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Exam_${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>Manage Exams</h1>
          <p style={{ color: 'var(--text-muted)' }}>Managing all exams for your language track</p>
        </div>
        <button 
          onClick={() => navigate('/admin/create-exam')}
          className="btn btn-primary"
        >
          <FileText size={18} /> Create New Exam
        </button>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Exam Details</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Duration</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Created On</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{exam.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Passing Score: {exam.passing_score}%</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    <Clock size={16} color="var(--accent)" />
                    {exam.duration}m
                  </div>
                  {exam.start_time && (
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Window: {new Date(exam.start_time).toLocaleDateString()} - {exam.end_time ? new Date(exam.end_time).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '0.4rem', 
                    fontSize: '0.625rem', 
                    fontWeight: '800',
                    background: exam.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: exam.status === 'published' ? 'var(--success)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {exam.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {new Date(exam.created_at || Date.now()).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => navigate(`/admin/exam/${exam.id}`)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
                      title="Preview Protocol"
                    >
                      <Eye size={14} />
                    </button>
                    {exam.status === 'draft' && (
                      <>
                        <button 
                          onClick={() => publishExam(exam.id)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', color: 'var(--success)' }}
                        >
                          <Send size={14} /> Publish
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          title="Modify Draft"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('PROTOCOL TERMINATION: Are you certain you want to erase this unpublished cluster?')) {
                              try {
                                await api.delete(`/admin/exams/${exam.id}`);
                                fetchExams();
                              } catch (err) { alert('Termination failed.'); }
                            }
                          }}
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#ef4444' }}
                          title="Erase Cluster"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                       onClick={() => navigate(`/admin/exam/${exam.id}`)}
                    >
                      <BarChart size={14} /> Stats
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.05)' }}
                      onClick={() => downloadPDF(exam.id, exam.title)}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                  <p>No exams currently available.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageExams;
