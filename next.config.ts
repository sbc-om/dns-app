import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  // Next.js automatically detects src/ directory
  // Empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
});

export default pwaConfig(nextConfig);
