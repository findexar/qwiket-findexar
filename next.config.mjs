import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.resolve.alias['@lib'] = path.join(__dirname, 'lib');
    config.resolve.alias['@components'] = path.join(__dirname, 'components');
    return config;
  },
  async redirects() {
    return [
      {
        source: '/pub/league/:league',
        destination: '/:league',
        permanent: true,
      },
      {
        source: '/pub/league/:league/team/:team',
        destination: '/:league/:team',
        permanent: true,
      },
      {
        source: '/pub/league/:league/team/:team/player/:player',
        destination: '/:league/:team/:player',
        permanent: true,
      },
    ]
  },
  // Add this new configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
  // Add this new middleware configuration
  experimental: {
    middleware: true,
  },
};

export default nextConfig;
