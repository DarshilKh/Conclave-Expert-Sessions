import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ── Singleton socket instance ─────────────────────────────────────────────────
let socket = null;

const roomRefCounts = new Map();


const reconnectCallbacks = new Map();

// ── Internal: emit expert:join safely ────────────────────────────────────────
const emitJoin = (expertId) => {
  if (socket?.connected) {
    socket.emit('expert:join', expertId);
  }
  
};

// ── Internal: emit expert:leave safely ───────────────────────────────────────
const emitLeave = (expertId) => {
  if (socket?.connected) {
    socket.emit('expert:leave', expertId);
  }
};

// ── getSocket ─────────────────────────────────────────────────────────────────
// Returns the singleton socket, creating and wiring it on first call.
export const getSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
   
    transports: ['websocket'],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,     // 2 s initial back-off
    reconnectionDelayMax: 10000, // 10 s max back-off
    timeout: 20000,              // 20 s connection timeout
  });

  // ── connect / reconnect ───────────────────────────────────────────────────
  socket.on('connect', () => {
    const rooms = [...roomRefCounts.keys()];

    if (rooms.length > 0) {
      console.debug('[socket] connected — re-joining rooms:', rooms);
      rooms.forEach((expertId) => socket.emit('expert:join', expertId));
    }

    if (reconnectCallbacks.size > 0) {
      console.debug(
        '[socket] firing',
        reconnectCallbacks.size,
        'reconnect callback(s) to reconcile state'
      );
      reconnectCallbacks.forEach((fn) => {
        try {
          fn();
        } catch (err) {
          console.error('[socket] reconnect callback threw:', err);
        }
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.debug('[socket] disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] connection error:', err.message);
  });

  return socket;
};


export const joinExpertRoom = (expertId) => {
  const current = roomRefCounts.get(expertId) ?? 0;
  roomRefCounts.set(expertId, current + 1);

  if (current === 0) {
    // First component joining this room — tell the server.
    getSocket(); // ensure socket is initialised
    emitJoin(expertId);
  }
};


export const leaveExpertRoom = (expertId) => {
  const current = roomRefCounts.get(expertId) ?? 0;

  if (current <= 1) {
    // Last (or only) subscriber leaving — remove from map and tell server.
    roomRefCounts.delete(expertId);
    emitLeave(expertId);
  } else {
    roomRefCounts.set(expertId, current - 1);
  }
};


export const registerReconnectCallback = (fn) => {

  const id = `cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  reconnectCallbacks.set(id, fn);

  // Ensure socket is initialised so the connect handler is wired.
  getSocket();

  // Return the cleanup / unregister function.
  return () => {
    reconnectCallbacks.delete(id);
  };
};