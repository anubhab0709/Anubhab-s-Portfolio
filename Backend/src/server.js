import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

let server;

async function startServer() {
  if (!env.SKIP_DB) {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required when SKIP_DB is false.');
    }
    await connectDatabase();
  } else {
    logger.warn('Starting server with SKIP_DB=true. Guestbook APIs will not work.');
  }

  server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown.`);

  if (server) {
    server.close(async () => {
      if (!env.SKIP_DB) {
        await disconnectDatabase();
      }
      logger.info('HTTP server and DB connection closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
