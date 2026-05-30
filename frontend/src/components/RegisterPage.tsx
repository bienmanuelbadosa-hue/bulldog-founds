import React, { useState } from 'react';
import { apiService } from '../api';
import type { AuthResponse } from '../api';
import { theme } from '../theme';

interface RegisterProps {
  onRegisterSuccess: (auth: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.register(email, password, firstName, lastName, role);
      apiService.setToken(response.token);
      onRegisterSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '40px auto',
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
      <h2 style={titleStyle}>Register</h2>

      {error && <div style={{ color: theme.error, backgroundColor: '#f8d7da', padding: '12px', borderRadius: '4px' }}>{error}</div>}

      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          style={inputStyle}
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Faculty</option>
          <option value="STAFF">Staff</option>
        </select>
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ ...linkStyle, marginTop: '20px' }}>
        Already have an account?{' '}
        <a onClick={onSwitchToLogin} style={{ cursor: 'pointer', color: theme.primary, fontWeight: 'bold' }}>
          Login here
        </a>
      </p>
    </div>
  );
};
