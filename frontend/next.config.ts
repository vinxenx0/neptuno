// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 // Specified "headers" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
  // output: "export", // Habilita el modo estático para `next export`
 
  trailingSlash: true, // Asegura que los archivos se sirvan correctamente
  images: {
    unoptimized: true, // Necesario para que `next/image` funcione en modo export
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Optional: true to ignore ESLint warnings during build
  },

  
  
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  },
  // Para desarrollo
  allowedDevOrigins: [
    "*"
   // "https://localhost:3000",
    //"https://194.164.164.177:3000"
  ]

  


};

export default nextConfig;



//module.exports = {
//  env: {
//    NEXT_PUBLIC_API_URL: "https://172.20.0.4/api",
//  },
//};
