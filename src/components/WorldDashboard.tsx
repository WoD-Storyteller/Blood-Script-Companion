import { useState } from 'react';
import { WorldState } from '../types';
import ArcList from './ArcList';
import ClockList from './ClockList';
import PressurePanel from './PressurePanel';
import MapView from './MapView';
import NavTabs, { TabKey } from './NavTabs';
import CharactersPage from './CharactersPage';
import CoteriesPage from './CoteriesPage';

export default function WorldDashboard({
  world,
  token,
  onLogout,
}: {
  world: WorldState;
  token: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('world');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Companion</h1>
          <div style={{ opacity: 0.8 }}>
            Second Inquisition Heat: <strong>{world.heat}</strong>
          </div>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>

      <NavTabs tab={tab} onChange={setTab} />

      {tab === 'world' && (
        <>
          <MapView mapUrl={world.mapUrl} />
          <ArcList arcs={world.arcs} />
          <ClockList clocks={world.clocks} />
          <PressurePanel pressure={world.pressure} />
        </>
      )}

      {tab === 'characters' && <CharactersPage token={token} />}

      {tab === 'coteries' && <CoteriesPage token={token} />}
    </div>
  );
}