import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

let socket: Socket | null = null;

export function connectRealtime(): Socket {
  if (socket) return socket;

  socket = io(`${API_BASE}/realtime`, {
    transports: ['websocket'],
    withCredentials: true,
  });

  return socket;
}

export function getRealtime(): Socket | null {
  return socket;
}

export function disconnectRealtime() {
  try {
    socket?.disconnect();
  } catch {}
  socket = null;
}