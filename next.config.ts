import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
