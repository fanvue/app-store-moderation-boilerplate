import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `pg` is a Node driver with optional native bindings; keep it out of the bundle.
  // `kysely` stays out too, so a migration file Node loads on its own shares
  // the same copy as the app.
  serverExternalPackages: ['pg', 'kysely'],
}

export default nextConfig
