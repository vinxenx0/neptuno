// src/app/layout.tsx
import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../app/global.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}