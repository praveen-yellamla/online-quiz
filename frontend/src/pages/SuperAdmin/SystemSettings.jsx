import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Settings, Save, ShieldAlert, Database, 
  Trash2, RefreshCcw, Bell, Globe
} from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    maintenance_mode: 'false',
    system_name: 'CGS Assessment Platform',
    allow_registration: 'true',
    notification_email: 'admin@cgs-tech.com'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/super-admin/settings');
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.post('/super-admin/settings', { settings });
      alert('System governance parameters updated successfully.');
    } catch (err) {
      alert('Failed to update system parameters.');
    } finally {
      setSaving(false);
    }
  };

  const purgeAuditLogs = async () => {
    if (!window.confirm('CRITICAL: This will permanently sanitize all administrative audit logs. Proceed?')) return;
    try {
      await api.delete('/super-admin/logs/purge');
      alert('Audit trail successfully sanitized.');
    } catch (err) {
      alert('Sanitization protocol failed.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>System Governance</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configuration of global operational parameters and infrastructure state.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Operation Control */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Settings size={22} color="var(--accent)" />
            <h3 style={{ margin: 0 }}>Operational Parameters</h3>
          </div>

          <div className="input-group">
            <label className="input-label">Platform Identity</label>
            <input 
              type="text" className="input-field" 
              value={settings.system_name} 
              onChange={(e) => setSettings({...settings, system_name: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Governance Contact Email</label>
            <input 
              type="email" className="input-field" 
              value={settings.notification_email}
              onChange={(e) => setSettings({...settings, notification_email: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '0.5rem', background: 'var(--background)', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.925rem' }}>Maintenance Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Restricts platform access to Executive level only.</div>
            </div>
            <button 
              onClick={() => setSettings({...settings, maintenance_mode: settings.maintenance_mode === 'true' ? 'false' : 'true'})}
              style={{
                width: '50px',
                height: '24px',
                borderRadius: '12px',
                background: settings.maintenance_mode === 'true' ? 'var(--error)' : 'var(--border)',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '3px',
                left: settings.maintenance_mode === 'true' ? '29px' : '3px',
                transition: 'all 0.3s'
              }}></div>
            </button>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUpdate} disabled={saving}>
            <Save size={18} /> {saving ? 'Synchronizing...' : 'Commit Settings'}
          </button>
        </div>

        {/* Data Stewardship */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <ShieldAlert size={22} color="var(--error)" />
              <h3 style={{ margin: 0, color: 'var(--error)' }}>Security & Integrity</h3>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              High-privilege actions that affect system-wide data integrity and historical auditing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'space-between', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={purgeAuditLogs}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Trash2 size={18} /> Sanitize Audit Trail
                </div>
                <Database size={16} opacity={0.5} />
              </button>
              
              <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => window.location.reload()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <RefreshCcw size={18} /> Cache Re-index
                </div>
                <Globe size={16} opacity={0.5} />
              </button>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Bell size={22} color="var(--accent)" />
              <h3 style={{ margin: 0 }}>System Notifications</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Executive bulletins and automated alerts regarding technical track performance.
            </p>
            <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)' }}>
              Real-time SMTP integration pending localized infrastructure confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
