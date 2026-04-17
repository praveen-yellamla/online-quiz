import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, UserPlus, ToggleLeft, ToggleRight, ExternalLink, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', language: 'Java' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/admins');
      console.log("[DEBUG] Admins Response:", res.data);
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const toggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/super-admin/admin/${userId}/status`);
      console.log("[DEBUG] Status Toggle Response:", res.data);
      fetchAdmins();
    } catch (err) {
       console.error('Toggle Error:', err);
       alert('Failed to toggle status');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/super-admin/admin', newAdmin);
      console.log("[DEBUG] Admin Created:", res.data);
      setShowAddAdmin(false);
      setNewAdmin({ name: '', email: '', password: '', language: 'Java' });
      fetchAdmins();
    } catch (err) {
       alert(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const languages = ['Java', 'Python', 'SQL', 'JavaScript'];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Lead Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Universal administrative oversight and localized track governance</p>
        </div>
        <button 
          onClick={() => setShowAddAdmin(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <UserPlus size={20} /> Provision Lead
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Governance Scope</th>
              <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Control Center</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving administrative identities...</td></tr>
            ) : admins.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: '800' }}>
                      {admin.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>{admin.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} /> {admin.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.65rem', fontWeight: '800', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {admin.language || 'Global'}
                    </span>
                  </div>
                </td>
                 <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.7rem', 
                      fontWeight: '800',
                      background: admin.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: admin.status === 'active' ? '#10b981' : '#ef4444'
                    }}>
                      <ShieldCheck size={14} /> {admin.status === 'active' ? 'ENABLED' : 'DISABLED'}
                    </div>
                 </td>
                 <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                     <button 
                       onClick={() => toggleStatus(admin.id)}
                       style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                     >
                       {admin.status === 'active' ? <ToggleRight color="#06b6d4" size={28} /> : <ToggleLeft size={28} />}
                     </button>
                    <button 
                      onClick={() => navigate(`/super-admin/admin/${admin.id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }} onClick={() => setShowAddAdmin(false)} />
          <div className="card shadow-2xl" style={{ position: 'relative', width: '100%', maxWidth: '34rem', padding: '2.5rem', animation: 'scaleIn 0.3s ease-out' }}>
             <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--primary)' }}>Provision Lead Administrator</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Delegating localized track governance and candidate oversight.</p>
             
             <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className="input-group">
                 <label className="input-label">Identity Name</label>
                 <input className="input-field" type="text" placeholder="e.g. Lead Developer" required value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} />
               </div>
               <div className="input-group">
                 <label className="input-label">Corporate Email</label>
                 <input className="input-field" type="email" placeholder="lead@crestonix.com" required value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
               </div>
               <div className="input-group">
                 <label className="input-label">Governance Credentials (Password)</label>
                 <input className="input-field" type="password" required value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
               </div>
               
               <div>
                 <label className="input-label">Localized Track (Governance Scope)</label>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                   {languages.map(lang => (
                     <button
                       key={lang}
                       type="button"
                       onClick={() => setNewAdmin({ ...newAdmin, language: lang })}
                       style={{
                         padding: '0.75rem',
                         borderRadius: '0.75rem',
                         border: '2px solid',
                         fontSize: '0.875rem',
                         fontWeight: '800',
                         backgroundColor: newAdmin.language === lang ? 'rgba(6, 182, 212, 0.05)' : 'white',
                         borderColor: newAdmin.language === lang ? 'var(--accent)' : 'var(--border)',
                         color: newAdmin.language === lang ? 'var(--accent)' : 'var(--text-muted)',
                         cursor: 'pointer',
                         transition: 'all 0.2s'
                       }}
                     >
                       {lang}
                     </button>
                   ))}
                 </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                 <button type="button" onClick={() => setShowAddAdmin(false)} className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>Discard</button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>Provision Identity</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
