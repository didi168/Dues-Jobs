import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { LayoutDashboard, History, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Topbar */}
      <header style={{ 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border)', 
        padding: '0.75rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="btn btn-outline show-mobile" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Dues<span style={{ color: 'var(--primary)' }}>Jobs</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-sm text-muted hidden-mobile">{user?.email}</span>
             <button title="Sign Out" onClick={signOut} className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '50%' }}>
               <LogOut size={18} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ flex: 1, display: 'flex', gap: '2rem', padding: '2rem 1.5rem', position: 'relative' }}>
        
        {/* Sidebar Nav - Desktop */}
        <aside className="hidden-mobile" style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'sticky', top: '5rem', height: 'fit-content' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="show-mobile" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-body)',
            zIndex: 40,
            padding: '1rem',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
              <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                 <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>Signed in as</div>
                 <div style={{ fontWeight: 600 }}>{user?.email}</div>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
