import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com', port: '', pathname: '/**' },
      // Local backend (in case absolute URLs are used)
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '5000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '5000', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/avatars/:path*',
        destination: 'http://localhost:4000/uploads/avatars/:path*',
      },
    ];
  },
};

export default nextConfig;
