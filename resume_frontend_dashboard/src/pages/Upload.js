import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx'];

// PUBLIC_INTERFACE
export default function Upload() {
  /** Upload workflow: select file -> upload -> trigger analysis -> navigate to dashboard and refresh. */
  const { token } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    const name = file.name || '';
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    return { name, ext, size: file.size };
  }, [file]);

  const validateFile = (f) => {
    if (!f) return 'Please select a file.';
    const name = f.name || '';
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type ".${ext || 'unknown'}". Please upload PDF/DOC/DOCX.`;
    }
    // Basic size guard (10MB)
    if (f.size > 10 * 1024 * 1024) {
      return 'File is too large. Please upload a file smaller than 10MB.';
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setIsSubmitting(true);
    try {
      const upload = await api.uploadResume(token, file);
      await api.triggerAnalysis(token, upload.id);

      // Navigate to dashboard and request refresh (state is read by Dashboard on mount)
      navigate('/dashboard', { state: { refresh: true, resumeId: upload.id } });
    } catch (err) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Upload Resume</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Upload a PDF/DOC/DOCX resume to generate an AI analysis with score, strengths, weaknesses, and
        recommendations.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 14,
          background: 'var(--bg-secondary)',
          border: `1px solid var(--border-color)`,
          maxWidth: 720,
        }}
      >
        <label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>Resume file</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isSubmitting}
        />

        {fileMeta ? (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
            Selected: <strong>{fileMeta.name}</strong> ({Math.round(fileMeta.size / 1024)} KB)
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: 'var(--text-primary)',
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 800,
            }}
          >
            {isSubmitting ? 'Uploading & Analyzing…' : 'Upload & Analyze'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              border: `1px solid var(--border-color)`,
              borderRadius: 10,
              padding: '10px 14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 800,
            }}
          >
            Cancel
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
          Note: Analysis may take a short moment. You’ll be redirected to the dashboard; refresh will
          show the latest results when available.
        </div>
      </form>
    </div>
  );
}
