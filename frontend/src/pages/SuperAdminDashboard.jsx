import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BookOpen, Clock, Activity, Settings, 
  UserPlus, Shield, ToggleLeft, ToggleRight, Trash2,
  CheckCircle2, AlertCircle, Search, BarChart3, LogOut,
  ArrowRight, Layers
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', language: 'Java' });
  const [logs, setLogs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ maintenance_mode: 'false', pass_percentage: '50' });

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, aRes, lRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/admins'),
        api.get('/super-admin/logs')
      ]);
      
      setStats(sRes.data.stats);
      setAdmins(aRes.data.admins);
      setLogs(lRes.data.logs);
    } catch (err) {
      console.error('Fetch entirely failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/super-admin/settings');
      if (res.data.settings) {
        setSettings(res.data.settings);
        setMaintenance(res.data.settings.maintenance_mode === 'true');
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await api.patch('/super-admin/settings', { settings: newSettings });
      setSettings(prev => ({ ...prev, ...newSettings }));
      if (newSettings.maintenance_mode !== undefined) {
         setMaintenance(newSettings.maintenance_mode === 'true');
      }
      fetchData(); // Refresh logs to show update
    } catch (err) {
      alert('Failed to update system governance');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      // Corrected matching plural/singular API
      await api.post('/super-admin/admin', newAdmin);
      setShowAddAdmin(false);
      setNewAdmin({ name: '', email: '', password: '', language: 'Java' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const toggleStatus = async (userId) => {
    try {
      await api.patch(`/super-admin/admin/${userId}/status`);
      fetchData();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const languages = ['Java', 'Python', 'SQL', 'JavaScript'];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)' }}>System Oversight</h2>
          <p style={{ color: 'var(--text-muted)' }}>Crestonix Global Solutions | Infrastructure Management</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            <Activity size={18} color={maintenance ? '#ef4444' : '#10b981'} />
            System: {maintenance ? 'Maintenance' : 'Operational'}
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <Settings size={20} /> Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: '#06b6d4', path: '/super-admin/students' },
          { label: 'Total Admins', value: stats?.totalAdmins || 0, icon: Shield, color: '#3b82f6', path: '/super-admin/admins' },
          { label: 'Total Exams', value: stats?.totalExams || 0, icon: BookOpen, color: '#a855f7', path: '/super-admin/exams' },
          { label: 'Total Attempts', value: stats?.totalAttempts || 0, icon: CheckCircle2, color: '#f59e0b', path: '/super-admin/exams' }
        ].map((item, i) => (
          <div 
            key={i} 
            className="card stat-card" 
            style={{ borderLeft: `4px solid ${item.color}`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onClick={() => navigate(item.path)}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ padding: '0.75rem', backgroundColor: `${item.color}15`, color: item.color, borderRadius: '0.75rem' }}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="stat-label">{item.label}</p>
                <h3 className="stat-value" style={{ marginTop: '0.25rem' }}>{item.value}</h3>
              </div>
            </div>
            <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', color: 'var(--text-muted)', opacity: 0.3 }}>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers size={22} color="var(--accent)" /> Localized Track Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {['Java', 'Python', 'JavaScript'].map(track => (
            <div 
              key={track} 
              className="card" 
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer', 
                border: '1px solid var(--border)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onClick={() => navigate(`/super-admin/students?language=${track}`)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: track === 'Java' ? '#eff6ff' : track === 'Python' ? '#f0fdf4' : '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: track === 'Java' ? '#1e40af' : track === 'Python' ? '#166534' : '#9a3412',
                fontWeight: '800'
              }}>
                {track[0]}
              </div>
              <div style={{ fontWeight: '800' }}>{track} Track</div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>View Localized Roster</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Admin Management */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} color="#3b82f6" />
              Lead Identity Overseer
            </h3>
            <button 
              onClick={() => navigate('/super-admin/admins')}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Manage All Leads
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Admin Name</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Scope</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: '700', fontSize: '0.75rem' }}>
                          {admin.name[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '0.875rem', margin: 0 }}>{admin.name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.625rem', fontWeight: '700', borderRadius: '0.25rem' }}>
                          {admin.language || 'Global'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                       <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        padding: '0.25rem 0.6rem', 
                        backgroundColor: admin.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: admin.status === 'active' ? '#10b981' : '#ef4444', 
                        fontSize: '0.725rem', 
                        fontWeight: '800', 
                        borderRadius: '9999px',
                        textTransform: 'uppercase'
                      }}>
                        {admin.status === 'active' ? 'Enabled' : 'Disabled'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleStatus(admin.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {admin.status === 'active' ? <ToggleRight color="#06b6d4" size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={20} color="#f59e0b" />
              Live Audit Trail
            </h3>
            <button onClick={() => navigate('/super-admin/logs')} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {logs.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity recorded.</p> : logs.slice(0, 8).map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexShrink: 0, width: '0.5rem', height: '0.5rem', marginTop: '0.35rem', backgroundColor: '#06b6d4', borderRadius: '9999px', boxShadow: '0 0 0 4px rgba(6, 182, 212, 0.05)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: '1.4', margin: 0 }}>
                    <span style={{ fontWeight: '700' }}>{log.user_name || 'System'}</span> {log.details}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

       {/* Settings Modal */}
       {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }} onClick={() => setShowSettings(false)} />
          <div className="card shadow-2xl" style={{ position: 'relative', width: '100%', maxWidth: '34rem', padding: '2.5rem', animation: 'scaleIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Settings size={24} /> Infrastructure Governance
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                 <div>
                   <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: '800' }}>Maintenance Protocol</h4>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Universally lock the ecosystem for infrastructure upgrades.</p>
                 </div>
                 <button 
                   onClick={() => handleUpdateSettings({ maintenance_mode: maintenance ? 'false' : 'true' })}
                   style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                 >
                   {maintenance ? <ToggleRight color="#ef4444" size={36} /> : <ToggleLeft color="var(--text-muted)" size={36} />}
                 </button>
               </div>

               <div className="input-group">
                 <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                   Performance Benchmark (Pass %)
                   <span style={{ color: 'var(--accent)', fontWeight: '800' }}>{settings.pass_percentage}%</span>
                 </label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   step="5"
                   style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '1rem', accentColor: 'var(--accent)' }}
                   value={settings.pass_percentage}
                   onChange={e => setSettings({ ...settings, pass_percentage: e.target.value })}
                   onMouseUp={() => handleUpdateSettings({ pass_percentage: settings.pass_percentage })}
                 />
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sets the global threshold for successful candidate certification.</p>
               </div>

               <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                 <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.925rem', fontWeight: '800', color: '#ef4444' }}>Critical Actions</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>Transactional Sanitization</p>
                       <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flush existing audit logs to reclaim memory.</p>
                     </div>
                     <button 
                       onClick={async () => {
                         if(window.confirm('IRREVERSIBLE: Execute system-wide log sanitization?')) {
                            try {
                               await api.delete('/super-admin/logs');
                               fetchData();
                               alert('Log sanitization protocol finalized.');
                            } catch (e) {
                               alert('Sanitization protocol failed.');
                            }
                         }
                       }}
                       className="btn btn-secondary" 
                       style={{ fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                     >
                       Execute Purge
                     </button>
                   </div>
                 </div>
               </div>

               <button 
                 onClick={() => setShowSettings(false)}
                 className="btn btn-primary"
                 style={{ width: '100%', padding: '1rem' }}
               >
                 Close Governance Portal
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAddAdmin(false)} />
          <div className="card shadow-2xl" style={{ position: 'relative', width: '100%', maxWidth: '32rem', padding: '2rem', animation: 'scaleIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>Create Sub-Admin</h2>
            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  required
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Work Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="s.connor@crestonix.com"
                  required
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Initial Access Password</label>
                <input
                  className="input-field"
                  type="password"
                  required
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>
              
              <div>
                <label className="input-label">Delegated Programming language</label>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setNewAdmin({ ...newAdmin, language: lang })}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        backgroundColor: newAdmin.language === lang ? 'rgba(6, 182, 212, 0.05)' : 'white',
                        borderColor: newAdmin.language === lang ? 'var(--accent)' : 'var(--border)',
                        color: newAdmin.language === lang ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Create Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
