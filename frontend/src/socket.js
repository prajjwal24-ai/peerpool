import { io } from 'socket.io-client';

// Backend Render URL fallback
const URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://peerpool.onrender.com';

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export const connectSocket = (token) => {
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};