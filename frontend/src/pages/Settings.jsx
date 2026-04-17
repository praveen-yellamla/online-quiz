import React, { useState } from 'react';
import { Lock, Bell, Shield, Smartphone, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      return setMessage({ type: 'error', text: 'Protocol Mismatch: Confirmation password must match new password.' });
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      setMessage({ type: 'success', text: 'Credential Update Successful: Your security token has been refreshed.' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update Rejected: Current credential verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>Infrastructure Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure your security protocols and platform preferences.</p>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Password Security Section */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '1rem', color: 'var(--accent)' }}>
              <Lock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Credential Management</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Update your unique access key to maintain account integrity.</p>
            </div>
          </div>

          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              marginBottom: '1.5rem',
              backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
              fontSize: '0.875rem',
              fontWeight: '700',
              border: '1px solid currentColor'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Current Credential</label>
              <input 
                type="password" 
                className="input-field"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>New Access Key</label>
                <input 
                  type="password" 
                  className="input-field"
                  required
                  value={passwords.next}
                  onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Confirm Policy</label>
                <input 
                  type="password" 
                  className="input-field"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }}>
              {loading ? 'Processing Cryptography...' : 'Update Security Protocol'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', color: 'var(--success)' }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Alert Configurations</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage evaluation reminders and system notifications.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { label: 'Evaluation Reminders', icon: Smartphone },
              { label: 'Infrastructure Updates', icon: Shield },
              { label: 'Performance Analytics Reports', icon: Bell }
            ].map((opt, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <opt.icon size={18} color="var(--text-muted)" />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{opt.label}</span>
                </div>
                <div style={{ width: '40px', height: '20px', background: 'var(--accent)', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
