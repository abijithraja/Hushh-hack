import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode to prevent double-firing of effects in dev
  // (getSession + fetchProfile were running twice, doubling auth init time)
  reactStrictMode: false,

  // Tree-shake heavy dependencies for smaller JS bundles & faster parsing
  experimental: {
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@supabase/ssr",
      "react-hot-toast",
    ],
  },

  // Proxy all /api/backend/* requests to the Express backend.
  // This means the browser ONLY ever talks to port 3000 (the forwarded port),
  // so mobile users and VS Code Port Forwarding all work seamlessly.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
