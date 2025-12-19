import { useEffect, useState } from 'react';
import Login from './components/Login';
import WorldDashboard from './components/WorldDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import { fetchMe, fetchWorld } from './api';

const OWNER_ID = import.meta.env.VITE_BOT_OWNER_DISCORD_ID;

export default function App() {
  const [session, setSession] = useState<any | null>(null);
  const [world, setWorld] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setSession(me);

        const w = await fetchWorld();
        setWorld(w);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  if (!session) return <Login />;
  if (error) return <div>Error: {error}</div>;

  const isOwner =
    OWNER_ID && session.discord_user_id === OWNER_ID;

  return isOwner ? (
    <OwnerDashboard />
  ) : (
    <WorldDashboard world={world} session={session} />
  );
}