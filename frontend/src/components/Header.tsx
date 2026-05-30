import React from 'react';
import { theme } from '../theme';

interface HeaderProps {
  onLogout: () => void;
  user?: { firstName: string; lastName: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: theme.white,
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.secondary,
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  };

  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>🐾 Bulldog Founds</h1>
      {user && (
        <nav style={navStyle}>
          <span style={{ fontSize: '14px' }}>Welcome, {user.firstName}</span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: theme.secondary,
              color: theme.primary,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
};
