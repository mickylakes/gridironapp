import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your existing Next.js config goes here
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
