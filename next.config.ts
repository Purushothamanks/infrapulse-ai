import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "exemption-blond-acute-blast.trycloudflare.com",
    "localhost:3000",
    "10.121.226.91:3000"
  ],
};

export default nextConfig;
