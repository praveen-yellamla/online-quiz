import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Activity, Clock, User, Info } from 'lucide-react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/super-admin/logs');
        console.log("[DEBUG] Audit Logs Response:", res.data);
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>System Audit Trail</h1>
        <p style={{ color: 'var(--text-muted)' }}>High-fidelity activity logging for enterprise-scale administration</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrative Identity</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protocol Action</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operational Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Processing audit stream...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <User size={14} color="var(--accent)" /> {log.user_name}
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '0.25rem', 
                    fontSize: '0.65rem', 
                    fontWeight: '800',
                    background: log.action.includes('CREATE') ? '#f0fdf4' : log.action.includes('TOGGLE') ? '#eff6ff' : '#f8fafc',
                    color: log.action.includes('CREATE') ? '#166534' : log.action.includes('TOGGLE') ? '#1e40af' : '#475569',
                    textTransform: 'uppercase'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.875rem', color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={14} style={{ opacity: 0.5 }} /> {log.details}
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

export default SystemLogs;
