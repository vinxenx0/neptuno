// frontend/src/app/layout.tsx
"use client";

import { Metadata } from 'next';
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/web/Navbar";
import Footer from "@/components/web/Footer";
import CookieConsentBanner from '@/components/gdpr/CookieConsentBanner';
import "../app/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/(auth)");

  const [bannerVisible, setBannerVisible] = useState(false);

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <main className="flex-grow w-full pt-20 pb-16 md:pb-0">
            {children}
          </main>
          {!isAuthPage && <Footer />}
        </AuthProvider>

        {/* Banner y botón de cookies */}
        <CookieConsentBanner
          onClose={() => setBannerVisible(false)}
          onShow={() => setBannerVisible(true)}
        />

        {!bannerVisible && (
          <button
            onClick={() => window.location.href = '/gdpr/'}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hidden md:block"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#333',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 9999,
            }}
          >
            Privacy Center
          </button>
        )}
      </body>
    </html>
  );
}
