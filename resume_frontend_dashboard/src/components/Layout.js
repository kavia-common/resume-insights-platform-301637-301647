import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function Layout({ children, theme, toggleTheme }) {
  /** App shell layout with header navigation and theme toggle. */
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, label }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        style={{
          textDecoration: 'none',
          padding: '8px 12px',
          borderRadius: 10,
          border: `1px solid ${active ? 'var(--button-bg)' : 'var(--border-color)'}`,
          color: active ? 'var(--button-text)' : 'var(--text-primary)',
          background: active ? 'var(--button-bg)' : 'transparent',
          fontWeight: 600,
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-secondary)',
          borderBottom: `1px solid var(--border-color)`,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Resume Insights</div>
            {token ? (
              <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <NavItem to="/dashboard" label="Dashboard" />
                <NavItem to="/upload" label="Upload" />
              </nav>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>

            {token ? (
              <>
                <div style={{ fontSize: 13, opacity: 0.85, textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{user?.full_name || 'User'}</div>
                  <div style={{ opacity: 0.8 }}>{user?.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    border: `1px solid var(--border-color)`,
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Login
                </Link>
                <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 16px' }}>{children}</main>
    </div>
  );
}
