// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, credits, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // Estado para el tema

  // Cargar el tema desde localStorage al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="nav-bar fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold">
          Neptuno
        </Link>
        <div className="flex items-center space-x-4">
          {/* Créditos */}
          <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm flex items-center">
            💳 {credits} créditos
          </span>

          {/* Botón para alternar tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user ? (
            <>
              {/* Settings (solo para admins) */}
              {user.rol === "admin" && (
                <div className="relative flex items-center">
                  <Link href="/configure" className="flex items-center hover:underline">
                    ⚙️ Settings
                  </Link>
                  <button onClick={() => setSettingsOpen(!settingsOpen)} className="ml-1">
                    <span>▼</span>
                  </button>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-10 right-0 w-48 submenu py-2 z-50"
                    >
                      <Link
                        href="/admin/errors"
                        className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                        onClick={() => setSettingsOpen(false)}
                      >
                        🐛 Errors
                      </Link>
                      <Link
                        href="/admin/logs"
                        className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                        onClick={() => setSettingsOpen(false)}
                      >
                        📝 Api Log
                      </Link>
                      <Link
                        href="/admin/transactions"
                        className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                        onClick={() => setSettingsOpen(false)}
                      >
                        🔄 Transactions
                      </Link>
                      <Link
                        href="/admin/sessions"
                        className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                        onClick={() => setSettingsOpen(false)}
                      >
                        🌐 Sessions
                      </Link>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Username con submenú */}
              <div className="relative flex items-center">
                <Link href="/profile" className="flex items-center hover:underline">
                  👤 {user.username}
                </Link>
                <button onClick={() => setMenuOpen(!menuOpen)} className="ml-1">
                  <span>▼</span>
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-10 right-0 w-48 submenu py-2 z-50"
                  >
                    <Link
                      href="/payments"
                      className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      💳 Pagos
                    </Link>
                    <Link
                      href="/payment-methods"
                      className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      💳 Formas de Pago
                    </Link>
                    <Link
                      href="/change-password"
                      className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      🔑 Contraseña
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}