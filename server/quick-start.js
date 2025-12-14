#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 JobsAddah Ad Control System - Quick Start\n');

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running: ${command} ${args.join(' ')}`);
    
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
    console.log('1️⃣ Setting up Ad Control System...');
    await runCommand('node', ['setup-ad-system.js']);
    
    console.log('\n2️⃣ Running API tests...');
    await runCommand('node', ['test-ad-api.js']);
    
    console.log('\n✅ Quick start completed successfully!');
    console.log('\n📋 What was set up:');
    console.log('   ✓ AdSense credentials initialized');
    console.log('   ✓ Ad configuration created');
    console.log('   ✓ API endpoints tested');
    console.log('   ✓ Database schema created');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start your server: npm start');
    console.log('   2. Check API health: curl http://localhost:5000/api/v1/ad-config/health');
    console.log('   3. Get ad config: curl -H "X-Publisher-ID: ca-pub-7416335110977682" http://localhost:5000/api/v1/ad-config/');
    console.log('   4. Integrate frontend components using frontend-ad-utils.js');
    
    console.log('\n📚 Documentation:');
    console.log('   - Complete guide: AD_SYSTEM_README.md');
    console.log('   - API testing: test-ad-api.js');
    console.log('   - Frontend utils: frontend-ad-utils.js');
    
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
  console.log('JobsAddah Ad Control System Quick Start');
  console.log('');
  console.log('Usage:');
  console.log('  node quick-start.js          Run full setup and tests');
  console.log('  node quick-start.js --help   Show this help message');
  console.log('');
  console.log('This script will:');
  console.log('  1. Initialize your AdSense credentials');
  console.log('  2. Set up initial ad configuration');
  console.log('  3. Test all API endpoints');
  console.log('  4. Verify the system is working');
  console.log('');
  process.exit(0);
}

// Run quick start
quickStart();