import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket;


const activeRooms = new Set();

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
    
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,      // 2 s initial back-off
      reconnectionDelayMax: 10000,  // 10 s max back-off
    });

    socket.on('connect', () => {
      if (activeRooms.size === 0) return;
      console.debug(
        '[socket] reconnected — re-joining rooms:',
        [...activeRooms]
      );
      activeRooms.forEach((expertId) => {
        socket.emit('expert:join', expertId);
      });
    });

    // Surface disconnects in the console so they are visible in dev tools
    socket.on('disconnect', (reason) => {
      console.debug('[socket] disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connection error:', err.message);
    });
  }

  return socket;
};

export const joinExpertRoom = (expertId) => {
  if (activeRooms.has(expertId)) return; // already joined — skip

  activeRooms.add(expertId);
  getSocket().emit('expert:join', expertId);
};

export const leaveExpertRoom = (expertId) => {
  if (!activeRooms.has(expertId)) return; // not in room — skip

  activeRooms.delete(expertId);
  getSocket().emit('expert:leave', expertId);
};