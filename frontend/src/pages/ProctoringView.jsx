import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Camera, User, Clock, AlertTriangle, ShieldCheck, 
  ChevronLeft, ExternalLink, Maximize2, ShieldAlert
} from 'lucide-react';

const ProctoringView = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    api.get(`/admin/proctoring/${attemptId}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        alert('Failed to load proctoring logs');
        navigate('/results');
      });
  }, [attemptId]);

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  if (!data || !data.attempt) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error)' }}>Session Not Found</h2>
        <p>The requested proctoring session does not exist or has no recorded data.</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>Integrity Verification</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Proctoring logs for session ID {attemptId}</p>
          </div>
        </div>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <ShieldCheck size={16} /> MONITORING VERIFIED
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Panel: Identity */}
        <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--accent)" /> Identity Match
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Base Profile Reference</p>
                <div style={{ aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid var(--border)', backgroundColor: '#f1f5f9' }}>
                  <img 
                    src={data.attempt.profile_image_url || `https://ui-avatars.com/api/?name=${data.attempt.name}`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectCover: 'cover', filter: 'grayscale(0.5)' }}
                  />
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Access Point Capture</p>
                <div style={{ aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid var(--accent)', backgroundColor: '#0f172a' }}>
                  <img 
                    src={data.attempt.exam_start_image_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400'} 
                    alt="Start" 
                    style={{ width: '100%', height: '100%', objectCover: 'cover' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>{data.attempt.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem 0' }}>{data.attempt.email}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Violations</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '800', 
                  color: data.attempt.cheating_violations > 0 ? 'var(--error)' : 'var(--success)',
                  backgroundColor: data.attempt.cheating_violations > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '1rem'
                }}>
                  {data.attempt.cheating_violations} Recorded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Timeline */}
        <div className="card" style={{ padding: '1.5rem', minHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} color="var(--accent)" /> Performance Timeline
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{data.logs.length} Monitoring Events</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {data.logs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => setSelectedImage(log.image_url)}
                className="hover-scale"
                style={{ 
                  position: 'relative', 
                  aspectRatio: '4/3', 
                  borderRadius: '0.5rem', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border)',
                  cursor: 'zoom-in',
                  transition: 'all 0.2s'
                }}
              >
                <img src={log.image_url} alt="Log" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                
                {log.violation_type !== 'periodic' && (
                  <div style={{ position: 'absolute', top: '0.25rem', left: '0.25rem', padding: '0.125rem 0.4rem', backgroundColor: 'var(--error)', color: 'white', fontSize: '0.5rem', fontWeight: '800', borderRadius: '0.25rem' }}>
                    {log.violation_type.toUpperCase()}
                  </div>
                )}
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.25rem', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {data.logs.length === 0 && (
            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <ShieldAlert size={48} />
              <p style={{ marginTop: '1rem', fontWeight: '600' }}>No monitoring events recorded.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Viewer */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
            <img src={selectedImage} alt="Large" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} />
            <p style={{ color: 'white', textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringView;
