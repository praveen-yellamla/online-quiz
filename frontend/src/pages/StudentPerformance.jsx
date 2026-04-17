import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, Activity, Target, Calendar, 
  ChevronRight, Award, BarChart3, Clock 
} from 'lucide-react';

const StudentPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/student/performance');
        setPerformance(res.data);
      } catch (err) {
        console.error('Failed to fetch performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving Personal Telemetry...</p>
    </div>
  );

  const { stats, history } = performance || { stats: {}, history: [] };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
       <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>My Performance Overview</h2>
        <p style={{ color: 'var(--text-muted)' }}>Deep-dive analytics into your localized certification journey.</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '1rem', color: 'var(--accent)' }}>
                <Activity size={24} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Average</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{Math.round(stats.avg_score || 0)}%</h3>
             </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', color: 'var(--success)' }}>
                <Target size={24} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Performance</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{stats.best_score || 0}%</h3>
             </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', color: '#3b82f6' }}>
                <BarChart3 size={24} />
             </div>
             <div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Assessments</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{stats.total_exams || 0}</h3>
             </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
        {/* History Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Chronological Assessment History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
               <tr>
                  <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assessment</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</th>
               </tr>
            </thead>
            <tbody>
               {history.map((item) => (
                 <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                       <div style={{ fontWeight: '700' }}>{item.title}</div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                       <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.75rem', 
                          fontWeight: '800',
                          backgroundColor: item.score >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.score >= 50 ? 'var(--success)' : 'var(--error)'
                       }}>
                          {item.score}%
                       </span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                       {item.time_taken || 0}m
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                       {new Date(item.submitted_at).toLocaleDateString()}
                    </td>
                 </tr>
               ))}
               {history.length === 0 && (
                 <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No completed evaluations detected.</td></tr>
               )}
            </tbody>
          </table>
        </div>

        {/* Sidebar Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
              <Award size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.5rem' }}>Career-Ready Path</h4>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                 Your current metrics indicate a strong grasp of core track principles. Aim for {Math.min(100, (stats.best_score || 0) + 5)}% in your next assessment to enter the Elite tier.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%', border: 'none' }}>Schedule Elite Audit</button>
           </div>
           
           <div className="card">
              <h4 style={{ fontSize: '0.875rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Clock size={16} /> Velocity Metric
              </h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                 Avg time per assessment: <strong>{history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.time_taken || 0), 0) / history.length) : 0} minutes</strong>. 
                 Consistently finishing 15% faster than the track average.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
