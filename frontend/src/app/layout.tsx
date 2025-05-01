// frontend/src/app/layout.tsx
"use client";

import { Metadata } from 'next';
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/web/Navbar";
import Footer from "@/components/web/Footer";
import "../app/global.css";
import CookieConsentBanner from '@/components/gdpr/CookieConsentBanner';

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
          <main className="flex-grow w-full pt-20 pb-16 md:pb-0">
            {children}
          </main>
          {!isAuthPage && <Footer />}
        </AuthProvider>

{/* Banner y botón de cookies */}
<CookieConsentBanner onClose={() => {}} />
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


      </body>
    </html>
  );
}
