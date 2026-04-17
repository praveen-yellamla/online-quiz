import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            background: 'rgba(6, 182, 212, 0.1)', 
            padding: '1rem', 
            borderRadius: '1rem',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={32} color="#06b6d4" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Internal Portal</h2>
          <p style={{ color: '#64748b' }}>Crestonix Global Solutions (CGS)</p>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            background: '#fee2e2', 
            color: '#ef4444', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Corporate Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@crestonix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            <LogIn size={20} />
            Sign In to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
             <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
             <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>OR</span>
             <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          <button
             type="button"
             onClick={() => alert('Social Authentication Gateway: Redirecting to Google Secure Proxy...')}
             className="btn btn-secondary"
             style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e2e8f0' }}
          >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
             Sign in with Google
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: '#64748b' }}>New student? </span>
          <Link to="/register" style={{ color: '#06b6d4', fontWeight: '600' }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
