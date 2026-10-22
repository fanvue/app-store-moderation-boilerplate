import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `pg` is a Node driver with optional native bindings; keep it out of the bundle.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
