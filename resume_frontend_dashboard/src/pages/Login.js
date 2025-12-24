import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function Login() {
  /** Login page using AuthContext. */
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left', maxWidth: 520 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Login</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>Sign in to upload and view your resume analyses.</p>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 16,
          padding: 18,
          borderRadius: 14,
          background: 'var(--bg-secondary)',
          border: `1px solid var(--border-color)`,
        }}
      >
        <label style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border-color)' }}
        />

        <label style={{ display: 'block', fontWeight: 800, marginTop: 12, marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border-color)' }}
        />

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: 14,
            width: '100%',
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            borderRadius: 10,
            padding: 12,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: 900,
          }}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
          No account? <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
}
