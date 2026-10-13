import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "mygovthub.web.app",
    "mygovthub.firebaseapp.com",
    "localhost:3000",
    "10.121.226.91:3000"
  ],
};

export default nextConfig;
