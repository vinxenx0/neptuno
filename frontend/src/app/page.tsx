// src/app/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  console.log("Renderizando HomePage, user:", user);

  const endpoints = [
    { path: "/info", label: "Get Info", protected: false },
    { path: "/consultar", label: "Consultar", protected: true },
    { path: "/reset-credits", label: "Reset Credits", protected: true, adminOnly: true },
    { path: "/example", label: "Example", protected: true },
  ];

  return (
    <div className="container p-6 fade-in">
      <h1 className="mb-6 text-center">Bienvenido a Neptuno</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {endpoints.map((endpoint) => {
          const isDisabled = endpoint.protected && (!user || (endpoint.adminOnly && user?.rol !== "admin"));
          return (
            <Link
              key={endpoint.path}
              href={endpoint.path}
              className={`${
                isDisabled ? "btn-disabled" : "btn-primary hover-grow"
              } text-center`}
            >
              {endpoint.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}