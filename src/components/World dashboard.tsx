import { WorldState } from '../types';
import ArcList from './ArcList';
import ClockList from './ClockList';
import PressurePanel from './PressurePanel';

export default function WorldDashboard({
  world,
  onLogout,
}: {
  world: WorldState;
  onLogout: () => void;
}) {
  return (
    <div style={{ padding: 24 }}>
      <button onClick={onLogout}>Logout</button>
      <h1>World State</h1>
      <p>Second Inquisition Heat: <strong>{world.heat}</strong></p>
      <ArcList arcs={world.arcs} />
      <ClockList clocks={world.clocks} />
      <PressurePanel pressure={world.pressure} />
    </div>
  );
}