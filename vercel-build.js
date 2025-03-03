// Custom build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting custom Vercel build script...');

// Create .npmrc file
fs.writeFileSync('.npmrc', 'legacy-peer-deps=true\nengine-strict=false\n');
console.log('Created .npmrc file');

// Install dependencies with legacy-peer-deps
try {
  console.log('Installing dependencies with legacy-peer-deps...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Install critical dependencies explicitly
try {
  console.log('Installing critical dependencies...');
  execSync('npm install --no-save tailwindcss postcss autoprefixer', { stdio: 'inherit' });
  console.log('Critical dependencies installed successfully');
} catch (error) {
  console.error('Error installing critical dependencies:', error);
  process.exit(1);
}

// Run the Next.js build
try {
  console.log('Running Next.js build...');
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Error during build:', error);
  process.exit(1);
}

console.log('Custom build script completed successfully'); 