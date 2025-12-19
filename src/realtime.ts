import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

export function connectRealtime(): Socket {
  return io(`${API_BASE}/realtime`, {
    transports: ['websocket'],
    withCredentials: true,
  });
}