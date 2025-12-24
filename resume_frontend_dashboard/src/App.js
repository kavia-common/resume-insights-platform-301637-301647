import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';

// PUBLIC_INTERFACE
function App() {
  /** Root application component: theme + routing + auth provider. */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const layoutContextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Layout {...layoutContextValue}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/upload"
                element={
                  <RequireAuth>
                    <Upload />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

// PUBLIC_INTERFACE
function RequireAuth({ children }) {
  /** Route guard: redirect unauthenticated users to /login. */
  const { token, isLoading } = useAuth();

  if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default App;
