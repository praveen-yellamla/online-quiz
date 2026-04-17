import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, User, BookOpen, ShieldAlert, Bell, Filter, RefreshCcw } from 'lucide-react';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket Connection
    const s = io('http://localhost:5001');
    setSocket(s);

    s.on('connect', () => {
      console.log('Proctoring socket connected.');
      // Signal to join the specific track room
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        s.emit('join_track', { language: user.language, role: user.role });
      }
    });

    s.on('new_cheat_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      // Play a subtle notification sound if possible
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    });

    return () => s.disconnect();
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/alerts');
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = filter === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const getAlertColor = (type) => {
    switch(type) {
      case 'TAB_SWITCH': return '#ef4444';
      case 'WINDOW_BLUR': return '#f59e0b';
      case 'EXIT_FULLSCREEN': return '#3b82f6';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
           <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={36} color="#ef4444" /> Real-Time Proctoring Control
           </h2>
           <p style={{ color: 'var(--text-muted)' }}>Monitoring live assessment integrity across all tracks.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={fetchAlerts} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
              <RefreshCcw size={18} /> Sync Registry
           </button>
           <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
              <span style={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Live</span>
           </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Violations</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{alerts.length}</h3>
         </div>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Window Defocus</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{alerts.filter(a => a.type === 'WINDOW_BLUR').length}</h3>
         </div>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fullscreen Breach</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{alerts.filter(a => a.type === 'EXIT_FULLSCREEN').length}</h3>
         </div>
         <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tab Deviations</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{alerts.filter(a => a.type === 'TAB_SWITCH').length}</h3>
         </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Cheating Registry</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '700' }}
            >
              <option value="ALL">All Categories</option>
              <option value="TAB_SWITCH">Tab Switching</option>
              <option value="WINDOW_BLUR">Focus Loss</option>
              <option value="EXIT_FULLSCREEN">Fullscreen Exit</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Operative</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Assessment</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Violation Category</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Precise Timestamp</th>
              <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAlerts.length > 0 ? filteredAlerts.map((alert, idx) => (
                <motion.tr 
                  key={alert.id || idx}
                  initial={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  animate={{ backgroundColor: 'transparent' }}
                  transition={{ duration: 2 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="var(--text-muted)" />
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{alert.student_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={16} color="var(--accent)" />
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{alert.exam_title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <span style={{ 
                      padding: '0.375rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.625rem', 
                      fontWeight: '900', 
                      backgroundColor: `${getAlertColor(alert.type)}15`,
                      color: getAlertColor(alert.type),
                      border: `1px solid ${getAlertColor(alert.type)}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <Clock size={14} />
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: '800', fontSize: '0.75rem' }}>LOGGED</span>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p style={{ fontWeight: '700' }}>No integrity violations detected in the current cluster.</p>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default AdminAlerts;
