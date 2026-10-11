import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      { source: "/actividad", destination: "/novedades", permanent: true },
      { source: "/actividad/:slug", destination: "/novedades/:slug", permanent: true },
      { source: "/cursos", destination: "/propuestas", permanent: true },
      { source: "/cursos/:slug", destination: "/propuestas/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
