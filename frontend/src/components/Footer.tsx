// src/components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSun, FaMoon } from "react-icons/fa"; // Iconos para tema

export default function Footer() {
  const [loadTime, setLoadTime] = useState(0);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    const startTime = performance.now();
    const handleLoad = () => {
      const endTime = performance.now();
      setLoadTime(parseFloat((endTime - startTime).toFixed(2)));
    };

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <footer className="footer mt-4">
      <div className="container mx-auto grid grid-cols-4 gap-8 py-8">
        <div>
          <h3 className="font-bold mb-2">Acerca de</h3>
          <ul>
            <li><Link href="/about/us" className="hover:underline">Sobre Nosotros</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Legal</h3>
          <ul>
            <li><Link href="/about/privacy" className="hover:underline">Privacidad</Link></li>
            <li><Link href="/about/legal" className="hover:underline">Términos Legales</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Soporte</h3>
          <ul>
            <li><Link href="/about/contact" className="hover:underline">Contacto</Link></li>
          </ul>
        </div>
        <div className="text-right">
          <p className="text-sm">Tiempo de carga: {loadTime} ms</p>
          <p className="text-sm">© 2025 Neptuno. Todos los derechos reservados.</p>
          <button
            onClick={toggleTheme}
            className="mt-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </footer>
  );
}