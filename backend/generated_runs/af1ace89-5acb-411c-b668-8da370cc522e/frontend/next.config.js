/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/todos',
        destination: 'http://localhost:8000/api/v1/todos',
      },
      {
        source: '/api/v1/todos/:id',
        destination: 'http://localhost:8000/api/v1/todos/:id',
      },
    ];
  },
};

module.exports = nextConfig;