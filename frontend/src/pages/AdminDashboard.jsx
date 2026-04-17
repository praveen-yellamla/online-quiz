import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  PlusCircle,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sRes, aRes, stuRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/analytics'),
          api.get('/admin/students')
        ]);
        setStats({ ...sRes.data.stats, ...aRes.data.analytics });
        setStudents(stuRes.data?.students || []);
      } catch (err) {
        console.error('Dashboard synchronization error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Loading Dashboard...</p>
    </div>
  );

  if (!user?.language) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', padding: '2rem', borderRadius: '1rem', display: 'inline-block' }}>
        <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>No Assign Track</h3>
        <p>Your account is not assigned to any language track yet.</p>
        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Please contact the Super Admin to assign you a language track.</p>
      </div>
    </div>
  );

  const statItems = [
    { label: 'Total Track Students', value: stats?.totalStudents || 0, icon: <Users size={20} />, color: '#06b6d4', path: '/admin/students' },
    { label: 'Track Exams Added', value: stats?.totalExams || 0, icon: <FileText size={20} />, color: '#3b82f6', path: '/admin/manage-exams' },
    { label: 'Total Track Attempts', value: stats?.totalAttempts || 0, icon: <CheckCircle size={20} />, color: '#10b981', path: '/admin/attempts' },
    { label: 'Avg Competency', value: `${stats?.avgScore || 0}%`, icon: <TrendingUp size={20} />, color: '#f59e0b' },
  ];

  const performanceData = stats?.timeline?.length > 0 ? stats.timeline : [
    { name: 'N/A', score: 0 }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', padding: '1rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Managing <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{user?.language}</span> students and exams</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
            <Users size={18} /> Students List
          </button>
          <button onClick={() => navigate('/admin/create-exam')} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
            <PlusCircle size={18} /> Create New Exam
          </button>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {statItems.map((item, idx) => (
          <div 
            key={idx} 
            className="card stat-card" 
            style={{ 
              borderLeft: `4px solid ${item.color}`, 
              padding: '1.5rem',
              cursor: item.path ? 'pointer' : 'default',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => item.path && navigate(item.path)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-label" style={{ marginBottom: '0.5rem' }}>{item.label}</p>
                <p className="stat-value" style={{ margin: 0 }}>{item.value}</p>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: `${item.color}15`, color: item.color, borderRadius: '0.5rem' }}>
                {item.icon}
              </div>
            </div>
            {item.path && (
              <div style={{ position: 'absolute', right: '0.5rem', bottom: '0.5rem', opacity: 0.2 }}>
                <ArrowUpRight size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TrendingUp size={20} color="var(--accent)" /> Track Performance Analytics
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '1rem' }} />
                  <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ArrowUpRight size={20} color="var(--success)" /> Top Proficiency Rankings (Track)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '1rem' }}>Rank</th>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {stats?.leaderboard?.map((l, i) => (
                  <tr 
                    key={i} 
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '800', color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>#{i+1}</td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{l.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>{l.score}%</td>
                  </tr>
                ))}
                {!stats?.leaderboard?.length && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No rankings computed yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>Upcoming Deployment Calendar</h3>
            <span style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Next 30 Days</span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {stats?.upcomingExams?.length > 0 ? stats.upcomingExams.map((ex, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--background-alt)', border: '1px solid var(--border)' }}>
                <div style={{ backgroundColor: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid var(--border)', minWidth: '60px' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase' }}>{new Date(ex.start_time).toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '900' }}>{new Date(ex.start_time).getDate()}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{ex.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ex.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ex.duration}m Cluster</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming deployments scheduled.</div>
            )}
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: '#fdfdfd' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Recent Activity Terminal</h3>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {stats?.recentSubmissions?.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{sub.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.exam_title}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: sub.score >= 50 ? 'var(--success)' : 'var(--error)' }}>{sub.score}%</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{new Date(sub.submitted_at).toLocaleDateString()}</div>
                    </td>
                  </tr>
                )) : (
                  <tr><td style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent submissions detected.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AdminDashboard;
