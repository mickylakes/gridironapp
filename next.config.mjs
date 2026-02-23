import { withSentryConfig } from "@sentry/nextjs";

// Turbopack's dev server needs 'unsafe-eval' (source maps/HMR) and blob: workers.
// These are dev-only — the production webpack build needs neither.
const isDev = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  // Next.js requires 'unsafe-inline' for hydration scripts.
  // Dev (Turbopack) additionally needs 'unsafe-eval' for HMR source maps.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // React uses inline style={{}} everywhere — 'unsafe-inline' required.
  // fonts.googleapis.com serves the Google Fonts CSS (loaded by Sentry replay SDK).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Screenshots stored in Supabase; data: and blob: for canvas capture.
  "img-src 'self' data: blob: https://*.supabase.co",
  // API destinations: Supabase (DB + storage), Sentry (error ingest), Sleeper (player data).
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://api.sleeper.app",
  // fonts.gstatic.com serves the actual font files (Poppins/Open Sans via Sentry replay SDK).
  "font-src 'self' https://fonts.gstatic.com",
  // Block all plugins and iframing of this app.
  "object-src 'none'",
  "frame-ancestors 'none'",
  // Turbopack spins up a blob: web worker for HMR in development only.
  ...(isDev ? ["worker-src blob:"] : []),
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy",   value: CSP },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs when uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps so Sentry shows readable stack traces
  widenClientFileUpload: true,

  // Hides Sentry SDK internals from stack traces
  hideSourceMaps: true,

  // webpack.treeshake.removeDebugLogging replaces deprecated disableLogger
  // webpack.automaticVercelMonitors replaces deprecated automaticVercelMonitors
});
