import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

function ScorePill({ score }) {
  const color = useMemo(() => {
    if (score == null) return 'var(--border-color)';
    if (score >= 80) return '#06b6d4';
    if (score >= 60) return '#3b82f6';
    return '#EF4444';
  }, [score]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 14,
        border: `1px solid ${color}`,
        background: 'var(--bg-secondary)',
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 22 }}>{score == null ? '—' : Math.round(score)}</div>
      <div style={{ opacity: 0.8, fontWeight: 700 }}>/ 100</div>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        textAlign: 'left',
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {items?.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
          {items.map((t) => (
            <li key={t} style={{ marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ opacity: 0.75 }}>No data available yet.</div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard shows feedback summary and latest analysis. Refreshes after uploads and can poll while analysis is running. */
  const { token, user } = useAuth();
  const location = useLocation();

  const [summary, setSummary] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const pollingRef = useRef({ active: false, timeoutId: null });

  const clearPolling = () => {
    pollingRef.current.active = false;
    if (pollingRef.current.timeoutId) window.clearTimeout(pollingRef.current.timeoutId);
    pollingRef.current.timeoutId = null;
  };

  const loadSummary = async () => {
    setError(null);
    const data = await api.getFeedbackSummary(token);
    setSummary(data);
    setLatestAnalysis(data.latest_analysis || null);
    return data;
  };

  const pollForAnalysis = async (resumeId) => {
    // Poll up to ~25s with backoff, since backend analysis is backgrounded.
    clearPolling();
    pollingRef.current.active = true;

    const delays = [800, 1200, 2000, 3000, 4000, 5000, 6000];

    for (let i = 0; i < delays.length; i += 1) {
      if (!pollingRef.current.active) return;

      try {
        const result = await api.getAnalysisByResumeId(token, resumeId);
        setLatestAnalysis(result);
        // Once analysis exists, also refresh summary for latest stats.
        await loadSummary();
        clearPolling();
        return;
      } catch (e) {
        // If analysis isn't ready yet, backend likely returns 404/400; keep polling quietly.
      }

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        pollingRef.current.timeoutId = window.setTimeout(resolve, delays[i]);
      });
    }

    clearPolling();
  };

  const refresh = async (resumeIdFromUpload) => {
    setIsRefreshing(true);
    try {
      await loadSummary();
      if (resumeIdFromUpload) {
        await pollForAnalysis(resumeIdFromUpload);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await loadSummary();
        if (!mounted) return;

        const shouldRefresh = Boolean(location.state?.refresh);
        const resumeId = location.state?.resumeId;

        // If user just uploaded, attempt polling for that resume analysis.
        if (shouldRefresh && resumeId) {
          await pollForAnalysis(resumeId);
        } else {
          setLatestAnalysis(data.latest_analysis || null);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
      clearPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (isLoading) {
    return <div style={{ padding: 10, textAlign: 'left' }}>Loading dashboard…</div>;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Welcome{user?.full_name ? `, ${user.full_name}` : ''}. Here’s your latest resume feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => refresh()}
            disabled={isRefreshing}
            style={{
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link
            to="/upload"
            style={{
              textDecoration: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            Upload new
          </Link>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 14,
        }}
      >
        <div
          style={{
            gridColumn: 'span 12',
            padding: 16,
            borderRadius: 14,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Latest score</div>
              <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13 }}>
                Total resumes: <strong>{summary?.total_resumes ?? 0}</strong> · Trend:{' '}
                <strong>{summary?.improvement_trend ?? '—'}</strong>
              </div>
            </div>
            <ScorePill score={latestAnalysis?.overall_score ?? summary?.avg_score ?? null} />
          </div>

          {latestAnalysis ? (
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
              Analyzed at: <strong>{new Date(latestAnalysis.analyzed_at).toLocaleString()}</strong>
            </div>
          ) : (
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
              No analysis yet. Upload a resume to get started.
            </div>
          )}
        </div>

        <div style={{ gridColumn: 'span 12' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
            <div style={{ gridColumn: 'span 12', minHeight: 120 }}>
              <ListCard title="Strengths" items={latestAnalysis?.strengths} />
            </div>
            <div style={{ gridColumn: 'span 12', minHeight: 120 }}>
              <ListCard title="Weaknesses" items={latestAnalysis?.weaknesses} />
            </div>
            <div style={{ gridColumn: 'span 12', minHeight: 120 }}>
              <ListCard title="Recommendations" items={latestAnalysis?.recommendations} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
