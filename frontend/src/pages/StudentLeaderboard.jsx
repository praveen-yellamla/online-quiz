import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Trophy, Medal, Users, TrendingUp, 
  ChevronRight, Award 
} from 'lucide-react';

const StudentLeaderboard = () => {
  const [data, setData] = useState({ rankings: [], recentRankings: [], recentExam: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('total'); // 'total' or 'recent'

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await api.get('/student/rankings');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch rankings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Synthesizing Localized Standings...</p>
    </div>
  );

  const displayRanks = activeTab === 'total' ? data.rankings : data.recentRankings;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{data.track?.toUpperCase()} Standings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Localized competitive metrics for your technology pillar.</p>
        </div>
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.4rem', borderRadius: '0.8rem', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('total')}
            style={{ 
              padding: '0.6rem 1.25rem', borderRadius: '0.6rem', border: 'none', fontSize: '0.8rem', fontWeight: '700',
              background: activeTab === 'total' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'total' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Total Excellence
          </button>
          <button 
            onClick={() => setActiveTab('recent')}
            style={{ 
              padding: '0.6rem 1.25rem', borderRadius: '0.6rem', border: 'none', fontSize: '0.8rem', fontWeight: '700',
              background: activeTab === 'recent' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'recent' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Recent Activity
          </button>
        </div>
      </header>

      {activeTab === 'recent' && data.recentExam && (
        <div className="card" style={{ marginBottom: '2rem', background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
          <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase' }}>Most Recent Assessment</h4>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem' }}>{data.recentExam.title}</h3>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[0, 1, 2].map(idx => {
          const rank = displayRanks[idx];
          if (!rank) return null;
          return (
            <div key={idx} className="card" style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              border: idx === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.625rem', fontWeight: '900', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                RANK {idx + 1}
              </div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '800' }}>{rank.name}</h4>
              <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>{Math.round(rank.avg_score || rank.score)}%</div>
              {activeTab === 'recent' && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Finished in {rank.time_taken_seconds 
                    ? `${Math.floor(rank.time_taken_seconds / 60)}m ${rank.time_taken_seconds % 60}s` 
                    : `${rank.time_taken || 0}m 0s`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</th>
              <th style={{ padding: '1rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</th>
              <th style={{ padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {activeTab === 'total' ? 'Assessments' : 'Duration'}
              </th>
              <th style={{ padding: '1rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {activeTab === 'total' ? 'Mean Score' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRanks.map((rank, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 2rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i < 3 ? 'var(--accent)' : 'var(--background)', color: i < 3 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '800' }}>
                    {i + 1}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {rank.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: '700' }}>{rank.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {activeTab === 'total' ? rank.total_exams : (
                    rank.time_taken_seconds 
                      ? `${Math.floor(rank.time_taken_seconds / 60)}m ${rank.time_taken_seconds % 60}s` 
                      : `${rank.time_taken || 0}m 0s`
                  )}
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
                    {Math.round(rank.avg_score || rank.score)}%
                  </span>
                </td>
              </tr>
            ))}
            {displayRanks.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No localized standings found in this tier.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentLeaderboard;
