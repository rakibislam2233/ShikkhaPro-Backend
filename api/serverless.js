// Serverless-friendly version without Socket.IO
const mongoose = require('mongoose');
const app = require('../dist/app.js').default;
const { config } = require('../dist/config');
const { logger, errorLogger } = require('../dist/shared/logger');

// Track if database is already connected
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(config.database.mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    isConnected = true;
    logger.info('Database connected successfully for serverless');
  } catch (error) {
    errorLogger.error('Failed to connect to Database in serverless', error);
    throw error;
  }
};

// Serverless handler
module.exports = async (req, res) => {
  try {
    // Connect to database if not already connected
    await connectToDatabase();

    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    errorLogger.error('Serverless handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
};