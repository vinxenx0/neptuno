// src/app/layout.tsx
'use client'; // Añade esta directiva al inicio del archivo

import { ReactNode } from "react";
import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/web/Navbar";
import Footer from "@/components/web/Footer";
import "../app/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/user/auth');
  
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <main className="flex-grow pt-20">{children}</main>
          {!isAuthPage && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}