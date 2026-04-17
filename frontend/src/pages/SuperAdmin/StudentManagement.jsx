import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Filter, Search, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("[DEBUG] Fetching students with language:", languageFilter);
      const res = await api.get(`/super-admin/students?language=${languageFilter}`);
      console.log("[DEBUG] Students response:", res.data);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [languageFilter]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Candidate Roster</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and monitor student performance across all tracks</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', width: '300px' }}
            />
          </div>
          <select 
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="All">All Tracks</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Track</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exams Attempted</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No candidates found matching the criteria.</td></tr>
            ) : filteredStudents.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem' }}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: student.language?.toLowerCase() === 'java' ? '#eff6ff' : student.language?.toLowerCase() === 'python' ? '#f0fdf4' : '#fff7ed',
                    color: student.language?.toLowerCase() === 'java' ? '#1e40af' : student.language?.toLowerCase() === 'python' ? '#166534' : '#9a3412'
                  }}>
                    {student.language?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '700' }}>{student.attempts_count}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.125rem', color: student.avg_score >= 70 ? 'var(--success)' : student.avg_score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                      {Math.round(student.avg_score || 0)}%
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: 'var(--success)', fontWeight: '700', fontSize: '0.75rem' }}>
                      <UserCheck size={14} /> Active
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

export default StudentManagement;
