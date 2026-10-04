import type { NextConfig } from 'next';
import { OPTIMIZED_IMAGE_PATTERNS } from './lib/image-hosts';

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
    remotePatterns: OPTIMIZED_IMAGE_PATTERNS.map((pattern) => ({ ...pattern })),
  },
};

export default nextConfig;


