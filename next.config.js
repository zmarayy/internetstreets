/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'internetstreets.uk'],
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  output: 'standalone',
}

module.exports = nextConfig
