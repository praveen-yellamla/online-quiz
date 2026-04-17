import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  BarChart3, BookOpen, LogOut, 
  PlusCircle, ShieldCheck, Users,
  Settings, Layers, UserCheck, Medal, HelpCircle, ShieldAlert
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Security Alerts', path: '/admin/alerts', icon: ShieldAlert, badge: true },
    { name: 'Track Students', path: '/admin/students', icon: Users },
    { name: 'Create Exam', path: '/admin/create-exam', icon: PlusCircle },
    { name: 'Manage Exams', path: '/admin/manage-exams', icon: BookOpen },
    { name: 'Exam History', path: '/admin/exam-history', icon: Layers },
  ];

  const studentMenu = [
    { name: 'Assessment Hub', path: '/dashboard', icon: BookOpen },
    { name: 'My Performance', path: '/performance', icon: BarChart3 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Medal },
  ];

  const superAdminMenu = [
    { name: 'Executive Overview', path: '/super-admin', icon: BarChart3 },
    { name: 'Security Hub', path: '/admin/alerts', icon: ShieldAlert, badge: true },
    { name: 'Lead Management', path: '/super-admin/admins', icon: ShieldCheck },
    { name: 'Candidate Roster', path: '/super-admin/students', icon: Users },
    { name: 'Exam Governance', path: '/super-admin/exams', icon: BookOpen },
    { name: 'System Logs', path: '/super-admin/logs', icon: Layers },
    { name: 'Infrastructure', path: '/super-admin/settings', icon: Settings },
  ];

  const menuItems = user?.role === 'super_admin' ? superAdminMenu :
                    user?.role === 'admin' ? adminMenu : studentMenu;

  // Real-time Badge Logic for Admins
  const [badgeCount, setBadgeCount] = React.useState(0);
  React.useEffect(() => {
    if (!user || user.role === 'student') return;
    
    const socket = io('https://online-quiz-8xb0.onrender.com');
    socket.on('connect', () => {
       socket.emit('join_track', { language: user.language, role: user.role });
    });
    
    socket.on('new_cheat_alert', () => {
       setBadgeCount(prev => prev + 1);
    });
    return () => socket.disconnect();
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: '260px', position: 'fixed', height: '100vh', top: 0, left: 0, borderRight: '1px solid var(--border)', backgroundColor: 'white', zIndex: 1000 }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent-gradient)', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>CGS</h1>
            <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Portal</p>
          </div>
        </div>

        <nav style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => item.badge && setBadgeCount(0)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-muted)',
                backgroundColor: location.pathname === item.path ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              className="sidebar-hover-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <item.icon size={20} />
                {item.name}
              </div>
              {item.badge && badgeCount > 0 && (
                <div style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  fontSize: '0.625rem', 
                  fontWeight: '900', 
                  padding: '2px 6px', 
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}>
                  {badgeCount}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <p style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Active Node</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Cloud Protocol V2</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ 
          height: '74px', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(12px)', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 2.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <div>
             <h2 style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', opacity: 0.8 }}>
                Technical Infrastructure Hub
             </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
             {/* Search or Quick Stats placeholder */}
             <div className="search-box" style={{ background: '#f1f5f9', borderRadius: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Search protocols...</span>
             </div>

             {/* User Dropdown Profile Area */}
             <div style={{ position: 'relative' }} className="user-menu-trigger">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '1rem' }} className="hover-bg">
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '800', margin: 0 }}>{user?.name}</p>
                      <p style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 }}>{user?.role.replace('_', ' ')}</p>
                   </div>
                   <div style={{ position: 'relative' }}>
                      <img 
                        src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.name}&background=06b6d4&color=fff`} 
                        alt="User" 
                        style={{ width: '42px', height: '42px', borderRadius: '0.75rem', objectFit: 'cover', border: '2px solid rgba(6, 182, 212, 0.2)' }}
                      />
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid white' }} />
                   </div>
                </div>

                {/* Dropdown Menu (Hover based in CSS or Simple React State, using CSS hover for now via className) */}
                <div className="user-dropdown-menu" style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  width: '220px', 
                  backgroundColor: 'white', 
                  borderRadius: '1rem', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  display: 'none',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                   <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }} className="hover-item">
                      <ShieldCheck size={18} /> Profile governance
                   </Link>
                   <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }} className="hover-item">
                      <Settings size={18} /> System settings
                   </Link>
                   <Link to="/help" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }} className="hover-item">
                      <HelpCircle size={18} /> Help center
                   </Link>
                   <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
                   <button onClick={handleLogout} style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#ef4444', fontWeight: '800', fontSize: '0.875rem', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none' }} className="hover-item">
                      <LogOut size={18} /> Disconnect Session
                   </button>
                </div>
             </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main style={{ padding: '2.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        .user-menu-trigger:hover .user-dropdown-menu { display: flex !important; }
        .hover-bg:hover { background-color: #f8fafc; }
        .hover-item:hover { background-color: #f1f5f9; color: var(--accent) !important; }
        .sidebar-hover-item:hover { background-color: rgba(6, 182, 212, 0.05); color: var(--accent) !important; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Layout;

