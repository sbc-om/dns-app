import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const lowResourceMode = process.env.LOW_RESOURCE_MODE === 'true';

const nextConfig: NextConfig = {
  // Next.js automatically detects src/ directory
  // Set turbopack root to current project directory
  turbopack: {
    root: __dirname,
  },
  output: 'standalone',
};

export default withPWA({
  dest: 'public',
  disable: lowResourceMode || process.env.NODE_ENV === 'development',
  register: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
})(nextConfig);
