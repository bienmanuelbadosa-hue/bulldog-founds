import React from 'react';

interface LoadingSpinnerProps {
  /** Optional label shown below the spinner. Defaults to 'Loading Bulldog Founds...' */
  message?: string;
}

/**
 * Full-viewport loading spinner component.
 * Used as the app-level loading state while auth is being resolved.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading Bulldog Founds...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          animation: 'spin 1.5s linear infinite',
          display: 'inline-block',
          marginBottom: '16px',
        }}
      >
        🐾
      </div>
      <p style={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{message}</p>
    </div>
  );
};
