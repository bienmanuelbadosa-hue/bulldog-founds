import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onLogout: () => void;
  onGoToFeed: () => void;
  onGoToProfile: () => void;
  user?: { firstName: string; lastName: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onGoToFeed, onGoToProfile, user }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light');
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: 'var(--shadow-md)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
  };

  return (
    <header style={headerStyle} className="glass">
      <div style={logoStyle} onClick={onGoToFeed}>
        <span>🐾</span>
        <span style={{ color: 'var(--secondary)' }}>Bulldog Founds</span>
      </div>

      {user && (
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button
            onClick={onGoToFeed}
            className="btn"
            style={{
              background: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '6px 12px',
            }}
          >
            Feed
          </button>
          <button
            onClick={onGoToProfile}
            className="btn"
            style={{
              background: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '6px 12px',
            }}
          >
            Profile
          </button>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'background 0.2s',
            }}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: '10px',
            }}
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
};
