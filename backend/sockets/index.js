
const attachRedisAdapter = async (io) => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    // Single-instance mode — no adapter needed.
    if (process.env.NODE_ENV !== 'test') {
      console.info(
        '[socket] REDIS_URL not set — running in single-instance mode. ' +
          'Set REDIS_URL to enable multi-instance Socket.IO support.'
      );
    }
    return;
  }

  try {
    // Dynamic imports so the server starts cleanly even when the optional
    // packages are not installed (single-instance deployments).
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { default: Redis } = await import('ioredis');

    const pubClient = new Redis(redisUrl, { lazyConnect: true });
    const subClient = pubClient.duplicate();

    // Surface Redis connection errors without crashing the process.
    const onRedisError = (err) =>
      console.error('[socket] Redis adapter error:', err.message);

    pubClient.on('error', onRedisError);
    subClient.on('error', onRedisError);

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));

    console.info('[socket] Redis adapter attached — multi-instance mode active.');
  } catch (err) {
    
    console.error(
      '[socket] Failed to attach Redis adapter — falling back to ' +
        'single-instance mode. Multi-instance rooms will NOT work.',
      err.message
    );
  }
};


const isValidExpertId = (expertId) =>
  typeof expertId === 'string' && expertId.trim().length > 0;

// ── Socket.IO setup ───────────────────────────────────────────────────────────
const setupSockets = async (io) => {
  // Attach Redis adapter first (no-op if REDIS_URL is absent).
  await attachRedisAdapter(io);

  io.on('connection', (socket) => {
    
    socket.on('expert:join', (expertId) => {
      if (!isValidExpertId(expertId)) {
        console.warn(
          `[socket] expert:join rejected — invalid expertId from socket ${socket.id}:`,
          expertId
        );
        return;
      }
      socket.join(`expert:${expertId}`);
    });

    // ── expert:leave ────────────────────────────────────────────────────────
    socket.on('expert:leave', (expertId) => {
      if (!isValidExpertId(expertId)) {
        console.warn(
          `[socket] expert:leave rejected — invalid expertId from socket ${socket.id}:`,
          expertId
        );
        return;
      }
      socket.leave(`expert:${expertId}`);
    });

    
    socket.on('disconnect', (reason) => {
      // Intentionally left minimal. Add debug logging here if needed.
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[socket] ${socket.id} disconnected — reason: ${reason}`);
      }
    });
  });
};

export default setupSockets;