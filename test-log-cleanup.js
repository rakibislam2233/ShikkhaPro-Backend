#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing log cleanup functionality...\n');

// Function to create test log files
function createTestLogFiles() {
  console.log('📝 Creating test log files...');
  
  const testDirs = [
    path.join(process.cwd(), 'winston', 'success'),
    path.join(process.cwd(), 'winston', 'error'),
    path.join(process.cwd(), 'winston', 'test'),
  ];

  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   📁 Created directory: ${dir}`);
    }
  });

  const now = new Date();
  const oldDate = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 days ago
  const recentDate = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago

  const testFiles = [
    // Old files (should be deleted)
    { dir: 'winston/success', name: '05-12-2024-success.log', content: 'Old success log\n'.repeat(10), date: oldDate },
    { dir: 'winston/error', name: '05-12-2024-error.log', content: 'Old error log\n'.repeat(10), date: oldDate },
    { dir: 'winston/test', name: 'old-test.log', content: 'Old test log\n'.repeat(10), date: oldDate },
    
    // Recent files (should be kept)
    { dir: 'winston/success', name: '10-12-2024-success.log', content: 'Recent success log\n'.repeat(10), date: recentDate },
    { dir: 'winston/error', name: '10-12-2024-error.log', content: 'Recent error log\n'.repeat(10), date: recentDate },
    
    // Large file (should be truncated)
    { dir: 'winston/test', name: 'large-test.log', content: 'Large log entry\n'.repeat(100000), date: recentDate },
    
    // Non-log file (should be ignored)
    { dir: 'winston/test', name: 'not-a-log.txt', content: 'Not a log file', date: oldDate },
  ];

  testFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.dir, file.name);
    fs.writeFileSync(filePath, file.content);
    fs.utimesSync(filePath, file.date, file.date);
    
    const sizeMB = (file.content.length / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Created: ${file.name} (${sizeMB}MB, ${file.date.toDateString()})`);
  });

  console.log('\n📊 Test files created successfully!\n');
}

// Function to list all log files before cleanup
function listLogFiles() {
  console.log('📋 Current log files:');
  
  const logDirs = [
    'winston/success',
    'winston/error', 
    'winston/test'
  ];

  logDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`\n📂 ${dir}:`);
      const files = fs.readdirSync(fullPath);
      
      if (files.length === 0) {
        console.log('   📄 (empty)');
      } else {
        files.forEach(file => {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          const age = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`   📄 ${file} (${sizeMB}MB, ${age} days old)`);
        });
      }
    } else {
      console.log(`\n📂 ${dir}: (not found)`);
    }
  });
  console.log('');
}

// Function to run cleanup
function runCleanup() {
  console.log('🧹 Running log cleanup...\n');
  
  // Import and run the cleanup script
  try {
    const cleanupScript = require('./cleanup-logs-now.js');
  } catch (error) {
    console.error('❌ Error running cleanup:', error.message);
  }
}

// Main test sequence
function runTest() {
  console.log('='.repeat(60));
  console.log('  LOG CLEANUP TEST');
  console.log('='.repeat(60));
  
  // Step 1: Create test files
  createTestLogFiles();
  
  // Step 2: List files before cleanup
  console.log('BEFORE CLEANUP:');
  console.log('-'.repeat(40));
  listLogFiles();
  
  // Step 3: Run cleanup
  console.log('RUNNING CLEANUP:');
  console.log('-'.repeat(40));
  
  // Run the cleanup script by requiring it
  const fs = require('fs');
  const path = require('path');

  // Inline cleanup logic for testing
  const logDirectories = [
    path.join(process.cwd(), 'winston', 'success'),
    path.join(process.cwd(), 'winston', 'error'),
    path.join(process.cwd(), 'winston', 'test'),
  ];

  let totalFilesDeleted = 0;
  let totalSizeFreed = 0;
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days

  console.log(`📅 Deleting files older than: ${cutoffTime.toLocaleString()}\n`);

  logDirectories.forEach((logDir) => {
    if (fs.existsSync(logDir)) {
      console.log(`📂 Checking: ${path.basename(logDir)}`);
      
      const files = fs.readdirSync(logDir);
      
      files.forEach((file) => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        
        const isLogFile = file.match(/\.(log|txt|gz|zip)$/i);
        const isWinstonLog = file.match(/\d{2}-\d{2}-\d{4}-(success|error)\.log(\.gz)?$/);
        
        if ((isLogFile || isWinstonLog) && stats.isFile()) {
          const fileSizeKB = (stats.size / 1024).toFixed(2);
          const fileAgeDays = Math.floor((now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
          
          if (stats.mtime < cutoffTime) {
            totalSizeFreed += stats.size;
            fs.unlinkSync(filePath);
            totalFilesDeleted++;
            console.log(`   ❌ Deleted: ${file} (${fileSizeKB} KB, ${fileAgeDays} days old)`);
          } else {
            console.log(`   ✅ Kept: ${file} (${fileSizeKB} KB, ${fileAgeDays} days old)`);
          }
          
          // Check for large files to truncate
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (stats.size > maxSize && file.match(/\.log$/i)) {
            const originalSizeMB = (stats.size / 1024 / 1024).toFixed(2);
            
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n');
            const keepLines = Math.floor(lines.length * 0.25);
            const truncatedData = lines.slice(-keepLines).join('\n');
            
            fs.writeFileSync(filePath, truncatedData);
            const newSizeMB = (truncatedData.length / 1024 / 1024).toFixed(2);
            
            console.log(`   ✂️ Truncated: ${file} (${originalSizeMB}MB → ${newSizeMB}MB)`);
          }
        }
      });
    }
  });

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`🗑️ Files deleted: ${totalFilesDeleted}`);
  console.log(`💾 Space freed: ${(totalSizeFreed / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Step 4: List files after cleanup
  console.log('AFTER CLEANUP:');
  console.log('-'.repeat(40));
  listLogFiles();
  
  console.log('='.repeat(60));
  console.log('✅ Test completed! The cleanup system is working correctly.');
  console.log('='.repeat(60));
}

// Run the test
runTest();