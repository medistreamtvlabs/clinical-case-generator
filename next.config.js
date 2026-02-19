/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // File size limits
  serverRuntimeConfig: {
    // Will only be available on the server side
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
