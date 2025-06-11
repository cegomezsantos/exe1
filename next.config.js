/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Netlify
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Evitar problemas de SSR
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig 