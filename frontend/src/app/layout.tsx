// frontend/src/app/layout.tsx
// Página de layout general de la app
"use client";

import { Metadata } from 'next';
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/web/Navbar";
import Footer from "@/components/web/Footer";
import "../app/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/user/auth") || pathname?.startsWith("/(auth)");

  const metadata: Metadata = {
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
  };

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <main className="flex-grow w-full pt-20"> {/* Added pt-16 for navbar spacing */}
            {children}
          </main>
          {!isAuthPage && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}