import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Code, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const infoItems = [
    { label: 'Full Display Name', value: user?.name, icon: User },
    { label: 'Corporate Email', value: user?.email, icon: Mail },
    { label: 'Governance Role', value: user?.role?.toUpperCase()?.replace('_', ' '), icon: Shield },
    { label: 'Technical Track', value: user?.language || 'Global Administration', icon: Code },
    { label: 'Registration Date', value: new Date(user?.created_at || Date.now()).toLocaleDateString(), icon: Calendar },
    { label: 'Access Node', value: 'Cloud-Sync Active', icon: MapPin },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>Identity Governance</h2>
        <p style={{ color: 'var(--text-muted)' }}>Secure overview of your professional credentials and access privileges.</p>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ 
          background: 'var(--accent-gradient)', 
          height: '120px', 
          position: 'relative',
          marginBottom: '60px'
        }}>
          <div style={{ 
            position: 'absolute', 
            bottom: '-40px', 
            left: '40px',
            padding: '4px',
            background: 'white',
            borderRadius: '50%'
          }}>
            <img 
              src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.name}&background=06b6d4&color=fff&size=128`} 
              alt="Profile" 
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div style={{ padding: '0 40px 40px 40px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>{user?.name}</h3>
            <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
               {user?.role?.replace('_', ' ')} • ID: {user?.id?.toString().padStart(6, '0')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {infoItems.map((item, idx) => (
              <div key={idx} style={{ 
                padding: '1.25rem', 
                borderRadius: '1rem', 
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '0.75rem', color: 'var(--accent)' }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.label}</p>
                  <p style={{ fontWeight: '700', color: 'var(--primary)', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
