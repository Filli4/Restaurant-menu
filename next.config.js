// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Add your other config options here if any */
  // reactStrictMode: true, // It's good practice to have this enabled

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // port: '', // Not needed for standard HTTPS
        // pathname: '/v0/b/YOUR_PROJECT_ID.appspot.com/o/**', // Optional: Be more specific if you want to restrict to your bucket/path
      },
      // Add other patterns if you fetch images from other domains
      // {
      //   protocol: 'https',
      //   hostname: 'another-image-source.com',
      // },
    ],
  },
};

export default nextConfig; // This is correct for ES Modules if your package.json has "type": "module"
// If not using "type": "module", you'd use: module.exports = nextConfig;