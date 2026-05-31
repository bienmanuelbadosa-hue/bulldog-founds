import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { zodResolver } from '../utils/zodResolver';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email')
    .regex(
      /^[a-zA-Z0-9._%+\-]+@(students\.)?nu\-laguna\.edu\.ph$/,
      'Must be a valid NU Laguna email address (@nu-laguna.edu.ph or @students.nu-laguna.edu.ph)'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
});

type LoginFields = z.infer<typeof loginSchema>;

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      onLoginSuccess();
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '20px',
  };

  const loginCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '450px',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  };

  const headerContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
  };

  const logoIconStyle: React.CSSProperties = {
    fontSize: '48px',
    marginBottom: '12px',
    display: 'inline-block',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 52, 120, 0.1)',
    color: 'var(--primary)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={containerStyle}>
      <div className="card" style={loginCardStyle}>
        <div style={headerContainerStyle}>
          <div style={logoIconStyle}>🐾</div>
          <span style={badgeStyle}>NU Laguna Hub</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Bulldog Founds</h2>
          <p>Retrieve what you lost. Return what you found.</p>
        </div>

        {serverError && (
          <div
            className="animate-fade-in"
            style={{
              color: 'var(--error)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderLeft: '4px solid var(--error)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="username@nu-laguna.edu.ph"
              className={errors.email ? 'input-error' : ''}
              {...register('email')}
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? 'input-error' : ''}
              {...register('password')}
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <button
            onClick={onSwitchToRegister}
            className="btn-outline"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              padding: '0',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline',
              fontSize: '0.9rem',
            }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
