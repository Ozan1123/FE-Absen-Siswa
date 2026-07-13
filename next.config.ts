import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api-absiswa.reihan.biz.id/api/:path*'
      },
    ];  
  },
};

export default nextConfig;
