// src/components/Navbar.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  console.log("Renderizando Navbar, user:", user);

  return (
    <nav className="nav-bar fixed top-0 left-0 w-full z-10">
      <div className="container flex justify-between items-center">
        <Link href="/" className="nav-link text-2xl">
          Neptuno
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="nav-link">
                {user.username}
              </Link>
              <Link href="/payments" className="nav-link">
                Pagos
              </Link>
              <Link href="/payment-methods" className="nav-link">
                Métodos de Pago
              </Link>
              {user.rol === "admin" && (
                <Link href="/configure" className="nav-link">
                  Configurar
                </Link>
              )}
              <button
                onClick={async () => await logout()}
                className="nav-link"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}