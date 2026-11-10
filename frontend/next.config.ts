import type { NextConfig } from "next";

// Endereço real da API. O navegador nunca acessa esse endereço diretamente:
// ele chama /api/... no próprio site, e o Next repassa a chamada para a API.
// Assim o cookie de login fica no domínio do site, e o proxy.ts consegue lê-lo.
const API_URL = process.env.API_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
