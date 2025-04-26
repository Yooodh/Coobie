// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // images: {
//   //   domains: [
//   //     'https://xivyzqrqnqznkqqkmhrc.supabase.co'
//   //   ],
//   // },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'https://xivyzqrqnqznkqqkmhrc.supabase.co',
//         port: '',
//         pathname: '/storage/v1/object/public/**',
//       },
//     ],
//   },
// };

// export default nextConfig;

// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xivyzqrqnqznkqqkmhrc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
