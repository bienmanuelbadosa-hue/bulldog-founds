import React from 'react';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '80px auto',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
  };

  const emojiStyle: React.CSSProperties = {
    fontSize: '5rem',
    display: 'block',
    marginBottom: '20px',
    animation: 'bounce 2s infinite',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const textStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    marginBottom: '32px',
    lineHeight: '1.6',
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <span style={emojiStyle}>🔍</span>
      <h1 style={titleStyle}>404 - Page Not Found</h1>
      <p style={textStyle}>
        Oops! The page you are looking for doesn't exist or has been moved. 
        Let's get you back on track to finding lost items.
      </p>
      <button onClick={onGoHome} className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
        🏠 Go Back to Feed
      </button>
    </div>
  );
};
