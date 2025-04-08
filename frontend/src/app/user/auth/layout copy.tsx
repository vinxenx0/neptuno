// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--background)]">
      <header className="p-4 text-center">
        <a href="/" className="text-2xl font-bold text-[var(--foreground)]">
          Neptuno
        </a>
      </header>
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-gray-600">
        © 2025 Neptuno. Todos los derechos reservados.
      </footer>
    </div>
  );
}