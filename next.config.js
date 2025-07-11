/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado para permitir SPA dinámica
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configuración para manejar Mixed Content de forma más permisiva
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http: https:;"
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
