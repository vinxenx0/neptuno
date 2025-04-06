// src/app/layout.tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/web/Navbar";
import Footer from "@/components/web/Footer";
import "../app/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/user/auth");

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8 xl:px-12">
            {children}
          </main>
          {!isAuthPage && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}