/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode in prod (keeps dev helpful)
  reactStrictMode: process.env.NODE_ENV !== "production",

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Minimize production build
  compress: true,

  // Disable Next.js telemetry
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize for mobile by disabling server-side HMR
  poweredByHeader: false,

  // Remove unnecessary headers to reduce payload size
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        {
          key: "Content-Security-Policy",
          value: "default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\' data:;",
        },
      ],
    },
  ],
};

// Optional bundle analysis: ANALYZE=true npm run build
if (process.env.ANALYZE === "true") {
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
