const setupSockets = (io) => {
  io.on('connection', (socket) => {
    // Client joins an expert's room to receive real-time slot updates
    socket.on('expert:join', (expertId) => {
      socket.join(`expert:${expertId}`);
    });

    socket.on('expert:leave', (expertId) => {
      socket.leave(`expert:${expertId}`);
    });

    socket.on('disconnect', () => {
      // Cleanup is automatic via socket.io room management
    });
  });
};

export default setupSockets;
