/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dev and production artifacts separate so running `next build`
  // while `next dev` is active does not corrupt live dev assets.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
