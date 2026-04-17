import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileCheck,
  Award,
  Bell,
  Zap,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, attemptRes, rankRes] = await Promise.all([
          api.get('/student/exams'),
          api.get('/student/attempts'),
          api.get('/student/rankings')
        ]);
        setExams(examRes.data?.exams || []);
        setPastAttempts(attemptRes.data?.attempts || []);
        setRankings(rankRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (startTime) => {
    const target = new Date(startTime);
    const diff = target - now;
    if (diff <= 0) return null;
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  const handleStartExam = (examId) => {
    if (confirm('Are you sure you want to start this assessment? The proctoring engine will initialize immediately.')) {
      navigate(`/exam/${examId}`);
    }
  };

  const userRank = rankings?.recentRankings?.findIndex(r => r.name === rankings.rankings.find(u => u.avg_score >= 0)?.name) + 1 || '-';

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--primary)' }}>Assessment Command Center</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time evaluation tracking and localized certification metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', background: 'var(--primary)', color: 'white' }}>
             <TrendingUp size={20} />
             <div>
                <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase' }}>Global Track Rank</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '900' }}>#{userRank}</p>
             </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <section>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: '800' }}>
              <Zap size={20} color="#f59e0b" /> Pending Evaluations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {exams.map((exam) => {
                const start = exam.start_time ? new Date(exam.start_time) : null;
                const end = exam.end_time ? new Date(exam.end_time) : null;
                
                const isUpcoming = start && start > now;
                const isExpired = end && end < now;
                const isActive = (!start || start <= now) && (!end || end >= now);
                const hasNotSubmitted = exam.attempt_count === 0 || exam.has_permission;
                const countdown = isUpcoming ? getCountdown(exam.start_time) : null;

                if (exam.attempt_count > 0 && !exam.has_permission) return null;

                return (
                  <div key={exam.id} className="card hover-scale" style={{ 
                    borderLeft: `4px solid ${isActive ? 'var(--success)' : (isUpcoming ? '#f59e0b' : 'var(--border)')}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                         <span style={{ 
                            fontSize: '0.625rem', 
                            fontWeight: '800', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '0.4rem', 
                            backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: isActive ? 'var(--success)' : '#b45309'
                         }}>
                            {isActive ? 'READY FOR DEPLOYMENT' : (isUpcoming ? 'INITIALIZING PROTOCOL' : 'EXPIRED')}
                         </span>
                         {countdown && <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#b45309', fontFamily: 'monospace' }}>{countdown}</div>}
                      </div>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.5rem' }}>{exam.title}</h4>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {exam.duration}m</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={14} /> {exam.passing_score}% Pass</span>
                      </div>
                    </div>
                    
                    <button 
                      disabled={!isActive}
                      onClick={() => handleStartExam(exam.id)} 
                      className="btn btn-primary" 
                      style={{ width: '100%', backgroundColor: isActive ? 'var(--primary)' : 'var(--border)', borderColor: isActive ? 'var(--primary)' : 'var(--border)' }}
                    >
                      {isActive ? 'Begin Assessment' : 'Awaiting Schedule'}
                    </button>
                  </div>
                );
              })}
              {exams.every(e => e.attempt_count > 0 && !e.has_permission) && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1', border: '2px dashed var(--border)', background: 'none' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Operational capacity reached. All current evaluations are completed.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: '800' }}>
              <CheckCircle size={20} color="var(--success)" /> Certification Portfolio
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {pastAttempts.map((attempt) => (
                <div key={attempt.id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <h5 style={{ fontWeight: '800', fontSize: '0.925rem' }}>{attempt.title}</h5>
                       <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: '600' }}>
                          VALIDATED: {new Date(attempt.submitted_at).toLocaleDateString()}
                       </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '1.25rem', fontWeight: '900', color: attempt.score >= 50 ? 'var(--success)' : 'var(--error)' }}>
                          {attempt.score}%
                       </div>
                       <button 
                          onClick={() => navigate(`/results/${attempt.id}`)}
                          style={{ background: 'none', color: 'var(--accent)', border: 'none', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}
                       >
                          Performance Report <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                Activity Stream <Bell size={16} />
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '0.4rem' }}></div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>New Assessment Published</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Advanced Database Integrity is now available.</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', marginTop: '0.4rem' }}></div>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700' }}>Rank Updated</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Your global position improved after last evaluation.</p>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none', padding: '1.5rem' }}>
             <Award size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
             <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Proctoring Compliance</h4>
             <p style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Your integrity record is at 100%. Maintaining this status is critical for certification eligibility across enterprise clients.
             </p>
             <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                TRUST SCORE: <strong>A+ (OPTIMAL)</strong>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
