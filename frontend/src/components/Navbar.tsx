// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { motion } from "framer-motion";
import fetchAPI from "@/lib/api";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Icono de moneda amarilla
import Button from '@mui/material/Button'; // Botón estilizado de Material-UI

export default function Navbar() {
  const { user, credits, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);

  useEffect(() => {
    // Obtener anonUsername de localStorage
    const storedAnonUsername = localStorage.getItem("anonUsername");
    setAnonUsername(storedAnonUsername);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const disableCreditsRes = await fetchAPI("/v1/settings/disable_credits");
        const enableRegistrationRes = await fetchAPI("/v1/settings/enable_registration");
        setDisableCredits(disableCreditsRes.data === "true" || disableCreditsRes.data === true);
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
        setDisableCredits(false);
        setEnableRegistration(true);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="nav-bar fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold">
          Neptuno
        </Link>
        <div className="flex items-center space-x-4">
          {!disableCredits && credits > 0 && (
            <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm flex items-center">
              <MonetizationOnIcon style={{ color: 'gold', marginRight: '4px' }} />
              {credits}
            </span>
          )}
          {user?.rol === "admin" && (
            <div className="relative flex items-center">
              <Link href="/admin/configure" className="flex items-center hover:underline">
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
                    href="/admin/registry"
                    className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                    onClick={() => setSettingsOpen(false)}
                  >
                    📋 Registry
                  </Link>
                  <Link
                    href="/admin/users"
                    className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                    onClick={() => setSettingsOpen(false)}
                  >
                    👥 Users
                  </Link>
                </motion.div>
              )}
            </div>
          )}
          {user ? (
            <Link href="/user/dashboard" className="flex items-center hover:underline">
              👤 {user.username} 
            </Link>
          ) : anonUsername ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                👤 {anonUsername} 
              </span>
              <Link href="/user/auth/#login" className="btn-primary text-white ml-2"> 
                ¡Empezar!
              </Link>
            </div>
          ) : (
            <>

              <Link href="/user/auth/#login" className="hover:underline">
                Login
              </Link>
              {enableRegistration && (
                <Link href="/user/auth/#register" className="hover:underline">
                  Register
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}