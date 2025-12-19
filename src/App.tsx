import { useEffect, useRef, useState } from 'react';
import { fetchWorld, fetchMe } from './api';
import { WorldState, SessionInfo } from './types';
import Login from './components/Login';
import WorldDashboard from './components/WorldDashboard';
import { connectRealtime, disconnectRealtime } from './realtime';
import type { Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const load = async () => {
    try {
      const me = await fetchMe();
      setSession(me);

      const w = await fetchWorld();
      setWorld(w);

      setError(null);
    } catch (e: any) {
      setSession(null);
      setWorld(null);
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!session) return;

    const socket = connectRealtime();
    socketRef.current = socket;

    socket.on('world', (payload: any) => {
      if (payload?.world) setWorld(payload.world as WorldState);
    });

    socket.on('xp_applied', (payload: any) => {
      // Optional toast/log: left as console to avoid UI clutter
      // eslint-disable-next-line no-console
      console.log('xp_applied', payload);
    });

    socket.on('error', (payload: any) => {
      setError(payload?.error ?? 'Realtime error');
      setSession(null);
      setWorld(null);
      disconnectRealtime();
    });

    return () => {
      try {
        socket.off('world');
        socket.off('xp_applied');
        socket.off('error');
      } catch {}
    };
  }, [session]);

  if (!session) return <Login />;

  if (error && !world) return <div style={{ padding: 24 }}>Error: {error}</div>;

  if (!world) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <WorldDashboard
      world={world}
      session={session}
      onWorldUpdate={(w) => setWorld(w)}
      onLogout={async () => {
        await fetch(`${API_BASE}/auth/discord/logout`, { credentials: 'include' });
        disconnectRealtime();
        setSession(null);
        setWorld(null);
      }}
    />
  );
}