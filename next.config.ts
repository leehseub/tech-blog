import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/((?!admin|api).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "s-maxage=60, stale-while-revalidate=300",
        },
      ],
    },
  ],
};

export default nextConfig;
