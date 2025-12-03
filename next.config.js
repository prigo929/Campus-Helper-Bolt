/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep API routes working (AI chat) by using the default output. Static export disables APIs.
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
