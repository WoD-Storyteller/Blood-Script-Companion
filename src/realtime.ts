import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

export function connectRealtime(token: string) {
  return io(`${API_BASE}/realtime`, {
    transports: ['websocket'],
    auth: { token },
  });
}