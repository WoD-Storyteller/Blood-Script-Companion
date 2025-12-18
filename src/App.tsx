import { useEffect, useState } from 'react';
import { loadToken, saveToken, clearToken } from './auth';
import { fetchWorld } from './api';
import { WorldState } from './types';
import Login from './components/Login';
import WorldDashboard from './components/WorldDashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(loadToken());
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetchWorld(token)
      .then(setWorld)
      .catch((e) => {
        setError(e.message);
        clearToken();
        setToken(null);
      });
  }, [token]);

  if (!token) {
    return (
      <Login
        onLogin={(t) => {
          saveToken(t);
          setToken(t);
        }}
      />
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!world) {
    return <div>Loading world…</div>;
  }

  return (
    <WorldDashboard
      world={world}
      onLogout={() => {
        clearToken();
        setToken(null);
      }}
    />
  );
}