import React, { useState } from 'react';
import { apiService } from '../api';
import type { AuthResponse } from '../api';
import { theme } from '../theme';

interface LoginProps {
  onLoginSuccess: (auth: AuthResponse) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      apiService.setToken(response.token);
      onLoginSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '60px auto',
    padding: '40px',
    backgroundColor: theme.white,
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  };

  const titleStyle: React.CSSProperties = {
    color: theme.primary,
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: 'bold',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: theme.white,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    opacity: loading ? 0.6 : 1,
  };

  const linkStyle: React.CSSProperties = {
    textAlign: 'center',
    color: theme.textLight,
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Login</h2>

      {error && <div style={{ color: theme.error, backgroundColor: '#f8d7da', padding: '12px', borderRadius: '4px' }}>{error}</div>}

      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ ...linkStyle, marginTop: '20px' }}>
        Don't have an account?{' '}
        <a onClick={onSwitchToRegister} style={{ cursor: 'pointer', color: theme.primary, fontWeight: 'bold' }}>
          Register here
        </a>
      </p>
    </div>
  );
};
