import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function bootstrap() {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`[Server] TruthLens API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const shutdown = () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] Closed all connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server Error] Startup failed:', error);
    process.exit(1);
  }
}

bootstrap();
