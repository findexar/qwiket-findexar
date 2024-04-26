/** @type {import('next').NextConfig} */
const nextConfig = {
    
    async redirects() {
        return [

  
          // Wildcard path matching
          {
            source: '/league/:leagueid',
            destination: '/:leagueid',
            permanent: true,
          },
          {
            source: '/pub/:path*',
            destination: '/:path*', // Matched parameters can be used in the destination
            permanent: true,
          },
          {
            source: '/pub',
            destination: '/', // Matched parameters can be used in the destination
            permanent: true,
          },
        ]
      },
};

export default nextConfig;
