// src/components/Navbar.tsx
// src/components/Navbar.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav-bar fixed top-0 left-0 w-full z-10">
      <div className="container flex justify-between items-center">
        <Link href="/" className="nav-link text-2xl">
          Neptuno
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={async () => await logout()}
                className="nav-link"
              >
                Logout
              </button>
              <span className="bg-[var(--accent)] text-white rounded-full px-3 py-1 text-sm">
                {user.credits ?? 0} créditos
              </span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="nav-link flex items-center"
                >
                  <Link href="/profile" className="nav-link">
                    {user.username}
                  </Link>
                  <span className="ml-1">▼</span>
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
                  >
                    <Link href="/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Transacciones
                    </Link>
                    <Link href="/payment-methods" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Formas de Pago
                    </Link>
                    <Link href="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Cambiar Contraseña
                    </Link>
                    {user.rol === "admin" && (
                      <Link href="/configure" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Configuración
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </div>
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