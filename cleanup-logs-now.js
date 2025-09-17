const fs = require('fs');
const path = require('path');

console.log('🧹 Starting manual log cleanup...');

function cleanupLogs() {
  // Based on your winston logger configuration
  const logDirectories = [
    path.join(process.cwd(), 'winston', 'success'),  // Winston success logs
    path.join(process.cwd(), 'winston', 'error'),    // Winston error logs  
    path.join(process.cwd(), 'winston'),              // Winston root
    path.join(process.cwd(), 'logs'),                 // General logs
    path.join(process.cwd(), 'log'),                  // Alternative logs
    path.join(process.cwd(), 'src', 'logs'),          // Source logs
  ];

  let totalFilesDeleted = 0;
  let totalSizeFreed = 0;
  const now = new Date();
  
  // Delete files older than 3 days (adjust as needed)
  const cutoffTime = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

  console.log(`📅 Deleting files older than: ${cutoffTime.toLocaleString()}`);

  logDirectories.forEach((logDir) => {
    if (fs.existsSync(logDir)) {
      console.log(`\n📂 Checking directory: ${logDir}`);
      
      try {
        const files = fs.readdirSync(logDir);
        
        if (files.length === 0) {
          console.log('   📄 Directory is empty');
          return;
        }

        files.forEach((file) => {
          const filePath = path.join(logDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            
            // Process log files and compressed archives
            const isLogFile = file.match(/\.(log|txt|gz|zip)$/i);
            const isWinstonLog = file.match(/\d{2}-\d{2}-\d{4}-(success|error)\.log(\.gz)?$/);
            
            if ((isLogFile || isWinstonLog) && stats.isFile()) {
              const fileAge = now.getTime() - stats.mtime.getTime();
              const fileSizeKB = (stats.size / 1024).toFixed(2);
              const fileAgeDays = Math.floor(fileAge / (1000 * 60 * 60 * 24));
              
              if (stats.mtime < cutoffTime) {
                let deleted = false;
                for (let i = 0; i < 3; i++) {
                  try {
                    fs.unlinkSync(filePath);
                    totalSizeFreed += stats.size;
                    totalFilesDeleted++;
                    console.log(`   ❌ Deleted: ${file} (${fileSizeKB} KB, ${fileAgeDays} days old)`);
                    deleted = true;
                    break;
                  } catch (deleteError) {
                    if (deleteError.code === 'EBUSY' || deleteError.code === 'EPERM') {
                      if (i < 2) { // if not the last attempt
                        console.log(`   ⏳ ${file} is in use, retrying...`);
                        // Synchronous delay
                        const waitTill = new Date(new Date().getTime() + 500);
                        while(waitTill > new Date()){}
                      }
                    } else {
                      console.error(`   ⚠️ Error deleting ${file}: ${deleteError.message}`);
                      break; // don't retry on other errors
                    }
                  }
                }
                if (!deleted) {
                  console.log(`   🔒 Skipped after retries: ${file} (${fileSizeKB} KB) - File remains in use`);
                }
              } else {
                console.log(`   ✅ Kept: ${file} (${fileSizeKB} KB, ${fileAgeDays} days old) - Recent file`);
              }
            } else {
              console.log(`   ⏭️ Skipped: ${file} - Not a log file`);
            }
          } catch (statError) {
            console.error(`   ⚠️ Error checking ${file}: ${statError.message}`);
          }
        });
      } catch (readError) {
        console.error(`   ⚠️ Cannot read directory ${logDir}: ${readError.message}`);
      }
    } else {
      console.log(`\n📁 Directory not found: ${logDir}`);
    }
  });

  // Also clean up large current log files by truncating them
  console.log(`\n📏 Checking for large log files to truncate...`);
  
  logDirectories.forEach((logDir) => {
    if (fs.existsSync(logDir)) {
      try {
        const files = fs.readdirSync(logDir);
        
        files.forEach((file) => {
          const filePath = path.join(logDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (stats.isFile() && stats.size > maxSize && file.match(/\.log$/i)) {
              const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2);
              
              try {
                // Keep only the last 25% of the file
                const data = fs.readFileSync(filePath, 'utf8');
                const lines = data.split('\n');
                const keepLines = Math.floor(lines.length * 0.25);
                const truncatedData = lines.slice(-keepLines).join('\n');
                
                fs.writeFileSync(filePath, truncatedData);
                const newSizeMB = (truncatedData.length / 1024 / 1024).toFixed(2);
                
                console.log(`   ✂️ Truncated: ${file} (${originalSizeMB}MB → ${newSizeMB}MB)`);
              } catch (truncateError) {
                console.log(`   ⚠️ Cannot truncate ${file}: ${truncateError.message}`);
              }
            }
          } catch (statError) {
            // Ignore stat errors for truncation
          }
        });
      } catch (readError) {
        // Ignore read errors for truncation
      }
    }
  });

  console.log('\n📊 Cleanup Summary:');
  console.log(`🗑️ Files deleted: ${totalFilesDeleted}`);
  console.log(`💾 Space freed: ${(totalSizeFreed / 1024 / 1024).toFixed(2)} MB`);
  
  if (totalFilesDeleted === 0) {
    console.log('✨ No old files to delete - logs are already clean!');
  } else {
    console.log('✨ Log cleanup completed successfully!');
  }
}

// Add error handling for the main execution
try {
  cleanupLogs();
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}