import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { zodResolver } from '../utils/zodResolver';

const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(100, 'First name cannot exceed 100 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(100, 'Last name cannot exceed 100 characters'),
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
  role: z.enum(['STUDENT', 'FACULTY', 'STAFF'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  teamsLink: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Teams Link must start with http:// or https://',
    }),
});

type RegisterFields = z.infer<typeof registerSchema>;

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'STUDENT',
      teamsLink: '',
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await registerUser(data);
      onRegisterSuccess();
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || err.message || 'Registration failed. Email may already be in use.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90vh',
    padding: '40px 20px',
  };

  const registerCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '550px',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  };

  return (
    <div style={containerStyle}>
      <div className="card" style={registerCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', display: 'inline-block' }}>🐾</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h2>
          <p>Register with your NU Laguna email to join the lost and found network.</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                placeholder="Juan"
                className={errors.firstName ? 'input-error' : ''}
                {...register('firstName')}
              />
              {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Dela Cruz"
                className={errors.lastName ? 'input-error' : ''}
                {...register('lastName')}
              />
              {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">NU Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="username@nu-laguna.edu.ph"
              className={errors.email ? 'input-error' : ''}
              {...register('email')}
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              className={errors.password ? 'input-error' : ''}
              {...register('password')}
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              className={errors.role ? 'input-error' : ''}
              {...register('role')}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="STAFF">Staff</option>
            </select>
            {errors.role && <span className="error-text">{errors.role.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="teamsLink">
              Microsoft Teams Link (Optional)
            </label>
            <input
              id="teamsLink"
              type="url"
              placeholder="https://teams.microsoft.com/l/meetup-join/..."
              className={errors.teamsLink ? 'input-error' : ''}
              {...register('teamsLink')}
            />
            {errors.teamsLink && <span className="error-text">{errors.teamsLink.message}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
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
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
