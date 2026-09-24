import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "3-6-172-250.sslip.io",
    "3.6.172.250.nip.io",
    "3.6.172.250",
    "localhost:3000",
    "10.121.226.91:3000"
  ],
};

export default nextConfig;
