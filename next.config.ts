/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.css': ['postcss-loader'],
      },
    },
  },
};

export default nextConfig;
