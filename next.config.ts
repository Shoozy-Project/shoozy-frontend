import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/storage/**',
          '**/uploads/**',
          '**/.next/**',
        ],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        // Backend local storage (original)
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        // Allow any HTTPS source for external category/brand image URLs
        protocol: 'https',
        hostname: '**',
      },
      {
        // Allow any HTTP source for development/local images
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;


