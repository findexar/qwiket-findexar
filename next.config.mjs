/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
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
};

export default nextConfig;
