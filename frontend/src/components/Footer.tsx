// src/components/Footer.tsx
// src/components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const handleLoad = () => {
      const endTime = performance.now();
      setLoadTime(parseFloat((endTime - startTime).toFixed(2)));
    };

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  return (
    <footer className="footer mt-4">
      <div className="container mx-auto grid grid-cols-4 gap-8 py-8">
        <div>
          <h3 className="font-bold mb-2">Acerca de</h3>
          <ul>
            <li><Link href="/about" className="hover:underline">Sobre Nosotros</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Legal</h3>
          <ul>
            <li><Link href="/privacy" className="hover:underline">Privacidad</Link></li>
            <li><Link href="/legal" className="hover:underline">Términos Legales</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Soporte</h3>
          <ul>
            <li><Link href="/contact" className="hover:underline">Contacto</Link></li>
          </ul>
        </div>
        <div className="text-right">
          <p className="text-sm">Tiempo de carga: {loadTime} ms</p>
          <p className="text-sm">© 2025 Neptuno. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}