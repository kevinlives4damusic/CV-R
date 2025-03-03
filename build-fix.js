// This script helps fix dependency issues during build
const fs = require('fs');
const path = require('path');

// Create a .npmrc file if it doesn't exist
if (!fs.existsSync('.npmrc')) {
  fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\nengine-strict=false\n');
  console.log('Created .npmrc file with legacy-peer-deps=true');
}

// Clean up any problematic files from previous builds
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  try {
    console.log('Cleaning up .next directory...');
    // On Windows, we need to be careful with file locks
    // Just delete specific problematic files
    const cacheDir = path.join(nextDir, 'cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('Removed .next/cache directory');
    }
  } catch (err) {
    console.error('Error cleaning up .next directory:', err);
  }
}

// Create a temporary file to force a full rebuild
fs.writeFileSync(
  path.join(__dirname, '.rebuild-trigger'),
  `rebuild-${Date.now()}`
);
console.log('Created rebuild trigger file');

console.log('Build fix script completed successfully'); 