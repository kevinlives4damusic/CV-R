const functions = require('firebase-functions');
const { https } = require('firebase-functions');
const next = require('next');
const express = require('express');

const app = express();
const nextjsApp = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
});
const handle = nextjsApp.getRequestHandler();

// Handle Next.js API routes
exports.nextjs = functions.https.onRequest(async (req, res) => {
  await nextjsApp.prepare();
  return handle(req, res);
});

// Specific function for API routes
exports.nextjsApi = functions.https.onRequest(async (req, res) => {
  await nextjsApp.prepare();
  
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Make sure the path starts with /api
  if (!req.path.startsWith('/api/')) {
    req.url = `/api${req.url}`;
  }
  
  console.log(`API request: ${req.method} ${req.url}`);
  return handle(req, res);
}); 