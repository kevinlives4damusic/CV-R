// This script helps deploy to Vercel by temporarily using a production-only package.json
const fs = require('fs');
const { execSync } = require('child_process');

console.log('Starting Vercel deployment with production-only dependencies...');

// Backup the original package.json
if (fs.existsSync('package.json')) {
  fs.copyFileSync('package.json', 'package.json.backup');
  console.log('Backed up original package.json');
}

// Use the production-only package.json
if (fs.existsSync('package.json.prod')) {
  fs.copyFileSync('package.json.prod', 'package.json');
  console.log('Using production-only package.json');
}

try {
  // Run the Vercel deployment
  console.log('Running Vercel deployment...');
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('Vercel deployment completed successfully');
} catch (error) {
  console.error('Error during Vercel deployment:', error);
} finally {
  // Restore the original package.json
  if (fs.existsSync('package.json.backup')) {
    fs.copyFileSync('package.json.backup', 'package.json');
    fs.unlinkSync('package.json.backup');
    console.log('Restored original package.json');
  }
}

console.log('Deployment script completed'); 