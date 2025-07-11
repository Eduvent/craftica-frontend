/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado para permitir SPA dinámica
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configuración para manejar Mixed Content
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests"
          },
        ],
      },
    ];
  },
  // Configuración para evitar errores de prerenderizado
  trailingSlash: false,
  generateEtags: false,
  // Configuración para evitar errores de build
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
