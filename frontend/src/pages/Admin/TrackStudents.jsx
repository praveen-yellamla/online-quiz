import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, Search, Mail, Calendar, UserCheck, Download } from 'lucide-react';

const TrackStudents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Language', 'Joined On', 'Status'];
    const rows = filteredStudents.map(s => [
      s.name, s.email, s.language, new Date(s.enrolled_at || s.created_at).toLocaleDateString(), s.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_${user?.language}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const lang = user?.language;
        if (!lang) {
          setLoading(false);
          return;
        }
        const res = await api.get(`/admin/students?language=${lang}`);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Failed to fetch track students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>Students List</h1>
          <p style={{ color: 'var(--text-muted)' }}>List of students joined in {user?.language || 'assigned'} track</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={exportToCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> Export Results (CSV)
          </button>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', width: '320px' }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Info</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined On</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving track records...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No localized candidates found.</td></tr>
            ) : filteredStudents.map((stu) => (
              <tr key={stu.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {stu.name.charAt(0)}
                    </div>
                    <div>
                      <span 
                        onClick={() => {
                          console.log("Clicked student:", stu);
                          navigate(`/admin/student/${stu.student_id}`);
                        }}
                        style={{ 
                          fontWeight: '800', 
                          fontSize: '0.925rem', 
                          color: 'var(--primary)', 
                          cursor: 'pointer', 
                          textDecoration: 'underline',
                          display: 'inline-block',
                          position: 'relative',
                          zIndex: 10
                        }}
                      >
                        {stu.name}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {stu.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.7rem', 
                    fontWeight: '800',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    textTransform: 'uppercase'
                  }}>
                    {stu.language}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} /> {new Date(stu.enrolled_at || stu.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', color: stu.status === 'active' ? 'var(--success)' : 'var(--error)', fontWeight: '700', fontSize: '0.75rem' }}>
                    <UserCheck size={14} /> {stu.status === 'active' ? 'ENABLED' : 'DISABLED'}
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

export default TrackStudents;
