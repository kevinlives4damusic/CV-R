/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add support for PDF.js worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Improve module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  // Configure for static export
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // Experimental features
  experimental: {
    // Improve module resolution
    esmExternals: 'loose',
    // Improve build stability
    turbotrace: {
      logLevel: 'error',
    },
  },
  
  // Increase build timeout
  staticPageGenerationTimeout: 180,
}

module.exports = nextConfig