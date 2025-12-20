import { useEffect, useState } from 'react';
import Login from './components/Login';
import WorldDashboard from './components/WorldDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import AppealPage from './components/AppealPage';
import { fetchMe, fetchWorld } from './api';

const OWNER_ID = import.meta.env.VITE_BOT_OWNER_DISCORD_ID;

export default function App() {
  const [session, setSession] = useState<any | null>(null);
  const [world, setWorld] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      setSession(me);
      const w = await fetchWorld();
      setWorld(w);
    })();
  }, []);

  if (!session) return <Login />;

  const isOwner = session.discord_user_id === OWNER_ID;

  if (world?.engine?.banned && !isOwner) {
    return <AppealPage />;
  }

  return isOwner ? (
    <OwnerDashboard />
  ) : (
    <WorldDashboard world={world} session={session} />
  );
}