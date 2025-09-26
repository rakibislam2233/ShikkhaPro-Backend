import colors from 'colors';
import mongoose from 'mongoose';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import { config } from './config';

// Type for server instance
let server: any;

// Uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

/**
 * Connect to MongoDB database
 */
const connectToDatabase = async (): Promise<void> => {
  try {
    logger.info('🔄 Attempting to connect to MongoDB...');
    logger.info(`📍 Database URL: ${config.database.mongoUrl?.substring(0, 20)}...`);

    await mongoose.connect(config.database.mongoUrl as string, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info('🚀 Database connected successfully');

    // Set up mongoose connection event listeners
    mongoose.connection.on('error', error => {
      errorLogger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    errorLogger.error('🤢 Failed to connect to Database', error);
    throw error;
  }
};

/**
 * Start the HTTP server
 */
const startServer = (): void => {
  const port =
    typeof config.port === 'number' ? config.port : Number(config.port);

  logger.info(`🌐 Starting server on ${config.backend.ip}:${port}`);
  logger.info(`🔧 Environment: ${config.environment}`);

  server = app.listen(port, config.backend.ip as string, () => {
    logger.info('🎉 ================================================');
    logger.info(`🚀 ShikkaPro Backend Server is running!`);
    logger.info(`📍 Local: http://localhost:${port}`);
    logger.info(`🌍 Network: http://${config.backend.ip}:${port}`);
    logger.info(`🔗 API Base: ${config.backend.baseUrl}`);
    logger.info(`🧪 Test endpoint: ${config.backend.baseUrl}/test`);
    logger.info('🎉 ================================================');
  });

  // Handle server errors
  server.on('error', (error: Error) => {
    errorLogger.error('Server error:', error);
  });
};


/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async (error?: Error) => {
      if (error) {
        errorLogger.error('Error closing server:', error);
      } else {
        logger.info('HTTP server closed');
      }

      try {
        await mongoose.connection.close();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (dbError) {
        errorLogger.error('Error closing database connection:', dbError);
        process.exit(1);
      }
    });

    // Force close after timeout
    setTimeout(() => {
      logger.error(
        'Could not close connections in time, forcefully shutting down'
      );
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

/**
 * Main application initialization
 */
async function main() {
  try {
    logger.info('🏁 Starting ShikkaPro Backend Application...');
    logger.info(`📦 Node.js version: ${process.version}`);
    logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📁 Working directory: ${process.cwd()}`);

    // Connect to database
    await connectToDatabase();

    // Start HTTP server
    startServer();

    logger.info('✅ Application started successfully');
  } catch (error) {
    errorLogger.error('❌ Application failed to start:', error);
    process.exit(1);
  }
}

// Start the application
main();

// Handle unhandled promise rejections
process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    errorLogger.error('Unhandled Promise Rejection:', { reason, promise });
    gracefulShutdown('UNHANDLED_REJECTION');
  }
);

// Handle SIGTERM
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});
