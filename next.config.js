// next.config.js
import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // This is correct
        port: '',
        // THIS IS THE CRITICAL PART - ensure it matches your actual URL structure
        pathname: '/v0/b/restaurant-menu-d551e.firebasestorage.app/o/**',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);