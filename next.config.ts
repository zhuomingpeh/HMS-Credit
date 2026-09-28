import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "128kb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    // Leave both hosts usable during Squarespace DNS propagation: its old apex
    // redirects to www. Enable only after all resolvers reach Vercel for the apex.
    if (process.env.CANONICAL_DOMAIN_REDIRECT !== "true") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hmsmoney.com" }],
        destination: "https://hmsmoney.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
