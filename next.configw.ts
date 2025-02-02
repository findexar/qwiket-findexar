import type { NextConfig } from "next";

const nextConfig = {
    eslint: {
        // Disable ESLint during the build
        ignoreDuringBuilds: true,
    },
    // ... other configurations
};
export default nextConfig;
