import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "high-tion-best-futures.trycloudflare.com",
    "localhost:3000",
    "10.121.226.91:3000"
  ],
};

export default nextConfig;
