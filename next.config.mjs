// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Add your config options here */

  images: {
    domains: [
      // === Add the Firebase Storage hostname here! ===
      "firebasestorage.googleapis.com",
      // If you have other domains you fetch images from, list them here
      // "another-image-source.com",
    ],
    // If you need to allow subdomains or match patterns, you might use 'remotePatterns' instead of 'domains'
    // depending on your Next.js version and specific needs, but 'domains' is common for specific hostnames.
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'firebasestorage.googleapis.com',
    //     port: '',
    //     pathname: '/v0/b/YOUR_STORAGE_BUCKET_NAME/**', // Adjust path if necessary
    //   },
    // ],
  },

  // You can add other Next.js configurations here if you have any
  // reactStrictMode: true,
};

// Using export default is fine
export default nextConfig;
