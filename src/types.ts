export interface Arc {
  arc_id: string;
  title: string;
  status: string;
}

export interface Clock {
  clock_id: string;
  title: string;
  progress: number;
  segments: number;
  status: string;
  nightly: boolean;
}

export interface Pressure {
  source: string;
  severity: number;
  description: string;
  created_at: string;
}

export interface WorldState {
  arcs: Arc[];
  clocks: Clock[];
  pressure: Pressure[];
  heat: number;
}