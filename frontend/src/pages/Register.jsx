import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Code, ArrowRight, Loader2, ShieldCheck, Camera, Upload } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'JavaScript'
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileImage) {
      setError('Please upload a profile photo for identity verification.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register({ ...formData, profile_image: profileImage });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. System could not synchronize identity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '2rem'
      }}>
      
      <div className="card" style={{ 
          maxWidth: '900px', 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          padding: 0, 
          overflow: 'hidden',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
        
        {/* Left: Verification */}
        <div style={{ 
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #334155'
          }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Profile Image</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Upload a professional headshot. This will be used for automated identity matching during assessments.</p>
          </div>
          
          <div style={{ position: 'relative', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {profileImage ? (
              <img src={profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <Camera size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <button type="button" onClick={() => document.getElementById('imageUpload').click()} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                  <Upload size={14} /> Upload Image
                </button>
              </>
            )}
            <input 
              id="imageUpload" 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setProfileImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          {profileImage && (
            <button 
              onClick={() => setProfileImage(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}
            >
              Clear and change
            </button>
          )}
        </div>

        {/* Right: Info */}
        <div style={{ padding: '3rem', background: '#ffffff' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Join CGS</h1>
            <p style={{ color: '#64748b' }}>Start your career assessment today.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '1rem', top: '2.4rem', color: '#64748b' }} />
              <label className="input-label">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '2.4rem', color: '#64748b' }} />
              <label className="input-label">Email Address</label>
              <input
                type="email"
                placeholder="candidate@example.com"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '2.4rem', color: '#64748b' }} />
              <label className="input-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Code size={20} style={{ position: 'absolute', left: '1rem', top: '2.4rem', color: '#64748b' }} />
              <label className="input-label">Primary Stack</label>
              <select
                className="input-field"
                style={{ paddingLeft: '3rem', appearance: 'auto' }}
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="SQL">SQL</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight size={20} /></>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
               <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
               <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>OR CONTINUE WITH</span>
               <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            <button
               type="button"
               onClick={() => alert('Social Authentication Gateway: Redirecting to Google Secure Proxy...')}
               className="btn btn-secondary"
               style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e2e8f0' }}
            >
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
               Sign up with Google
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: '#64748b' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#06b6d4', fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
