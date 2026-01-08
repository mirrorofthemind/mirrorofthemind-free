/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Isso ignora erros de linting durante o build na Vercel
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
