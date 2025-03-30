// frontend/src/app/about/layout.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageLink {
  slug: string;
  title: string;
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean).pop() || "us";

  const pages: PageLink[] = [
    { slug: "us", title: "Sobre Nosotros" },
    { slug: "policy", title: "Política de Privacidad" },
    { slug: "contact", title: "Contacto" },
    { slug: "privacy", title: "Privacidad" },
  ];

  return (
    <div className="container mx-auto p-6 min-h-screen flex gap-6">
      <aside className="w-1/4 bg-[var(--background)] p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)] border-b pb-2">
          Acerca de
        </h2>
        <ul className="space-y-3">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={`/about/${page.slug}`}
                className={`block px-4 py-2 rounded-md transition-all duration-200 ${
                  currentPage === page.slug
                    ? "bg-[var(--accent)] text-white font-semibold shadow-md"
                    : "text-[var(--foreground)] hover:bg-[var(--accent-light)] hover:text-[var(--foreground)]"
                }`}
                prefetch={false} // Mejor para páginas estáticas
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="w-3/4 p-6 bg-white rounded-lg shadow-lg">
        {children}
      </main>
    </div>
  );
}