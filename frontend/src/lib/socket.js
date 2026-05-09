import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const joinExpertRoom = (expertId) => {
  getSocket().emit('expert:join', expertId);
};

export const leaveExpertRoom = (expertId) => {
  getSocket().emit('expert:leave', expertId);
};
