import { useEffect, useRef, useState } from 'react';
import { loadToken, saveToken, clearToken } from './auth';
import { fetchWorld, fetchMe } from './api';
import { WorldState, SessionInfo } from './types';
import Login from './components/Login';
import WorldDashboard from './components/WorldDashboard';
import { connectRealtime } from './realtime';
import type { Socket } from 'socket.io-client';

function consumeTokenFromUrl(): string | null {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (!token) return null;

  // Remove token from URL for cleanliness/security
  url.searchParams.delete('token');
  window.history.replaceState({}, '', url.toString());

  return token;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    const fromUrl = consumeTokenFromUrl();
    if (fromUrl) {
      saveToken(fromUrl);
      return fromUrl;
    }
    return loadToken();
  });

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    fetchMe(token)
      .then(setSession)
      .catch((e) => {
        setError(e.message);
        clearToken();
        setToken(null);
      });
  }, [token]);

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

  useEffect(() => {
    if (!token) return;

    const socket = connectRealtime(token);
    socketRef.current = socket;

    socket.on('world', (payload: any) => {
      if (payload?.world) setWorld(payload.world as WorldState);
    });

    socket.on('error', (payload: any) => {
      setError(payload?.error ?? 'Realtime error');
      clearToken();
      setToken(null);
    });

    return () => {
      try {
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };
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
    return <div style={{ padding: 24 }}>Error: {error}</div>;
  }

  if (!world || !session) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  return (
    <WorldDashboard
      world={world}
      token={token}
      session={session}
      onWorldUpdate={(w) => setWorld(w)}
      onLogout={() => {
        clearToken();
        setToken(null);
      }}
    />
  );
}