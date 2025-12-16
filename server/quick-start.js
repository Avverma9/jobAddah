#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

const quickStart = async () => {
  try {
    await runCommand('node', ['setup-ad-system.js']);
    
    await runCommand('node', ['test-ad-api.js']);
    
  } catch (error) {
    console.error('\n❌ Quick start failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check your .env file configuration');
    console.log('   3. Verify server is not already running on port 5000');
    console.log('   4. Run: npm install (if dependencies missing)');
    process.exit(1);
  }
};

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.exit(0);
}

// Run quick start
quickStart();