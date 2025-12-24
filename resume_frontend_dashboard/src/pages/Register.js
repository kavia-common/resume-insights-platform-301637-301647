import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration page using AuthContext. */
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left', maxWidth: 520 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Create account</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>Register to start uploading resumes and getting feedback.</p>

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
        <label style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          type="text"
          autoComplete="name"
          disabled={isSubmitting}
          style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border-color)' }}
        />

        <label style={{ display: 'block', fontWeight: 800, marginTop: 12, marginBottom: 6 }}>Email</label>
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
          autoComplete="new-password"
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
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
