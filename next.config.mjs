/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/pub',
        destination: '/',
        permanent: true,
      },
      // Wildcard path matching
      {
        source: '/pub/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
