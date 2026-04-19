/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    dirs: ['src'],
  },
  compiler: {
    styledComponents: false,
    emotion: false,
  },
};

module.exports = nextConfig;