import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vercel-blob.com'],
  },
}

export default nextConfig

