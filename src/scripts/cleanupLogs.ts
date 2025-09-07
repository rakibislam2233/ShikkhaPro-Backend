import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { logger } from '../shared/logger';

/**
 * Clean up log files older than specified days
 */
const cleanupOldLogs = (logDir: string, daysToKeep: number = 3): void => {
  try {
    if (!fs.existsSync(logDir)) {
      logger.warn(`Log directory does not exist: ${logDir}`);
      return;
    }

    const files = fs.readdirSync(logDir);
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));

    let filesDeleted = 0;
    let totalSize = 0;

    logger.info(`Cleaning logs older than: ${cutoffTime.toLocaleString()}`);

    files.forEach((file) => {
      const filePath = path.join(logDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        // Process log files and compressed archives (Winston specific patterns)
        const isLogFile = file.match(/\.(log|txt|gz|zip)$/i);
        const isWinstonLog = file.match(/\d{2}-\d{2}-\d{4}-(success|error)\.log(\.gz)?$/);
        
        if ((isLogFile || isWinstonLog) && stats.isFile()) {
          const fileAge = now.getTime() - stats.mtime.getTime();
          const fileAgeDays = Math.floor(fileAge / (1000 * 60 * 60 * 24));
          
          if (stats.mtime < cutoffTime) {
            try {
              // Check if file is in use before deleting
              const fd = fs.openSync(filePath, 'r+');
              fs.closeSync(fd);
              
              // File is not locked, safe to delete
              totalSize += stats.size;
              fs.unlinkSync(filePath);
              filesDeleted++;
              logger.info(`Deleted old log file: ${file} (${(stats.size / 1024).toFixed(2)} KB, ${fileAgeDays} days old)`);
            } catch (lockError: any) {
              if (lockError.code === 'EBUSY' || lockError.code === 'EPERM') {
                logger.warn(`Skipped locked file: ${file} - File is in use`);
              } else {
                // Try force delete after delay
                setTimeout(() => {
                  try {
                    fs.unlinkSync(filePath);
                    totalSize += stats.size;
                    filesDeleted++;
                    logger.info(`Force deleted: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
                  } catch (forceError: any) {
                    logger.error(`Cannot delete file ${file}: ${forceError.message}`);
                  }
                }, 1000);
              }
            }
          } else {
            logger.info(`Kept recent file: ${file} (${fileAgeDays} days old)`);
          }
        }
      } catch (error: any) {
        logger.error(`Error processing file ${file}:`, error.message);
      }
    });

    if (filesDeleted > 0) {
      logger.info(`Log cleanup completed: ${filesDeleted} files deleted, ${(totalSize / 1024 / 1024).toFixed(2)} MB freed`);
    } else {
      logger.info('Log cleanup completed: No old files to delete');
    }
  } catch (error: any) {
    logger.error('Error during log cleanup:', error.message);
  }
};

/**
 * Clean up large log files by truncating them
 */
const truncateLargeLogFiles = (logDir: string, maxSizeMB: number = 10): void => {
  try {
    if (!fs.existsSync(logDir)) return;

    const files = fs.readdirSync(logDir);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    files.forEach((file) => {
      const filePath = path.join(logDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        if (file.match(/\.log$/i) && stats.isFile() && stats.size > maxSizeBytes) {
          const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2);
          
          try {
            // Keep only the last 25% of the file to preserve recent entries
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n');
            const keepLines = Math.floor(lines.length * 0.25);
            const truncatedData = lines.slice(-keepLines).join('\n');
            
            fs.writeFileSync(filePath, truncatedData);
            const newSizeMB = (truncatedData.length / 1024 / 1024).toFixed(2);
            
            logger.info(`Truncated large log file: ${file} (${originalSizeMB}MB → ${newSizeMB}MB)`);
          } catch (truncateError: any) {
            logger.error(`Error truncating file ${file}:`, truncateError.message);
          }
        }
      } catch (error: any) {
        // Ignore stat errors for truncation phase
      }
    });
  } catch (error: any) {
    logger.error('Error during log file truncation:', error);
  }
};

/**
 * Main cleanup function - targets Winston log directories
 */
const performLogCleanup = (): void => {
  logger.info('Starting scheduled log cleanup...');
  
  // Directories based on your Winston logger configuration
  const logDirectories = [
    path.join(process.cwd(), 'winston', 'success'),  // Winston success logs
    path.join(process.cwd(), 'winston', 'error'),    // Winston error logs  
    path.join(process.cwd(), 'winston'),             // Winston root directory
    path.join(process.cwd(), 'logs'),                // General logs
    path.join(process.cwd(), 'log'),                 // Alternative logs
    path.join(process.cwd(), 'src', 'logs'),         // Source logs
  ];

  logDirectories.forEach((logDir) => {
    if (fs.existsSync(logDir)) {
      logger.info(`Cleaning up logs in: ${logDir}`);
      
      // Delete files older than 3 days (configurable)
      cleanupOldLogs(logDir, 3);
      
      // Truncate files larger than 10MB
      truncateLargeLogFiles(logDir, 10);
    } else {
      logger.info(`Log directory not found: ${logDir}`);
    }
  });

  logger.info('Scheduled log cleanup completed');
};

/**
 * Schedule daily log cleanup at 2:00 AM Bangladesh time
 * Cron format: second minute hour day-of-month month day-of-week
 */
export const startLogCleanupScheduler = (): void => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('🕐 Running scheduled daily log cleanup...');
    performLogCleanup();
  }, {
    timezone: 'Asia/Dhaka', // Bangladesh timezone
    scheduled: true
  });

  // Run initial cleanup 10 seconds after startup
  setTimeout(() => {
    logger.info('Running initial log cleanup check...');
    performLogCleanup();
  }, 10000);

  logger.info('Daily log cleanup scheduler started (runs at 2:00 AM Bangladesh time)');
};

/**
 * Manual cleanup function for immediate use
 */
export const runManualLogCleanup = (): void => {
  logger.info('Running manual log cleanup...');
  performLogCleanup();
};

/**
 * Create test log files for testing cleanup
 */
export const createTestLogFiles = (): void => {
  const testDir = path.join(process.cwd(), 'winston', 'test');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Create old test files
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 5); // 5 days old
  
  const testFiles = [
    '05-12-2024-success.log',
    '04-12-2024-error.log', 
    'old-test.log',
    'large-test.txt'
  ];
  
  testFiles.forEach((file) => {
    const filePath = path.join(testDir, file);
    const content = file.includes('large') 
      ? 'Large log content\n'.repeat(100000) // Create large file
      : 'Test log content\n'.repeat(10);
    
    fs.writeFileSync(filePath, content);
    fs.utimesSync(filePath, oldDate, oldDate); // Set old timestamp
  });
  
  logger.info(`Created test log files in ${testDir}`);
};

export default {
  startLogCleanupScheduler,
  runManualLogCleanup,
  performLogCleanup,
  createTestLogFiles,
};