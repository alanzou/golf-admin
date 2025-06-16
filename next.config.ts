import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in development to avoid Prisma issues
  productionBrowserSourceMaps: false,
  
  // Improve webpack configuration for Prisma
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable source maps for development to avoid Prisma runtime issues
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
