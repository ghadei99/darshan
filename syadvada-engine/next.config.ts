import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin tracing to this app when the monorepo has multiple lockfiles.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
